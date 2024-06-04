const express = require('express');
const router = express.Router();
const userAuth = require("../middlewares/authMiddleware.js");

const {createGroup,
    getAllGroups,
    joinGroupFromID,
    addGoalGroup,
    depositGoal,
    getAllGoalsOfGroup ,
    removeMemberFromGroup,
    getallmembers,
    addTransaction,
    getAllTransactions  
 }=require('../controllers/group');



router.post('/createGroup', userAuth, createGroup);
router.get('/getAllGroups', userAuth, getAllGroups)
router.post('/joinGroupFromID',userAuth,joinGroupFromID)
router.post('/removeMemberFromGroup', userAuth, removeMemberFromGroup);
router.get('/getAllMembersOfGroup/:groupId', userAuth,getallmembers);


router.post('/addGoalGroup',userAuth,addGoalGroup)
router.post('/depositGoal',userAuth,depositGoal)
router.get('/getAllGoalsOfGroup/:id',userAuth,getAllGoalsOfGroup)


router.post('/addTransaction', userAuth, addTransaction);
router.get('/getAllTransactions/:groupId', userAuth, getAllTransactions);


module.exports = router;