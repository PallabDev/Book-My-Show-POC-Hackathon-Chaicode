import db from "../../common/config/db.js";
import ApiError from "../../common/config/utils/ApiError.js";

const DAILY_SHOW_TIMES = ["10:00", "13:30", "17:00", "20:30"];
const SEATS_PER_SHOW = 50;

function toDateOnlyString(value) {
    return new Date(value).toISOString().slice(0, 10);
}

function getDateRange(startDate, endDate) {
    const dates = [];
    const current = new Date(`${startDate}T00:00:00`);
    const last = new Date(`${endDate}T00:00:00`);

    while (current <= last) {
        dates.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

const createMovieService = async (adminUserId, payload) => {
    const client = await db.connect();

    try {
        const startDate = toDateOnlyString(payload.startDate);
        const endDate = toDateOnlyString(payload.endDate);

        if (endDate < startDate) {
            throw ApiError.badRequest("End date must be greater than or equal to start date");
        }

        await client.query("BEGIN");

        const movieResult = await client.query(
            `
                INSERT INTO movies (
                    title,
                    description,
                    poster_url,
                    language,
                    genre,
                    duration_minutes,
                    start_date,
                    end_date,
                    created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `,
            [
                payload.title,
                payload.description,
                payload.posterUrl,
                payload.language,
                payload.genre,
                payload.durationMinutes,
                startDate,
                endDate,
                adminUserId
            ]
        );

        const movie = movieResult.rows[0];
        const dateRange = getDateRange(startDate, endDate);
        let generatedShows = 0;

        for (const showDate of dateRange) {
            for (const showTime of DAILY_SHOW_TIMES) {
                const showResult = await client.query(
                    `
                        INSERT INTO shows (
                            movieid,
                            show_date,
                            show_time,
                            starts_at,
                            show_price
                        )
                        VALUES ($1, $2, $3, $4, $5)
                        RETURNING *
                    `,
                    [
                        movie.movieid,
                        showDate,
                        showTime,
                        `${showDate} ${showTime}:00`,
                        payload.showPrice
                    ]
                );

                const show = showResult.rows[0];

                await client.query(
                    `
                        INSERT INTO show_seats (showid, seat_number, seat_label)
                        SELECT
                            $1,
                            seat_no,
                            CHR(65 + ((seat_no - 1) / 10)) || (((seat_no - 1) % 10) + 1)::text
                        FROM generate_series(1, $2) AS seat_no
                    `,
                    [show.showid, SEATS_PER_SHOW]
                );

                generatedShows += 1;
            }
        }

        await client.query("COMMIT");

        return {
            movie,
            generatedShows,
            generatedSeats: generatedShows * SEATS_PER_SHOW,
            dailyShowTimes: DAILY_SHOW_TIMES
        };
    } catch (error) {
        await client.query("ROLLBACK");

        if (error instanceof ApiError) {
            throw error;
        }

        console.error("Create movie error:", error);
        throw ApiError.internal("Failed to create movie");
    } finally {
        client.release();
    }
};

const listMoviesService = async () => {
    try {
        const result = await db.query(
            `
                SELECT
                    m.movieid,
                    m.title,
                    m.description,
                    m.poster_url,
                    m.language,
                    m.genre,
                    m.duration_minutes,
                    m.start_date,
                    m.end_date,
                    m.is_active,
                    m.created_at,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'showId', s.showid,
                                'showDate', s.show_date,
                                'showTime', s.show_time,
                                'startsAt', s.starts_at,
                                'showPrice', s.show_price,
                                'screenName', s.screen_name
                            )
                            ORDER BY s.starts_at
                        ) FILTER (WHERE s.showid IS NOT NULL),
                        '[]'::json
                    ) AS shows
                FROM movies m
                LEFT JOIN shows s
                    ON s.movieid = m.movieid
                   AND s.starts_at >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
                WHERE m.is_active = TRUE
                GROUP BY m.movieid
                ORDER BY m.start_date ASC, m.created_at DESC
            `
        );

        return result.rows;
    } catch (error) {
        console.error("List movies error:", error);
        throw ApiError.internal("Failed to fetch movies");
    }
};

export {
    createMovieService,
    listMoviesService
};
