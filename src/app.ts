import express from "express";
import dotenv from "dotenv";
import twitchRoutes from "./routes/twitchRoutes";

dotenv.config();

const app = express();

// Middleware (if needed)
// app.use(express.json());

app.use("/twitch", twitchRoutes);

export { app };
