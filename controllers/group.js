const mongoose = require('mongoose');
const Group = require('../models/Group'); // Adjust the path as necessary
const User = require('../models/User'); // Adjust the path as necessary



const createGroup = async (req, res) => {
    try {
        const adminId = req.body.user.userId;
        const { name,  image } = req.body;

        // Validate group name
        if (!name) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        // Check if the admin user exists
        const adminUser = await User.findById(adminId);
        if (!adminUser) {
            return res.status(404).json({ error: 'Admin user does not exist' });
        }

        // Create a new group
        const newGroup = new Group({
            admin: adminId,
            members: [adminId], // Add admin as the first member
            name,
            image,
            Transaction: [],
            Goals: [],
        });

        // Save the new group to the database
        await newGroup.save();

        return res.status(201).json({ message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.error('Error creating group:', error);
        return res.status(500).json({ error: 'An error occurred while creating the group' });
    }
};

const getAllGroups = async (req, res) => {
    try {
        const userId = req.body.user.userId;
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', groups: [] });
        }

        // Query all group documents where the user is a member
        const groups = await Group.find({ members: userId });
        if (groups.length === 0) {
            return res.status(200).json({ success: true, message: 'No groups found for the user', groups: [] });
        }

        return res.status(200).json({ success: true, message: 'Groups found for the user', groups: groups });
    } catch (error) {
        
        return res.status(500).json({ success: false, message: 'Failed to fetch groups for user', error: error.message });
    }
};



const joinGroupFromID = async (req, res) => {
    const userId = req.body.user.userId;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        return res.status(500).json('User does not exist');
    }

    const { groupId } = req.body;

    // Check if the group exists
    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(500).json('Group does not exist');
    }

    try {
        // Add the user to the array of members if not already a member
        if (!group.members.includes(userId)) {
            group.members.push(userId);
            await group.save();
            return res.status(200).json('User successfully added to the group');
        } else {
            return res.status(400).json('User is already a member of the group');
        }
    } catch (error) {
        console.error('Error adding user to group:', error);
        return res.status(500).json('An error occurred while adding the user to the group');
    }
};


/*
const deleteMemberFromGroup = async (req, res) => {
    const { adminId, groupId, memberId } = req.body;

    try {
        // Check if the admin user exists
        const adminUser = await User.findById(adminId);
        if (!adminUser) {
            return res.status(404).json('Admin user does not exist');
        }

        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json('Group does not exist');
        }

        // Check if the requesting user is the admin of the group
        if (group.admin.toString() !== adminId) {
            return res.status(403).json('Only the admin can remove members from the group');
        }

        // Check if the member to be removed exists in the group
        const memberIndex = group.members.indexOf(memberId);
        if (memberIndex === -1) {
            return res.status(404).json('Member not found in the group');
        }

        // Remove the member from the group's members array
        group.members.splice(memberIndex, 1);

        // Save the updated group
        await group.save();

        return res.status(200).json('Member removed successfully');
    } catch (error) {
        console.error('Error removing member from group:', error);
        return res.status(500).json('An error occurred while removing the member from the group');
    }
};
*/

const addTransaction = async (req, res) => {
    const { groupId, transaction } = req.body;

    try {
        // Check if the group exists
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json('Group does not exist');
        }

        // Validate the transaction fields
        const { name, amount, date, category } = transaction;
        if (!name || !category ||amount <0) {
            return res.status(400).json('Transaction name and category are required');
        }

        // Add the new transaction to the group's Transaction array
        group.Transaction.push({ name, amount, date, category });

        // Save the updated group
        await group.save();

        return res.status(200).json({ message: 'Transaction added successfully', group });
    } catch (error) {
        console.error('Error adding transaction to group:', error);
        return res.status(500).json('An error occurred while adding the transaction to the group');
    }
};



const addGoalGroup = async (req, res) => {
    try {
        const userId = req.body.user.userId;
        const { groupId, name, description, targetAmount, image } = req.body;

        // Validate the goal fields
        if (!name || !targetAmount || targetAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Name and a positive targetAmount are required' });
        }

        // Find the group by ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user is the admin of the group
        if (group.admin.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Only the admin can add goals' });
        }

        // Create the new goal
        const newGoal = {
            name,
            description,
            targetAmount,
            currentAmount: 0, // Default currentAmount to 0
            image
        };

        // Add the new goal to the group's Goals array
        group.Goals.push(newGoal);

        // Save the updated group
        await group.save();

        // Send success response with the updated group
        res.status(201).json({ success: true, message: 'Goal added successfully', group });
    } catch (error) {
        console.error('Error adding goal:', error);
        res.status(500).json({ success: false, message: 'Failed to add goal' });
    }
};


const depositGoal = async (req, res) => {
    try {
        const userId = req.body.user.userId;
        const { groupId, goalId, amount } = req.body;

        if (amount <= 0 || amount === undefined) {
            return res.status(400).json({ success: false, message: 'Enter a valid amount' });
        }

        // Find the group by ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user is a member of the group
        const isMember = group.members.some(member => member.toString() === userId);
        if (!isMember) {
            return res.status(403).json({ success: false, message: 'User is not a member of the group' });
        }

        // Find the goal within the group
        const goal = group.Goals.id(goalId);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        // Update goal's currentAmount and add deposit
        goal.currentAmount += amount;

        // Save the updated group
        await group.save();

        // Send success response with updated goal
        res.status(200).json({ success: true, message: 'Deposit successful', goal });
    } catch (error) {
        console.error('Error depositing money:', error);
        res.status(500).json({ success: false, message: 'Failed to deposit money' });
    }
};

const getAllGoalsOfGroup = async (req, res) => {
    try {
        const groupId = req.params.id; // Extract the groupId from the route parameters
        // Find the group by ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found', goals: [] });
        }

        // Extract the goals from the group
        const goals = group.Goals;

        return res.status(200).json({ success: true, message: 'Goals found for the group', goals: goals });
    } catch (error) {
        console.error('Error fetching goals for group:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch goals for group', error: error.message });
    }
};


const editGoal = async (req, res) => {
    try {
        const userId = req.body.user.userId;
        const { groupId, goalId, name, description, targetAmount, image } = req.body;

        // Validate the goal fields
        if (!name || !targetAmount || targetAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Name, and a positive targetAmount are required' });
        }

        // Find the group by ID
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        // Check if the user is the admin of the group
        if (group.admin.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Only the admin can edit goals' });
        }

        // Find the goal within the group
        const goal = group.Goals.id(goalId);
        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        // Update the goal with the new values
        goal.name = name;
        goal.description = description;
        goal.targetAmount = targetAmount;
        goal.image = image;

        // Save the updated group
        await group.save();

        // Send success response with the updated goal
        res.status(200).json({ success: true, message: 'Goal updated successfully', goal });
    } catch (error) {
        console.error('Error updating goal:', error);
        res.status(500).json({ success: false, message: 'Failed to update goal' });
    }
};


































module.exports ={
    createGroup ,
    getAllGroups,
    joinGroupFromID,
    addGoalGroup,
    depositGoal,
    getAllGoalsOfGroup
}
