const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError")
const sendJwtToken = require("../utils/jwttoken")
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto")
const cloudinary = require("cloudinary")


exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    // if(!name||!email||!password){
    //     return next(new ErrorHandler("please enter all required field",500))
    // }

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avtar, {
        folder: "avtars",
        width: 150,
        crop: "scale"
    })

    const user = await User.create({
        name,
        email,
        password,
        avtar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    })

    sendJwtToken(user, res, 200);
    // const token = user.getJWTToken();

    // res.status(201).json({
    //     success:true,
    //     token
    // })

})

//login user
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("please enter email and pass", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorHandler("Email or password are incorrect", 401));
    }
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Email or password are incorrect", 401));
    }

    sendJwtToken(user, res, 200);

})

exports.logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        messages: "logout successful"
    })
})






// forgot password controller

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler("user not found", 404))
    }

    const resetToken = user.getResetPasswordToken()
    await user.save({ validateBeforeSave: false })

    // const resetPasswordUrl = `http://localhost:3000/password/token/${resetToken}`;   //local  below url is after deployment
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/token/${resetToken}`;

    const message = `your password reset token is ${resetPasswordUrl} \n \n if you have not requested this email please ingnore this`;

    try {
        await sendEmail({
            email: user.email,
            subject: " ecommerce password recovery",
            message
        });
        res.status(200).json({
            success: true,
            message: `email sent to ${user.email} successfully`
        })

    } catch (error) {
        user.getResetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false })
        return next(new ErrorHandler("error.message", 500))
    }

})

// reset password 

exports.resetPassword = catchAsyncError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
        return next(new ErrorHandler("reset password token is invalid or has been expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("password does not match", 400));
    }


    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save()

    sendJwtToken(user, res, 200);

})

//user routes  --  get user details

exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

//update user password

exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("please enter valid pass", 401));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("password not match", 400));
    }

    user.password = req.body.newPassword;
    await user.save()

    sendJwtToken(user, res, 200);
})

// update profile 
exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const userData = {
        name: req.body.name,
        email: req.body.email
    }

    //add cloudinary later

    const user = await User.findByIdAndUpdate(req.user.id, userData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
    })
})


// user Route

// get all user ( Admin)

exports.getAllUser = catchAsyncError(async (req, res, next) => {
    const users = await User.find()
    res.status(200).json({
        success: true,
        users
    })
})

//get user Details (admin)
exports.getUserDetailsAdmin = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return next(new ErrorHandler("user not found", 400))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// update user Role (  admin ) 
exports.updateUser = catchAsyncError(async (req, res, next) => {
    const userData = {
        name: req.body.name,
        email: req.body.email,
        userRole: req.body.userRole,
    }

    const user = await User.findByIdAndUpdate(req.params.id, userData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
    })
})

// delete user ( admin )

exports.deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler("user not found with this id", 404));
    }

    await user.remove();
    //romove cloudinary later

    res.status(200).json({
        success: true,
        message: "user deleted"
    })
})