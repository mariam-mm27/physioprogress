require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const exercisePlanRoutes = require("./routes/exercisePlanRoutes");
const sessionLogRoutes = require("./routes/sessionLogRoutes");
const userRoutes = require("./routes/UserRoutes");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");
const ExpressMongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cors = require("cors");
const expressLimit = require("express-rate-limit");
const hpp = require("express-hpp");

const app = express();

// Logging middleware
app.use(morgan("dev"));

// Security middlewares
app.use(helmet());
app.use(ExpressMongoSanitize());
app.use(hpp());

// CORS - configurable from env or default
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:8000",
  credentials: true
}));

// Rate limiting
const limiter = expressLimit.rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 50, // 50 requests per window
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Request size limits
app.use(express.json({ limit: "10mb" })); // 10mb
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Static files
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", exercisePlanRoutes);
app.use("/api", sessionLogRoutes);
app.use("/api/users", userRoutes);

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Error Handling Middleware
app.use(errorHandler);

// Connect to Database
connectDB();

module.exports = app;
