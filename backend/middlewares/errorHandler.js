const AppError = require("../utils/AppError");

const globalError  = (err,req,res,next) => {
    console.log(err);
    
    let error = err

    if (error.kind == "ObjectId") error = new AppError(400,`Id must be 24 char and you send invalid id ${error.value}`)
    if (error.code == 11000) {
        error = new AppError(400,`Duplicated key in field ${Object.entries(error.keyValue)[0][0]} and it's value is ${Object.entries(error.keyValue)[0][1]}`)
    }
    if (error.name == "ValidationError") {
        let message = Object.values(error.errors).map(e => e.message).join(", ").replaceAll("Path " ,"")
        error = new AppError(400,message);
    }
    if (error.name == "TokenExpiredError") error = new AppError(400,`please login again !`)
    if (error.name == "JsonWebTokenError") error = new AppError(400,`please login again ! token is invalid`)
    res.status(error.status || 500).json({
        success : false ,
        message : error.message || `Internal server error`
    })
}


module.exports = globalError