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

BalanceSchema.statics.getAllCategories = async function() {
    try {
        const categories = await this.distinct('categories.name').exec();
        return categories;
    } catch (error) {
        throw error;
    }
};
BalanceSchema.statics.getIncomeCategories = async function(userId) {
    return this.findOne({ user: userId })
        .select('categories')
        .then(balance => {
            if (!balance) {
                throw new Error('Balance not found for the user');
            }
            return balance.categories.filter(category => category.type === 'income');
        });
};

BalanceSchema.statics.getExpenseCategories = async function(userId) {
    return this.findOne({ user: userId })
        .select('categories')
        .then(balance => {
            if (!balance) {
                throw new Error('Balance not found for the user');
            }
            return balance.categories.filter(category => category.type === 'expense');
        });
};



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
        this.categories.push({ name: 'Salary', type: 'income', amount: 0 });


        // Default expense categories
        this.categories.push({ name: 'Food', type: 'expense', amount: 0 });
        this.categories.push({ name: 'Travel', type: 'expense', amount: 0 });
        this.categories.push({ name: 'Car', type: 'expense', amount: 0 });
        this.categories.push({ name: 'Home', type: 'expense', amount: 0 });
        this.categories.push({ name: 'Phone', type: 'expense', amount: 0 });
        this.categories.push({ name: 'Salary', type: 'expense', amount: 0 });
        this.categories.push({ name: 'Pet', type: 'expense', amount: 0 });
        this.categories.push({ name: 'College', type: 'expense', amount: 0 });
        this.categories.push({ name: 'Health', type: 'expense', amount: 0 });
        this.categories.push({ name: 'Internet', type: 'expense', amount: 0 });
       
    }
    next();
});

BalanceSchema.statics.addCategory = async function(userId, categoryData) {
    try {
        const balance = await this.findOne({ user: userId });

        if (!balance) {
            throw new Error('Balance not found for the user');
        }

        // Check if the category name already exists
        const existingCategory = balance.categories.find(cat => cat.name === categoryData.name);
        if (existingCategory) {
            throw new Error('Category with this name already exists');
        }

        // Add the new category with amount 0
        const newCategory = {
            name: categoryData.name,
            type: categoryData.type,
            amount: 0 // Set the initial amount to 0
        };

        balance.categories.push(newCategory);
        await balance.save();
        
        const filteredCategories = balance.categories.filter(cat => cat.type === categoryData.type);

        return filteredCategories;
    } catch (error) {
        throw error;
    }
};



module.exports=mongoose.model('Balance', BalanceSchema); 