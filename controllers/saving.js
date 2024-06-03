const Balance=require('../models/balance');
const User=require('../models/User');
const createSaving = async (req, res) => {
    try {
        const userId = req.body.user.userId;
        const { targetAmount } = req.body;

        // Validate the saving fields
        if (!targetAmount || targetAmount <= 0) {
            return res.status(400).json({ success: false, message: 'A positive targetAmount is required' });
        }

        // Find the user's balance
        const balance = await Balance.findOne({ user: userId });
        if (!balance) {
            return res.status(404).json({ success: false, message: 'User balance not found' });
        }

        // Update or create the saving entry
        balance.saving = {
            targetAmount,
            currentAmount: 0, // Default currentAmount to 0
            date: Date.now()
        };

        // Save the updated balance
        await balance.save();

        // Send success response with the updated balance
        res.status(201).json({ success: true, message: 'Saving created successfully', saving: balance.saving });
    } catch (error) {
        console.error('Error creating saving:', error);
        res.status(500).json({ success: false, message: 'Failed to create saving' });
    }
};


const deposit = async (req, res) => {
    try {
        const userId = req.body.user.userId;
        const { amount } = req.body;

        // Validate the deposit amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Enter a valid amount' });
        }

        // Find the user's balance
        const balance = await Balance.findOne({ user: userId });
        if (!balance) {
            return res.status(404).json({ success: false, message: 'User balance not found' });
        }

        // Check if saving target is set
        if (!balance.saving) {
            return res.status(400).json({ success: false, message: 'Saving target not set for the user' });
        }

        // Check if the deposit would exceed the target amount
        if (balance.saving.currentAmount + amount > balance.saving.targetAmount) {
            return res.status(400).json({ success: false, message: 'Cannot deposit, amount exceeds target saving amount' });
        }

        // Update the currentAmount in the saving field
        balance.saving.currentAmount += amount;

        // Save the updated balance
        await balance.save();

        // Send success response with the updated saving
        res.status(200).json({ success: true, message: 'Deposit successful', saving: balance.saving });
    } catch (error) {
        console.error('Error depositing money:', error);
        res.status(500).json({ success: false, message: 'Failed to deposit money' });
    }
};
const getSaving = async (req, res) => {
    try {
        const userId = req.body.user.userId;

        // Find the user's balance
        const balance = await Balance.findOne({ user: userId });
        if (!balance) {
            return res.status(404).json({ success: false, message: 'User balance not found' });
        }

        // Get the saving details
        const saving = balance.saving;

        return res.status(200).json({ success: true, message: 'Saving details found', saving });
    } catch (error) {
        console.error('Error fetching saving details:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch saving details', error: error.message });
    }
};



module.exports={
    createSaving,
    deposit,
    getSaving 

}