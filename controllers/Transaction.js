const Income = require('../models/income');
const Expense = require('../models/expense')
const User = require('../models/User');
const Balance = require('../models/balance');
const mongoose = require('mongoose');

const setwallet=async (req,res)=>{
    try {
        const userId = req.body.user.userId;// Assuming the user ID is sent in the request body
        const amount = req.body.amount; // Amount entered by the user

        // Find the balance document for the user
        let userBalance = await Balance.findOne({ user: userId });

        // If balance document doesn't exist, create it
        if (!userBalance) {
            userBalance = new Balance({
                user: userId,
                amount: 0,
                wallet: []
            });
        }


        // Set the wallet amount using the setWallet method
        await userBalance.setWallet(amount);

        // Send success response
        res.status(200).json({ message: 'Wallet amount set successfully' });
    } catch (error) {
        console.error('Error setting wallet amount:', error);
        res.status(500).json({ message: 'Failed to set wallet amount' });
    }
}
        
const getTotaleBlance =async (req,res)=>{

    try {
        const userId = req.body.user.userId;
        
        // Check if the wallet exists for the user
        const balance = await Balance.findOne({ user: userId });
        
       if (!balance) {
            return res.status(404).json({ message: 'Wallet does not exist please set wallet' });
        }

        // If the wallet exists, get the amount
        const amount = await Balance.getAmount(userId);
        res.status(200).json({ amount });
    } catch (error) {
        console.error('Error fetching balance amount:', error);
        res.status(500).json({ message: 'Failed to fetch balance amount' });
    }



}
const addIncome = async (req, res, next) => {
    try {
        const { name, amount, category, date } = req.body;
        const userId = req.body.user.userId;
        if (!name || !amount || !category) {
            return next('Please provide all fields')
        }
        // Check if the user's balance exists
        let userBalance = await Balance.findOne({ user: userId });

        // If the user's balance doesn't exist, create it
        if (!userBalance) {
            userBalance = new Balance({
                user: userId,
                amount: 0,
                wallet: []
            });
        }
             // Check if the category already exists in user's balance
             const existingCategory = userBalance.categories.find(cat => cat.name === category);

             if (existingCategory) {
                 // Increment the amount of the existing category
                 existingCategory.amount += amount;
             } else {
                 // Return an error if the category doesn't exist
                 return res.status(400).json({ success: false, message: 'Category not found' });
             }

        const income = new Income({
            amount: amount,
            name: name,
            category: category,
            date: date || new Date(), // If date is not provided, use current date
            user: userId
        });

        const savedIncome = await income.save();

        // Update user's wallet balance
        userBalance.wallet.push(savedIncome);
        userBalance.amount += amount
        await userBalance.save();

        res.status(201).json({
            success: true,
            message: "Income Added  SUccessfully",
            income,
        });
    } catch (error) {
        console.error('Error adding income:', error);
        res.status(500).json({ message: 'Failed to add income' });
    }
};


const addExpense = async (req, res, next) => {
    try {
        const { name, amount, category, date } = req.body;
        const userId = req.body.user.userId;

        // Check if all required fields are provided
        if (!name || !amount || !category) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Check if the user's balance exists, if not, create it
        let userBalance = await Balance.findOne({ user: userId });
        if (!userBalance) {
            userBalance = new Balance({
                user: userId,
                amount: 0,
                wallet: []
            });
        }
        // Find the category within the user's balance
        const expenseCategory = userBalance.categories.find(cat => cat.name === category);

        // If the category exists, increment its amount by the expense amount
        if (expenseCategory) {
            expenseCategory.amount += amount;
        } else {
            // If the category doesn't exist, return an error
            return res.status(400).json({ message: 'Expense category not found' });
        }


        // Create a new Expense instance
        const expense = new Expense({
            amount: amount,
            name: name,
            category: category,
            date: date || new Date(), // If date is not provided, use current date
            user: userId
        });

        // Save the expense
        const savedExpense = await expense.save();

        // Update user's wallet balance
        userBalance.wallet.push(savedExpense);
        userBalance.amount -= amount; // Subtract expense amount from balance
        await userBalance.save();

        // Respond with success message
        res.status(201).json({
            success: true,
            message: "Expense added successfully",
            expense,
        });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Failed to add expense' });
    }
};




const deleteTransaction = async (req, res, next) => {
    try {
        // Extract the transaction ID from the request parameters
        const transactionId = req.params.id;

        // Find the transaction by ID in both Income and Expense collections
        const incomeTransaction = await Income.findById(transactionId);
        const expenseTransaction = await Expense.findById(transactionId);

        // Determine the type of transaction based on which collection the ID was found in
        const type = incomeTransaction ? 'income' : 'expense';

        // Delete the transaction based on the type
        let deletedTransaction;
        if (type === 'income') {
            deletedTransaction = await Income.findByIdAndDelete(transactionId);
        } else {
            deletedTransaction = await Expense.findByIdAndDelete(transactionId);
        }

        if (!deletedTransaction) {
             return res.status(404).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` });
         }
 
        // Retrieve the user's balance and update it
        const userId = req.body.user.userId;
        let userBalance = await Balance.findOne({ user: userId });
        if (!userBalance) {
            return res.status(404).json({ message: 'User balance not found' });
        }

        // Remove the deleted transaction from the user's wallet
        userBalance.wallet = userBalance.wallet.filter(trans => trans._id.toString() !== transactionId);

        // Update the balance based on the type of transaction
        if (type === 'income') {
            userBalance.amount -= deletedTransaction.amount;

            // Decrement the amount of the specific category
            const categoryIndex = userBalance.categories.findIndex(cat => cat.name === deletedTransaction.category);
            if (categoryIndex !== -1) {
                userBalance.categories[categoryIndex].amount -= deletedTransaction.amount;
            }
        } else {
            userBalance.amount += deletedTransaction.amount;

            // Decrement the amount of the specific category
            const categoryIndex = userBalance.categories.findIndex(cat => cat.name === deletedTransaction.category);
            if (categoryIndex !== -1) {
                userBalance.categories[categoryIndex].amount -= deletedTransaction.amount;
            }
        }

        // Save the updated balance
        await userBalance.save();
        
        // Respond with success message
        res.status(200).json({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
            deletedTransaction,
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ message: 'Failed to delete transaction' });
    }
};


const updateTransaction = async (req, res, next) => {
    try {
        const { name, amount, category, date } = req.body;
        const userId = req.body.user.userId;
        const transactionId = req.params.id;

        // Check if the transaction exists
        let transaction = await Income.findById(transactionId);
        let type = 'income';

        // If the transaction is not found in the income collection, search in the expense collection
        if (!transaction) {
            transaction = await Expense.findById(transactionId);
            type = 'expense';
        }

        // Check if the transaction exists
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if the user is authorized to update the transaction
        /* if (transaction.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }*/

        // Calculate the amount difference based on the new and old amounts
        let amountDifference = 0;
        if (type === 'income') {
            amountDifference = amount - transaction.amount;
        } else {
            amountDifference = transaction.amount - amount;
        }

        // Update the user's balance
        let userBalance = await Balance.findOne({ user: userId });
        if (!userBalance) {
            return res.status(400).json('No wallet found. Please set up a wallet.');
        }

        // Check if the category exists in the user's balance
        const categoryIndex = userBalance.categories.findIndex(cat => cat.name === category);
        if (categoryIndex === -1) {
            return res.status(404).json({ message: 'Category not found in the user\'s balance' });
        }

        // Update the balance of the category
        userBalance.categories[categoryIndex].amount += (type === 'income') ? amountDifference : -amountDifference;

        await userBalance.save();

        // Update the transaction with the new values
        transaction.name = name || transaction.name;
        transaction.amount = amount || transaction.amount;
        transaction.category = category || transaction.category;
        transaction.date = date || transaction.date;

        // Save the updated transaction
        const updatedTransaction = await transaction.save();

        // Update the wallet entry if exists
        const walletEntryIndex = userBalance.wallet.findIndex(entry => entry._id.equals(transactionId));
        if (walletEntryIndex !== -1) {
            userBalance.wallet[walletEntryIndex].name = name || userBalance.wallet[walletEntryIndex].name;
            userBalance.wallet[walletEntryIndex].amount = amount || userBalance.wallet[walletEntryIndex].amount;
            userBalance.wallet[walletEntryIndex].category = category || userBalance.wallet[walletEntryIndex].category;
            userBalance.wallet[walletEntryIndex].date = date || userBalance.wallet[walletEntryIndex].date;
        }

        // Save the updated balance
        await userBalance.save();

        // Respond with success message
        res.status(200).json({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`,
            transaction: updatedTransaction,
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ message: 'Failed to update transaction' });
    }
};



const getAllTransactions = async (req, res) => {
    try {
        const userId = req.body.user.userId; // Assuming you're extracting userId from the request body

        // Find the user's balance
        const userBalance = await Balance.findOne({ user: userId });

        if (!userBalance) {
            return res.status(404).json({ message: 'User balance not found' });
        }

        // Extract the wallet entries from the user's balance
        const transactions = userBalance.wallet;

        res.status(200).json({
            success: true,
            transactions: transactions,
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Failed to fetch transactions' });
    }
};


const getAllIncome = async (req, res, next) => {
    try {
        // Extract user ID from the request body
        const userId = req.body.user.userId;

        // Find all income entries for the user
        const userIncome = await Income.find({ user: userId });

        // Calculate total income by summing up the amounts of all income entries
        let totalIncome = 0;
        for (const income of userIncome) {
            totalIncome += income.amount;
        }

        // Send the total income as JSON response
        res.status(200).json({ totalIncome });
    } catch (error) {
        console.error('Error fetching total income:', error);
        res.status(500).json({ message: 'Failed to fetch total income' });
    }
};



const getAllExpenses = async (req, res, next) => {
    try {
        // Extract user ID from the request body
        const userId = req.body.user.userId;

        // Find all expenses for the user
        const userExpenses = await Expense.find({ user: userId });

        // Calculate total expense by summing up the amounts of all expenses
        let totalExpense = 0;
        for (const expense of userExpenses) {
            totalExpense += expense.amount;
        }

        // Send the total expense as JSON response
        res.status(200).json({ totalExpense });
    } catch (error) {
        console.error('Error fetching total expense:', error);
        res.status(500).json({ message: 'Failed to fetch total expense' });
    }
};


const getIncomeCategories=async (req,res)=>{
    try {
        const userId = req.body.user.userId;
  
        const incomeCategories = await Balance.getIncomeCategories(userId);
        res.status(200).json(incomeCategories);
    } catch (error) {
        console.error('Error retrieving income categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
const getExpenseCategories =async (req,res)=>{
    try {
        const userId = req.body.user.userId;
  
        const expenseCategories = await Balance.getExpenseCategories(userId);
        res.status(200).json(expenseCategories);
    } catch (error) {
        console.error('Error retrieving expense categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const addCategory= async (req,res)=>{
    try {
        const userId = req.body.user.userId; // Assuming userId is sent in the request body
        const categoryData = req.body; // Assuming category data is sent in the request body

        // Call the static method to add the category
        const categories = await Balance.addCategory(userId, categoryData);

        res.status(200).json(categories); // Return the updated list of categories
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getAllCategories =async (req, res) => {
    try {
      const userId = req.body.user.userId;
  
        // Call the static method to retrieve all categories for the user
        const categories = await Balance.getAllCategories({ user: userId });
  
        // Return the categories in the response
        res.status(200).json(categories);
    } catch (error) {
        // Handle errors and send an error response
        console.error('Error retrieving categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};






module.exports = {
    addIncome,
    addExpense,
    deleteTransaction,
    updateTransaction,
    getAllTransactions,
    
    getAllIncome,
    getAllExpenses,
    setwallet,
    getTotaleBlance,
    getIncomeCategories,
    getExpenseCategories,
    addCategory,
    getAllCategories
}