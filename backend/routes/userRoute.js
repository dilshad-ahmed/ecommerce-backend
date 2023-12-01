const express = require("express");
const { registerUser ,getAllUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetails, getUserDetailsAdmin, updatePassword, updateProfile, updateUser, deleteUser} = require("../controllers/userController");
const router = express.Router();
const { isAuthenticatedUser , authorizedRoles} = require("../middleware/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

//user route
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser,updatePassword);   
router.route("/me/update").put(isAuthenticatedUser,updateProfile);   

router.route("/admin/users").get(isAuthenticatedUser , authorizedRoles("admin"),getAllUser);
router.route("/admin/user/:id").get(isAuthenticatedUser , authorizedRoles("admin"),getUserDetailsAdmin)
.put(isAuthenticatedUser , authorizedRoles("admin"), updateUser)
.delete(isAuthenticatedUser , authorizedRoles("admin"), deleteUser) 

module.exports = router;