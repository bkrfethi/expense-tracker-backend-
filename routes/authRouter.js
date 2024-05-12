const express = require("express");
const { rateLimit } = require("express-rate-limit");
const userAuth = require("../middlewares/authMiddleware.js");
const { register, login} = require("../controllers/authController.js");
const { forgotPassword,verifyOTP, resetPassword }=require('../controllers/passwordController.js')
// IP rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const router = express.Router();

// Register routes
router.post("/register", limiter, register);
router.post("/login", limiter, login);


//Forgot password
router.post('/forgot-password', forgotPassword);
router.post('/verifyOTP', verifyOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
