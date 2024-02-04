import pool from "../utils/database.js";
import { Professor } from "../shared.types.js";

export default class ProfServices {
    static async insertProf(prof: Partial<Professor>): Promise<number> {
        const res = await pool.query(
            `INSERT INTO professor(name, email, avg_rating, avg_difficulty, num_ratings) VALUES($1, $2, $3, $4, $5) RETURNING id`,
            [
                prof.name,
                prof.email,
                prof.avg_rating,
                prof.avg_difficulty,
                prof.num_ratings,
            ]
        );
        return +res.rows[0].id;
    }
}
