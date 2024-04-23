const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const BalanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    wallet: [{
        type: { type: String, required: true },
        amount: Number,
        date: Date,
        category: { type: String, required: true },
    }],
    categories: [{
        name: { type: String, required: true },
        type: { type: String, enum: ['income', 'expense'], required: true },
        amount: { type: Number, default: 0 }
        // You can add more properties to the category schema if needed
    }]
});


BalanceSchema.methods.setWallet = async function(amount) {
    this.amount = amount;
    await this.save();
};


BalanceSchema.statics.getAmount = async function(userId) {
    const balance = await this.findOne({ user: userId });
    return balance.amount//? balance.amount : 0;
};

BalanceSchema.pre('save', function(next) {
    if (this.categories.length === 0) {
        // Default income categories
        this.categories.push({ name: 'college', type: 'income', amount: 0 });
        this.categories.push({ name: 'lown ', type: 'income', amount: 0 });

        // Default expense categories
        this.categories.push({ name: 'phone', type: 'expense', amount: 0 });
        this.categories.push({ name: 'internet', type: 'expense', amount: 0 });
        this.categories.push({ name: 'car', type: 'expense', amount: 0 });
        this.categories.push({ name: 'home', type: 'expense', amount: 0 });
    }
    next();
});




module.exports=mongoose.model('Balance', BalanceSchema); 