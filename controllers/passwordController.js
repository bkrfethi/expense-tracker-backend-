const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const Users = require('../models/User');
const {sendTemplateEmail} = require("../utils/sendEmail")

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.AUTH_EMAIL,
    pass:  process.env.AUTH_PASSWORD
  }
});

// Generate OTP
function generateOTP() {
  const otp= otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false })
  return otp
}

// Send OTP email
async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to send OTP email');
  }
}

// Forgot password - Generate OTP and send email
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });

  if (!user) {
     return res.status(404).json({ message: 'User not found' });
  }
 
  const OTP = generateOTP();
  const OTPCreatedAt = new Date();
  try {
    // Store the OTP and its creation timestamp in the user object (you might want to store it in the database)
    user.OTP = {
      code: OTP,
      createdAt: OTPCreatedAt
    };

    sendTemplateEmail(user.email,"OTP EMAIL","otp",{OTP} );
    await user.save();
    res.status(200).json({ message: 'OTP sent successfully' });
    next()
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send OTP email' });
  }
};


const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await Users.findOne({ email });

  if (!user || !user.OTP || user.OTP.code !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // Check if OTP has expired (e.g., 5 minutes expiration)
  const otpExpiration = 5 * 60 * 1000; // 5 minutes in milliseconds
  if (!user.OTP.createdAt || Date.now() - user.OTP.createdAt > otpExpiration) {
    return res.status(400).json({ message: 'OTP has expired' });
  }

  res.status(200).json({ message: 'OTP verified successfully' });
};


const resetPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await Users.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  try {
    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update user's password (you might want to update it in the database)
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

module.exports = { forgotPassword, verifyOTP, resetPassword };