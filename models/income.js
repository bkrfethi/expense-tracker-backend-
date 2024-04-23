const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const incomeSchema = new mongoose.Schema({
    type: { type: String, default: 'income' },
    name: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
})

module.exports=mongoose.model('Income', incomeSchema);