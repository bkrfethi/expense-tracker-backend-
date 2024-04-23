const Users=require('../models/User');

const register=async (req,res,next)=>{
    const { firstName, lastName, email, password ,confirmPassword } = req.body;
    if (!firstName || !lastName || !email  && password === confirmPassword && password.length >= 4) {
        return next('Invalid data provided');
        
    }
    try {
        const userExist = await Users.findOne({ email });
        if(userExist){
            return next('Email Address already exists. Try Login')
        }
        const user=await Users.create({
            firstName,
            lastName,
            email,
            password,
            
        })
        const token=user.createJWT()
        res.status(201).send({
            success: true,
            message: "Account created successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
            token,
        })

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
   
}


const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            next("Please Provide User Credentials");
            return;
        }

        const user = await Users.findOne({ email }).select("+password");

        if (!user) {
          next("Invalid email or password");
          return;
        }
        //compare password 
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          next("Invalid email or password");
          return;
        }
    
        user.password = undefined;
    
        const token = user.createJWT();
        res.status(201).json({
            success: true,
            message: "Login successfully",
            user,
            token,
          });


    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }

}



module.exports={
    register,
    login
}