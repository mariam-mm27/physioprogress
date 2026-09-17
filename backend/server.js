
const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const chalk = require("chalk");

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                chalk.bgGreen(`Server is running on port ${PORT}`)
            );
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();

module.exports = app;

