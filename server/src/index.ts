import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chat";
import { errorHandler } from "./middleware/errorHandler";
import { generalLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

connectDB();

app.use(helmet());
console.log("|----Frontend URL: ", process.env.FRONTEND_URL);
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(cookieParser());

app.use("/api/", generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Server is running!",
        timestamp: new Date().toISOString(),
    });
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
