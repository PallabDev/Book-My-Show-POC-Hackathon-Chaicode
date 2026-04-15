import { Router } from "express";
import { authenticate, checkRole, validateDto } from "../auth/middleware.js";
import { bookSeatController, getMyBookingsController } from "./controller.js";
import { BookSeatDto } from "./dto.js";

const router = Router();

router.get("/me", authenticate, checkRole(["admin", "user"]), getMyBookingsController);
router.post("/", authenticate, checkRole(["admin", "user"]), validateDto(BookSeatDto), bookSeatController);

export default router;
