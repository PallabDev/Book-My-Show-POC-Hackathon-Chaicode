import { Router } from "express";
import { USER_ROLES } from "../../common/constants/roles.js";
import { authenticate, checkRole, validateDto } from "../auth/middleware.js";
import { createMovieController, listMoviesController } from "./controller.js";
import { CreateMovieDto } from "./dto.js";

const router = Router();

router.get("/", listMoviesController);
router.post("/", authenticate, checkRole([USER_ROLES.ADMIN]), validateDto(CreateMovieDto), createMovieController);

export default router;
