const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    targetAmount: { type: Number, required: true }, // Total target amount for the goal
    currentAmount: { type: Number, default: 0 }, // Current amount saved for the goal
    deposits: [{
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now }
    }],
    image: { type: String }
    
});

module.exports = mongoose.model('Goal', GoalSchema);
