import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.resolve(__dirname, "../../../../migrations");

async function ensureMigrationsTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

async function getPendingMigrations(client) {
    const allEntries = await readdir(migrationsDirectory, { withFileTypes: true });
    const filenames = allEntries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
        .map((entry) => entry.name)
        .sort((left, right) => left.localeCompare(right));

    const executedResult = await client.query("SELECT filename FROM schema_migrations");
    const executed = new Set(executedResult.rows.map((row) => row.filename));

    return filenames.filter((filename) => !executed.has(filename));
}

async function runMigrations() {
    const client = await db.connect();
    let isTransactionOpen = false;

    try {
        await ensureMigrationsTable(client);
        const pendingMigrations = await getPendingMigrations(client);

        if (pendingMigrations.length === 0) {
            console.log("No pending migrations");
            return;
        }

        for (const filename of pendingMigrations) {
            const fullPath = path.join(migrationsDirectory, filename);
            const sql = await readFile(fullPath, "utf8");

            await client.query("BEGIN");
            isTransactionOpen = true;
            await client.query(sql);
            await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [filename]);
            await client.query("COMMIT");
            isTransactionOpen = false;

            console.log(`Applied migration: ${filename}`);
        }
    } catch (error) {
        if (isTransactionOpen) {
            await client.query("ROLLBACK");
        }
        throw error;
    } finally {
        client.release();
    }
}

export default runMigrations;
