import db from "../../common/config/db.js";
import ApiError from "../../common/config/utils/ApiError.js";

const bookSeatService = async (userId, payload) => {
    const client = await db.connect();

    try {
        await client.query("BEGIN");

        const seatResult = await client.query(
            `
                SELECT
                    ss.seatid,
                    ss.seat_label,
                    ss.seat_status,
                    s.showid,
                    s.starts_at,
                    s.show_price,
                    m.title
                FROM show_seats ss
                INNER JOIN shows s ON s.showid = ss.showid
                INNER JOIN movies m ON m.movieid = s.movieid
                WHERE ss.showid = $1
                  AND ss.seat_label = $2
                  AND ss.seat_status = 'available'
                FOR UPDATE
            `,
            [payload.showId, payload.seatLabel]
        );

        if (seatResult.rows.length === 0) {
            throw ApiError.conflict("Seat is already booked or unavailable");
        }

        const seat = seatResult.rows[0];

        if (new Date(seat.starts_at) <= new Date()) {
            throw ApiError.badRequest("This show has already started");
        }

        const bookingResult = await client.query(
            `
                INSERT INTO bookings (userid, showid, show_seat_id, amount_paid)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `,
            [userId, payload.showId, seat.seatid, seat.show_price]
        );

        await client.query(
            `
                UPDATE show_seats
                SET seat_status = 'booked',
                    booked_by = $1,
                    booked_at = CURRENT_TIMESTAMP
                WHERE seatid = $2
            `,
            [userId, seat.seatid]
        );

        await client.query("COMMIT");

        return {
            booking: {
                ...bookingResult.rows[0],
                seatLabel: seat.seat_label,
                movieTitle: seat.title,
                startsAt: seat.starts_at
            }
        };
    } catch (error) {
        await client.query("ROLLBACK");

        if (error instanceof ApiError) {
            throw error;
        }

        if (error?.code === "23505") {
            throw ApiError.conflict("Seat is already booked");
        }

        console.error("Book seat error:", error);
        throw ApiError.internal("Failed to book seat");
    } finally {
        client.release();
    }
};

const getMyBookingsService = async (userId) => {
    try {
        const result = await db.query(
            `
                SELECT
                    b.bookingid,
                    b.booking_status,
                    b.amount_paid,
                    b.booked_at,
                    ss.seat_label,
                    s.showid,
                    s.show_date,
                    s.show_time,
                    s.starts_at,
                    s.screen_name,
                    m.movieid,
                    m.title,
                    m.language,
                    m.genre
                FROM bookings b
                INNER JOIN show_seats ss ON ss.seatid = b.show_seat_id
                INNER JOIN shows s ON s.showid = b.showid
                INNER JOIN movies m ON m.movieid = s.movieid
                WHERE b.userid = $1
                ORDER BY b.booked_at DESC
            `,
            [userId]
        );

        return result.rows;
    } catch (error) {
        console.error("Get my bookings error:", error);
        throw ApiError.internal("Failed to fetch bookings");
    }
};

export {
    bookSeatService,
    getMyBookingsService
};
