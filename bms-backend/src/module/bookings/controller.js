import ApiResponse from "../../common/config/utils/ApiResponse.js";
import { bookSeatService, getMyBookingsService } from "./services.js";

const bookSeatController = async (req, res) => {
    const response = await bookSeatService(req.userId, req.body);
    return ApiResponse.created(res, "Seat booked successfully", response);
};

const getMyBookingsController = async (req, res) => {
    const bookings = await getMyBookingsService(req.userId);
    return ApiResponse.ok(res, "Bookings fetched successfully", bookings);
};

export {
    bookSeatController,
    getMyBookingsController
};
