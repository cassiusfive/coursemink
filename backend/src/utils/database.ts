import dotenv from 'dotenv';
import pg from "pg";
dotenv.config();

const pool = new pg.Pool({
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});

export default pool;
