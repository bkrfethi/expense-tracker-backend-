const mongoose = require('mongoose');
const User = require('../models/User');
const Balance = require('../models/balance');
const Goal=require('../models/Goals');
const balance = require('../models/balance');

const Create_Goal = async (req, res) => {
    try {
        const userId = req.body.user.userId;
        const { name, description, targetAmount/*,image*/} = req.body;

        if (!(name && targetAmount)) {
            return res.status(400).json({ success: false, message: 'Name and targetAmount are required fields' });
        }

        // Create a new Goal instance
        const newGoal = new Goal({
            user: userId,
            name: name,
            description: description,
            targetAmount: targetAmount,
           // image: image
        });

        // Save the new goal to the database
        const savedGoal = await newGoal.save();

        // Send success response with a simplified version of the created goal
        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            goal: {
                _id: savedGoal._id,
                name: savedGoal.name,
                description: savedGoal.description,
                targetAmount: savedGoal.targetAmount,
                // You can include other fields here if needed
            }
        });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ success: false, message: 'Failed to create goal' });
    }
};

const delete_Goals = async (req, res) => {
    try {
        const goalId = req.params.goalId;

        // Find the goal by ID
        const goal = await Goal.findById(goalId);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        // Retrieve the current amount before deleting the goal
        const currentAmount = goal.currentAmount;

        // Delete the goal
        await Goal.findByIdAndDelete(goalId);

        // Add the current amount back to the user's balance
        const userId = goal.user; // Assuming user ID is stored in the goal document
        const userBalance = await Balance.findOne({ user: userId });
        if (!userBalance) {
            return res.status(404).json({ success: false, message: 'User balance not found' });
        }

        userBalance.amount += currentAmount;
        await userBalance.save();

        // Send success response
        res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ success: false, message: 'Failed to delete goal' });
    }
};

const goals=async(req,res)=>{
    try {
        const userId = req.body.user.userId; 

        // Fetch goals by user ID from the database
        const goals = await Goal.find({ user: userId });

        // Send success response with the list of goals
        res.json({ success: true, goals: goals });
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch goals' });
    }
}

const deposit = async (req, res) => {
    try {
        const goalId = req.params.id;
        const amount = req.body.amount; // Assuming amount is sent in the request body

        // Find the goal by ID
        const goal = await Goal.findById(goalId);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        // Update goal's currentAmount and add deposit
        goal.currentAmount += amount;
        goal.deposits.push({ amount: amount });

        // Save the updated goal
        await goal.save();

        // Deduct the deposited amount from the user's balance
        const userId = req.body.user.userId; // Assuming user ID is available in the request body

        // Find the user's balance
        const userBalance = await Balance.findOne({ user: userId });
        if (!userBalance) {
            return res.status(404).json({ success: false, message: 'User balance not found' });
        }

        // Deduct the amount from the user's balance
        userBalance.amount -= amount;

        // Save the updated user balance
        await userBalance.save();

        // Send success response with updated goal
        res.status(200).json({ success: true, message: 'Deposit successful', goal: goal });
    } catch (error) {
        console.error('Error depositing money:', error);
        res.status(500).json({ success: false, message: 'Failed to deposit money' });
    }
};


module.exports={
    Create_Goal,
    delete_Goals,
    goals,
    deposit
}
