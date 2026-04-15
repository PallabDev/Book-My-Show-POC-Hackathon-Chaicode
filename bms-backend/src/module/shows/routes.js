import { Router } from "express";
import { validateDto } from "../auth/middleware.js";
import { getShowSeatsController } from "./controller.js";
import { ShowIdParamDto } from "./dto.js";

const router = Router();

router.get("/:showId/seats", validateDto(ShowIdParamDto, "params"), getShowSeatsController);

export default router;
