const ErrorHandler = require("../utils/errorhandler")


module.exports = (err,req, res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "enternal server error";

    // if(err.name = "CastError"){
    //     const message = `resource not found . Invalid ${err.path}`
    //     err = new ErrorHandler(message, 400)
    // }

    res.status(err.statusCode).json({
        success:false,
        error : err.message,
    })
}