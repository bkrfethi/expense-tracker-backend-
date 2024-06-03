const express = require('express');
const router = express.Router();
const userAuth = require("../middlewares/authMiddleware.js");

const {createGroup,getAllGroups,joinGroupFromID,addGoalGroup,depositGoal, getAllGoalsOfGroup }=require('../controllers/group');



router.post('/createGroup', userAuth, createGroup);
router.get('/getAllGroups', userAuth, getAllGroups)
router.post('/joinGroupFromID',userAuth,joinGroupFromID)
router.post('/addGoalGroup',userAuth,addGoalGroup)
router.post('/depositGoal',userAuth,depositGoal)
router.get('/getAllGoalsOfGroup/:id',userAuth,getAllGoalsOfGroup)
module.exports = router;