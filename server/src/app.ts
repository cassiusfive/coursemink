import dotenv from "dotenv";
import express from "express";
import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

import courseRouter from "./routes/v1/courses.js";
import scheduleRouter from "./routes/v1/schedules.js";

app.use("/v1/courses", courseRouter);
app.use("/v1/schedules", scheduleRouter);

app.listen(+process.env.PORT!, process.env.HOST!, () => {
    console.log(
        `Server is running on http://${process.env.HOST!}:${process.env.PORT!}`
    );
});
