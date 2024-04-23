    const express = require("express");
    const authRoute = require("./authRouter");
    const transactions=require('./transaction.js')
    const goals=require('./goals')


    const router = express.Router();

    router.use(``, authRoute); //api-v1/auth/
    router.use(``, transactions); 
    router.use('',goals)


    module.exports = router;

