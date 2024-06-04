const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }
});

const TransactionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    participants: [ParticipantSchema],
    date: { type: Date, default: Date.now },
    category: { type: String, required: true }
});

const GroupSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    name: { type: String, required: true },
    image: { type: String, required: true },
    Transaction: [TransactionSchema],
    Goals: [{
        name: { type: String, required: true },
        description: { type: String },
        targetAmount: { type: Number, required: true },
        currentAmount: { type: Number, default: 0 },
        image: { type: String }
    }]
});

module.exports = mongoose.model('Group', GroupSchema);
