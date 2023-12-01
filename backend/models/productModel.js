const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name: {
        type:String,
        required:[true,"please enter product name"]
    },
    description: {
        type:String,
        required:[true,"please enter description name"]
    },
    price:{
        type:Number,
        require:[true, "Please enter Prise"],
        maxLength:[8,"price cant exceed more than 8 character"]
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    user: {
        type : mongoose.Schema.ObjectId ,
        ref : 'User',
        required : true
    },

    category:{
        type:String,
        required:[true, "please enter category name"]
    },
    stock:{
        type:Number,
        required:[true, "please Enter product stock"],
        maxLength:[4, "stock cant exceed more than 4 character"],
        default:1
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {   
            user: {
                type : mongoose.Schema.ObjectId ,
                ref : 'User',
                required : true
            },
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
    

})

module.exports = mongoose.model("Product", productSchema);