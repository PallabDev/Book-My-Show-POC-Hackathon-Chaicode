import ApiResponse from "../../common/config/utils/ApiResponse.js";
import { createMovieService, listMoviesService } from "./services.js";

const createMovieController = async (req, res) => {
    const response = await createMovieService(req.userId, req.body);
    return ApiResponse.created(res, "Movie created successfully", response);
};

const listMoviesController = async (req, res) => {
    const movies = await listMoviesService();
    return ApiResponse.ok(res, "Movies fetched successfully", movies);
};

export {
    createMovieController,
    listMoviesController
};
