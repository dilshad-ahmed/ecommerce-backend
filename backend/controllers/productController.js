const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");


//create product --admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
    // image uploading
    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        // images url saving in db
        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    req.body.images = imagesLink;

    req.body.user = req.user._id;
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product,
    });
});

//get All product
exports.getAllProduct = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 8;

    let category = await Product.find().distinct("category");

    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const product = await apiFeature.query;

    res.status(200).json({
        message: "success",
        productCount,
        resultPerPage,
        product,
        category,
    });
});

//get All product -- admin
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
    const products = await Product.find();
    let categories = await Product.find().distinct("category");
    res.status(200).json({
        message: "success",
        products,
        categories,
    });
});

//update product -- admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({
            success: false,
            messages: "product not found",
        });
    }

    // image update start
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }
    // deleting images from cloudinry
    if (images !== undefined) {
        for (let i = 0; i < product.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[0].public_id);
        }
    }

    const imagesLink = [];
    // upload new images on cloudinary
    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });
        // images url saving in db
        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    req.body.images = imagesLink;
    // console.log(req.body.images);

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        product,
    });
});

//delete product
exports.removeProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(500).json({
            success: false,
            messages: "product not found",
        });
    }

    // Deleting images from cloudinary

    for (let i = 0; i < product.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[0].public_id);
    }

    await product.remove();
    res.status(201).json({
        success: true,
        message: "product remove successfully",
    });
});

//product details api
exports.productDetails = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("prduct not found", 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

// Create review or update review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
    const { comment, rating, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating), (rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    // ratings
    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });
});

//get review of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
});

//delter review ( admin )

exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = avg / reviews.length;

    const numOfReviews = reviews.length;

    if (isNaN(ratings)) ratings = 0;

    const updateD = await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        }
    );

    res.status(200).json({
        success: true,
        message: updateD,
    });
});
