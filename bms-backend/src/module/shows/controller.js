import ApiResponse from "../../common/config/utils/ApiResponse.js";
import { getShowSeatsService } from "./services.js";

const getShowSeatsController = async (req, res) => {
    const response = await getShowSeatsService(req.params.showId);
    return ApiResponse.ok(res, "Show seats fetched successfully", response);
};

export {
    getShowSeatsController
};
