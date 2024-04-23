const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt =require('jsonwebtoken');
const bcrypt=require('bcryptjs');

const userSchema=new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    OTP: {
        type: String,
    }
})

userSchema.pre('save',async function(){
    const salt=await bcrypt.genSalt(10);
    this.password = await  bcrypt.hash(this.password ,salt)
})

userSchema.methods.comparePassword=async function(userPasword){
    const isMatch=await bcrypt.compare(userPasword, this.password);
    return isMatch;
}

userSchema.methods.createJWT=function(){
    return jwt.sign({userId:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:"2d",
    })
}

module.exports=mongoose.model('Users',userSchema)