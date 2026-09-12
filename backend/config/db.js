const mongoose = require("mongoose")
const chalk = require("chalk")

async function connectDB () {
    try {
          console.log('MONGO_URI:', process.env.MONGODB_URI);
        const con = await mongoose.connect(process.env.MONGODB_URI)
console.log(chalk.bgBlue(`Database is connected successfully ✅ in ${con.connection.name}`));
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


module.exports = connectDB