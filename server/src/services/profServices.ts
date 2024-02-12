import pool from "../utils/database.js";
import { Professor } from "../shared.types.js";

export default class ProfServices {
    static async insertProf(prof: Partial<Professor>): Promise<number> {
        const res = await pool.query(
            `INSERT INTO professor(name, avg_rating, avg_difficulty, num_ratings) VALUES($1, $2, $3, $4) RETURNING id`,
            [prof.name, prof.avgRating, prof.avgDifficulty, prof.numRatings]
        );
        return +res.rows[0].id;
    }
}
