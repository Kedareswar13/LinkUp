const express = require("express");
const { signup, verifyAccount, resendOtp, login, logout, forgetPassword, resetPassword, changePassword } = require("../controllers/authController");
const isAuthenticated = require("../middleware/isAuthenticated");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify", isAuthenticated,verifyAccount);
router.post("/resend-otp", isAuthenticated,resendOtp);
router.post("/login",login);
router.post("/logout",logout);
router.post("/forget-password",forgetPassword);
router.post("/reset-password",resetPassword);
router.post("/change-password",isAuthenticated,changePassword);


module.exports = router;