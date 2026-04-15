import db from "../../common/config/db.js";
import ApiError from "../../common/config/utils/ApiError.js";

const getShowSeatsService = async (showId) => {
    try {
        const showResult = await db.query(
            `
                SELECT
                    s.showid,
                    s.show_date,
                    s.show_time,
                    s.starts_at,
                    s.show_price,
                    s.screen_name,
                    m.movieid,
                    m.title,
                    m.description,
                    m.poster_url,
                    m.language,
                    m.genre,
                    m.duration_minutes
                FROM shows s
                INNER JOIN movies m ON m.movieid = s.movieid
                WHERE s.showid = $1
            `,
            [showId]
        );

        if (showResult.rows.length === 0) {
            throw ApiError.notFound("Show not found");
        }

        const seatsResult = await db.query(
            `
                SELECT
                    seatid,
                    seat_number,
                    seat_label,
                    seat_status,
                    booked_at
                FROM show_seats
                WHERE showid = $1
                ORDER BY seat_number
            `,
            [showId]
        );

        const seats = seatsResult.rows;
        const bookedSeats = seats.filter((seat) => seat.seat_status === "booked").length;

        return {
            show: showResult.rows[0],
            summary: {
                totalSeats: seats.length,
                bookedSeats,
                availableSeats: seats.length - bookedSeats
            },
            seats
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        console.error("Get show seats error:", error);
        throw ApiError.internal("Failed to fetch show seats");
    }
};

export {
    getShowSeatsService
};
