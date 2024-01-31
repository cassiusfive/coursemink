import dotenv from "dotenv";
import pg from "pg";
dotenv.config();

const connectionString = process.env.DATABASE_URI;

const pool = new pg.Pool({
    connectionString,
});

export default pool;
