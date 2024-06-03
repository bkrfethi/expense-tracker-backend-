const express = require("express");
const authRoute = require("./authRouter");
const transactions=require('./transaction.js')
const goals=require('./goals')
const user=require('./user')
const group =require('./group')

const router = express.Router();

router.use(``, authRoute); 
router.use(``, transactions); 
router.use('',goals)
router.use('',user)
router.use('',group)

module.exports = router;