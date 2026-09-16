const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const app = require("./app");
const chalk = require("chalk");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(chalk.bgGreen(`Server is running on port ${PORT}`));
});