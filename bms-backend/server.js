import "dotenv/config";
import { createServer } from "node:http";
import serverHandler from "./src/app.js";
import db from "./src/common/config/db.js";
import runMigrations from "./src/common/config/db/migrate.js";
const startServer = async () => {
    try {
        const client = await db.connect()
        console.log("DB Connected");
        client.release();

        await runMigrations();

        const server = createServer(serverHandler());
        const PORT = process.env.PORT || 4000;
        server.listen(PORT, () => {
            console.log("Server Running on PORT", PORT);
        });

    } catch (error) {
        console.error("Server failed to start (DB error):", error.message);
        process.exit(1);
    }
};

startServer();
