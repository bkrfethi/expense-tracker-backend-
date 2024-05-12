const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    name: { type: String, required: true },
    description: String, // Removed unnecessary object wrapping
    Transaction: [{
        type: { type: String, required: true },
        amount: Number,
        date: Date,
        category: { type: String, required: true },
    }],
    Goals: [{
        targetAmount: { type: Number, required: true },
        currentAmount: { type: Number, default: 0 },
        category: { type: String, required: true },
        Description: String, // Changed 'type:string' to 'String'
    }], // Added a comma to separate the array from the next property
    InviteLink: { type: mongoose.Schema.Types.ObjectId, ref: 'link', required: true } // Added a comma to separate the properties
});

module.exports = mongoose.model('Group', GroupSchema); // Changed 'group' to 'Group' to follow naming conventions
