require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const chalk = require("chalk");
const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(chalk.bgGreen(`Server is running on port ${PORT}`));
});