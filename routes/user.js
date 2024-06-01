const express = require('express');
const router = express.Router();
const {
    editProfile,
    getProfile,
    changePassword,
    forgotPassword ,
    resetPassword , 
    verifyPIN
   }= require('../controllers/User'); 

const userAuth = require("../middlewares/authMiddleware.js");

router.post('/editProfile',userAuth ,editProfile)
router.get('/getprofile',userAuth, getProfile)
router.post('/changePassword',userAuth, changePassword);


router.post('/pinforgotpasword',userAuth, forgotPassword);
router.post('/verifyPIN',userAuth, verifyPIN);
router.post('/pinresetPassword',userAuth, resetPassword);
module.exports = router;