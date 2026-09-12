require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

connectDB()

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})
