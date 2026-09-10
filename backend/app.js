require("dotenv").config();
const connectDB = require("./config/db");
const express = require("express");
const router = require("./routes/routes");
const app = express();
app.use(express.json());
app.use("/api",router);

connectDB()

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
})

