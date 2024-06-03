const mongoose = require('mongoose');
const GroupSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    name: { type: String, required: true },
    image: { type: String, required: true },
    Transaction: [{
        name: { type: String, required: true },
        amount: Number,
        date: Date,
        category: { type: String, required: true },
    }],
    Goals: [{
        name: { type: String, required: true },
        description: { type: String },
        targetAmount: { type: Number, required: true }, // Total target amount for the goal
        currentAmount: { type: Number, default: 0 }, // Current amount saved for the goal
        image: { type: String }
    }]
});

module.exports = mongoose.model('Group', GroupSchema); 
