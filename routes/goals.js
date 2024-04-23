const express = require('express');
const router = express.Router();
const {
    Create_Goal,
    delete_Goals,
    goals,
    deposit
} = require('../controllers/Goals');

const userAuth = require("../middlewares/authMiddleware.js");

// Route pour créer un objectif
router.post('/create_goals',userAuth, Create_Goal);

// Route pour supprimer un objectif
router.delete('/delete_goals/:goalId',userAuth, delete_Goals);

// Route pour obtenir tous les objectifs
router.get('/goals', userAuth,goals);

// Route pour déposer de l'argent dans un objectif
router.post('/goals/deposit/:id',userAuth, deposit);

module.exports = router;