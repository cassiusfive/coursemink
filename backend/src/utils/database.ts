import dotenv from 'dotenv';
import { Pool } from "pg";
dotenv.config();

const pool = new Pool({
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000
});

export default pool;
