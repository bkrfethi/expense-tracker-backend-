const express = require("express");
const authRoute = require("./authRouter");
const transactions=require('./transaction.js')
const goals=require('./goals')
const user=require('./user')

const router = express.Router();

router.use(``, authRoute); 
router.use(``, transactions); 
router.use('',goals)
router.use('',user)


module.exports = router;