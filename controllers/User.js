const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendTemplateEmail } = require('../utils/sendEmail');


const getProfile= async (req,res)=>{
    try {
        const userId =req.body.user.userId;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message:'user not found '})
        }
        res.status(200).json({
            success: true,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
            }
        });
    } catch (error) {
        console.error('Error fetvhing User data')
        res.status(500).json({message :'failed'})
    }

}

const editProfile = async (req, res) => {
    const {firstName, lastName, email, gender, dateOfBirth } = req.body;

    // Validate input
    if ( !firstName || !lastName || !email || !gender || !dateOfBirth) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // Find the user by their ID and update the provided fields
        const userId = req.body.user.userId;
        
        const user = await User.findByIdAndUpdate(
            userId,
            {
                firstName,
                lastName,
                email,
                gender,
                dateOfBirth
            },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Send the updated user data as a response
        res.status(200).json({
            success: true,
            message: 'User information updated successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth
            }
        });
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ success: false, message: 'Failed to update user information' });
    }
};


const changePassword = async (req, res) => {
    const {  currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if ( !currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (newPassword.length < 4) {
        return res.status(400).json({ success: false, message: 'New password must be at least 4 characters long' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'New password and confirm password do not match' });
    }

    try {
        const userId=req.body.user.userId;
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password using comparePassword method
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        user.password = hashedPassword;
        await user.save();

        // Send success response
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ success: false, message: 'Failed to change password' });
    }
};





// Generate PIN
function generatePIN() {
  return otpGenerator.generate(4, { digits: true, alphabets: false, upperCase: false, specialChars: false });
}

// Forgot password - Generate PIN code and send email
const forgotPassword = async (req, res, next) => {
  const { userId } = req.body.user;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const pinCode = generatePIN();
  const PINCreatedAt = new Date();

  try {
    // Store the PIN and its creation timestamp in the user object (you might want to store it in the database)
    user.OTP= {
      code: pinCode,
      createdAt: PINCreatedAt
    };

    // Send PIN email using Handlebars template
    await sendTemplateEmail(user.email, "PIN CODE EMAIL", "pin", { pinCode });
    
    await user.save();
    res.status(200).json({ message: 'PIN code sent successfully' });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send PIN code email' });
  }
};



const verifyPIN = async (req, res, next) => {
    const { pinCode } = req.body;
    const userId = req.body.user.userId; 
    try {
      const user = await User.findById(userId);
  
      if (!user || !user.OTP || user.OTP.code !== pinCode) {
        return res.status(400).json({ message: 'Invalid pinCode' });
      }
  
      // Check if pinCode has expired (e.g., 5 minutes expiration)
      const PINExpiration = 5 * 60 * 1000; // 5 minutes in milliseconds
      if (!user.OTP.createdAt || Date.now() - user.OTP.createdAt > PINExpiration) {
        return res.status(400).json({ message: 'PinCode has expired' });
      }
  
      res.status(200).json({ message: 'PinCode verified successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to verify PIN code' });
    }
  };
  
const resetPassword = async (req, res, next) => {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.body.user.userId; 
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (newPassword !== confirmPassword || newPassword.length < 4) {
        return res.status(400).json({ message: 'Invalid data' });
      }
  
      // Hash the new password
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
      // Update user's password
      user.password = hashedPassword;
  
      // Remove OTP from user object after successful password reset
      delete user.OTP;
  
      await user.save();
      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  };
module.exports = {
    editProfile,
    getProfile,
    changePassword ,
     forgotPassword ,
     resetPassword , 
     verifyPIN
};












































