"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const auth_1 = __importDefault(require("./routes/auth"));
const chat_1 = __importDefault(require("./routes/chat"));
const errorhandler_1 = __importDefault(require("./middleware/errorhandler"));
const qdrantClient_1 = require("./services/qdrantClient");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5001;
// Rate limiting - DDoS Prevention
// General limiter: 100 requests per 15 minutes
const generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => process.env.NODE_ENV === "development",
});
// Strict limiter for search: 30 requests per minute
const searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: "Too many search requests, please try again later.",
    skip: (req) => process.env.NODE_ENV === "development",
});
// Security Headers with Helmet
app.use((0, helmet_1.default)({
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
}));
// Compression
app.use((0, compression_1.default)());
// CORS - Fixed (was configured twice)
const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "http://localhost:5173",
    "http://localhost:5174",
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("CORS origin not allowed"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// JSON Parser
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Apply general rate limiter to all routes
app.use(generalLimiter);
// Security Response Headers
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
});
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/jobs", searchLimiter, jobs_1.default);
app.use("/api/chat", chat_1.default);
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// Error handler
app.use(errorhandler_1.default);
const startServer = async () => {
    await (0, db_1.default)();
    await (0, qdrantClient_1.initializeQdrantCollection)();
    const basePort = Number(process.env.PORT) || PORT;
    let currentPort = basePort;
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        try {
            await new Promise((resolve, reject) => {
                const server = app.listen(currentPort, () => {
                    console.log(`🚀 Server running on port ${currentPort}`);
                    console.log(`🔒 Security features: HTTPS headers, Rate limiting, DDoS prevention, CORS validated`);
                    resolve();
                });
                server.on("error", (error) => {
                    reject(error);
                });
            });
            return;
        }
        catch (error) {
            if (error?.code === "EADDRINUSE") {
                console.warn(`Port ${currentPort} is in use, trying ${currentPort + 1}`);
                currentPort += 1;
                continue;
            }
            console.error("Server startup error:", error);
            process.exit(1);
        }
    }
    console.error(`Unable to bind server after ${maxAttempts} attempts starting at port ${basePort}.`);
    process.exit(1);
};
startServer();
//# sourceMappingURL=server.js.map