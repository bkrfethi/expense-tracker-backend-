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
        let balance = await Balance.findOne({ user: userId });

        // If balance document doesn't exist, create it
        if (!balance) {
            balance = new Balance({
                user: userId,
                amount: 0, // Initialize the amount to 0
                wallet: [] // Initialize the wallet array
            });
        }

        // Set the wallet amount using the setWallet method
        await balance.setWallet(amount);

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

        /* if (!deletedTransaction) {
             return res.status(404).json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} not found` });
         }
 */
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
        } else {
            userBalance.amount += deletedTransaction.amount;
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
        if (transaction.user.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

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
            userBalance = new Balance({
                user: userId,
                amount: 0,
                wallet: []
            });
        }
        if (type === 'income') {
            userBalance.amount += amountDifference;
        } else {
            userBalance.amount -= amountDifference;
        }
        await userBalance.save();

        // Update the transaction with the new values
        transaction.name = name || transaction.name;
        transaction.amount = amount || transaction.amount;
        transaction.category = category || transaction.category;
        transaction.date = date || transaction.date;

        // Save the updated transaction
        const updatedTransaction = await transaction.save();
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











module.exports = {
    addIncome,
    addExpense,
    deleteTransaction,
    updateTransaction,
    getAllTransactions,
    getAllIncome,
    getAllExpenses,
    setwallet,
    getTotaleBlance
}