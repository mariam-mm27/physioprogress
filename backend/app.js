const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const express = require("express");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const exercisePlanRoutes = require("./routes/exercisePlanRoutes");
const sessionLogRoutes = require("./routes/sessionLogRoutes");
const userRoutes = require("./routes/UserRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const exerciseDBRoutes = require("./routes/exerciseDBRoutes");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");
const helmet = require("helmet");
const cors = require("cors");
const expressLimit = require("express-rate-limit");

const app = express();

// Logging middleware
app.use(morgan("dev"));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS 
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowed = [
      process.env.CORS_ORIGIN,
      "http://localhost:4200",
      "http://localhost:8000",
      "http://127.0.0.1:4200",
      "http://127.0.0.1:8000"
    ].filter(Boolean);

    if (allowed.includes(origin) || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Rate limiting
const limiter = expressLimit.rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 300,                 // 50 is too tight for active UI testing
  standardHeaders: true,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Static files
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", exercisePlanRoutes);
app.use("/api", sessionLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", exerciseDBRoutes);

// for test server 
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Error Handling Middleware
app.use(errorHandler);

// Connect to Database
connectDB();

module.exports = app;
