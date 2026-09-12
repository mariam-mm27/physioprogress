require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const exercisePlanRoutes = require("./routes/exercisePlanRoutes");
const userRoutes = require("./routes/UserRoutes");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", exercisePlanRoutes);
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