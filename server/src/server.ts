import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db";
import jobsRouter from "./routes/jobs";
import authRouter from "./routes/auth";
import chatRouter from "./routes/chat";
import errorHandler from "./middleware/errorhandler";
import { initializeQdrantCollection } from "./services/qdrantClient";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

// Rate limiting - DDoS Prevention
// General limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === "development",
});

// Strict limiter for search: 30 requests per minute
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: "Too many search requests, please try again later.",
  skip: (req) => process.env.NODE_ENV === "development",
});

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "https://via.placeholder.com"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// Compression
app.use(compression());

// CORS - Fixed (was configured twice)
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// JSON Parser
app.use(express.json());
app.use(cookieParser());

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Security Response Headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()",
  );
  next();
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/jobs", searchLimiter, jobsRouter);
app.use("/api/chat", chatRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  await initializeQdrantCollection();

  const basePort = Number(process.env.PORT) || PORT;
  let currentPort = basePort;
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(currentPort, () => {
          console.log(`🚀 Server running on port ${currentPort}`);
          console.log(
            `🔒 Security features: HTTPS headers, Rate limiting, DDoS prevention, CORS validated`,
          );
          resolve();
        });

        server.on("error", (error) => {
          reject(error);
        });
      });
      return;
    } catch (error: any) {
      if (error?.code === "EADDRINUSE") {
        console.warn(
          `Port ${currentPort} is in use, trying ${currentPort + 1}`,
        );
        currentPort += 1;
        continue;
      }

      console.error("Server startup error:", error);
      process.exit(1);
    }
  }

  console.error(
    `Unable to bind server after ${maxAttempts} attempts starting at port ${basePort}.`,
  );
  process.exit(1);
};

startServer();
