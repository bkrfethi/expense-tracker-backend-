const express = require("express");
const userAuth = require("../middlewares/authMiddleware.js");
const {
    createSaving,
    deposit,
    getSaving 
}=require('../controllers/saving.js')
const router = express.Router();

router.post('/createSaving',userAuth,createSaving);
router.post('/depositSaving',userAuth,deposit)
router.get('/getSaving',userAuth,getSaving )
module.exports=router;