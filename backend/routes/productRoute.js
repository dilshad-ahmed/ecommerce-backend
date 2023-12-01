// const { Router } = require("express");
const express = require("express");
const router = express.Router();
const { getAllProduct , getAdminProducts, createProduct, updateProduct, removeProduct, productDetails, createProductReview, getProductReviews, deleteReview } = require("../controllers/productController");
const { isAuthenticatedUser , authorizedRoles} = require("../middleware/auth");

router.route("/products").get( getAllProduct);
router.route("/admin/products").get( isAuthenticatedUser , authorizedRoles("admin") , getAdminProducts);
router.route("/product/new").post( isAuthenticatedUser , authorizedRoles("admin") ,createProduct);
router.route("/product/:id").put( isAuthenticatedUser , authorizedRoles("admin") , updateProduct).delete(isAuthenticatedUser , authorizedRoles("admin") , removeProduct).get(productDetails);
router.route("/review").put( isAuthenticatedUser ,createProductReview);
router.route("/reviews").get( getProductReviews).delete(isAuthenticatedUser, deleteReview)

module.exports = router;