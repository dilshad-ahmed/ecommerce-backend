const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError")

//create New Order
exports.newOrder = catchAsyncError( async(req, res, next) =>{
    const { shippingInfo , orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice , totalPrice} = req.body;

    const order = await Order.create({
        shippingInfo , orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice , totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    })
    
    res.status(200).json({
        success:true,
        order
    })
})

//get single order 

exports.getSingleOrder = catchAsyncError( async (req, res, next) =>{
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) {
        return next( new ErrorHandler(" order not found with this id", 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

//get logged in  order user

exports.myOrder = catchAsyncError( async (req, res, next) =>{
    const orders = await Order.find({user : req.user._id})
    
    res.status(200).json({
        success: true,
        orders
    })
})


//get all  order --admin

exports.getAllOrders = catchAsyncError( async (req, res, next) =>{
    const orders = await Order.find()

    let totalAmount = 0;
    orders.forEach(order => {
        totalAmount += order.totalPrice;
    })
    
    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

//update order status --admin

exports.updateOrder = catchAsyncError( async (req, res, next) =>{
    const order = await Order.findById(req.params.id)

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("already Delivered this item",400));
    }

    order.orderItems.forEach(async(order) =>{
        await updateStock(order.product, order.quantity);

    });
    order.orderStatus = req.body.status;

    if(req.body.status ==="Delivered"){
        order.deliveredAt = Date.now()
    }

    await order.save({
        validateBeforeSave: false
    })
    
    res.status(200).json({
        success: true,
    })
})


async function updateStock(id , quantity){
    const product = await Product.findById(id);

    product.stock -=quantity;
    await product.save({validateBeforeSave:false})
}

// Delete order --admin

exports.deleteOrder = catchAsyncError( async (req, res, next) =>{
    const order = await Order.findById(req.params.id)


    if (!order) {
        return next( new ErrorHandler(" order not found with this id", 404))
    }

    await order.remove()
    

    res.status(200).json({
        success: true,
        message:"order remove"
    })
})

