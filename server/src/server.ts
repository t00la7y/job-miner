import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import connectDB from "./config/db";
import jobsRouter from "./routes/jobs";
import errorHandler from "./middleware/errorhandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/jobs", jobsRouter);
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Error handler
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
