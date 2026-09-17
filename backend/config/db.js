const mongoose = require("mongoose")
const chalk = require("chalk")

async function connectDB () {
    const con = await mongoose.connect(process.env.MONGODB_URI)
    console.log(chalk.bgBlue(`Database is connected successfully ✅ in ${con.connection.name}`));
}


module.exports = connectDB