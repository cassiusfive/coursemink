import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

import router from "./routes/v1/courses.js";

app.use(router);

app.listen(process.env.PORT, () => {
	console.log(`Server is running on port ${process.env.PORT}`);
});