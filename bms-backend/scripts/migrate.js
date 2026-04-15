import "dotenv/config";
import runMigrations from "../src/common/config/db/migrate.js";

runMigrations()
    .then(() => {
        console.log("Migrations completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Migration failed:", error.message);
        process.exit(1);
    });
