const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt= require("bcryptjs");
const jwt =require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter user name"],
        maxlength:[30,"name cannot exceed than 30 char"],
        minlength:[3,"name is too short"]
    },
    email:{
        type:String,
        required:[true,"please enter email"],
        unique:true,
        validate:[validator.isEmail,"enter valid email address"]
    },
    password:{
        type:String,
        required:[true,"please enter password"],
        minlength:[8,"password must be 8 character"],
        select:false
    },
    avtar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true
        }
    },
    userRole:{
        type:String,
        default:"user"
    },
    createdAt: {
        type : Date,
        default : Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,

});

//password hash

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }

    this.password = await bcrypt.hash(this.password,10);
})

//jwt token
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id}, process.env.JWT_secret, {
        expiresIn: process.env.JWT_expire
    })
}

//compate password
userSchema.methods.comparePassword = async function(enteredPass){
    return await bcrypt.compare(enteredPass,this.password);
}

// generating password reset token

userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex")

    //hashing and adding userpasstoken in schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

    return resetToken
}


module.exports = mongoose.model("User",userSchema);