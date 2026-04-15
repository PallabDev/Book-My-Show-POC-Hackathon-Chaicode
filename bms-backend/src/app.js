import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./module/auth/routes.js";
import movieRoutes from "./module/movies/routes.js";
import showRoutes from "./module/shows/routes.js";
import bookingRoutes from "./module/bookings/routes.js";
import db from "./common/config/db.js";

const app = express()

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const serverHandler = () => {
    app.use(express.json({ limit: "16kb" }))
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser());
    app.use(cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(null, false);
        },
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        optionsSuccessStatus: 204
    }));

    app.get("/", async (_, res) => {
        try {
            const client = await db.connect();
            client.release();
        }
        catch (error) {
            console.log("DB Connection Error:", error.message);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            })
        }
        res.status(200).json({
            success: true,
            message: "BMS backend is running"
        })
    })
    app.use("/api/auth", authRoutes)
    app.use("/api/movies", movieRoutes)
    app.use("/api/shows", showRoutes)
    app.use("/api/bookings", bookingRoutes)
    app.use((req, res) => {
        return res.status(404).json({
            success: false,
            message: "Route not found"
        })
    })
    app.use((err, _, res, next) => {
        const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500
        const message = typeof err?.message === "string" ? err.message : "Internal server error"

        return res.status(statusCode).json({
            success: false,
            message
        })
    })
    return app;
}

export default serverHandler;
