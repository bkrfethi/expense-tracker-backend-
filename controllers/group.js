const Group = require('../models/Group')
const Link = require('../models/link')
const generateInviteLink = async (req,res) =>  {
    const { group } = req.body 
    const LinkExist = await Link.findOne({
        group
    })
    if (LinkExist && !expired ){
        return res.status(400).json({
            message : "link already exists"
        })
    }
    const NewLink = await Link.create({
        group , 
    })
    if(NewLink){
        return res.status(200).json({
            message : "link has been created"
        })
    }
}
const joinGoupeFromLink = async(req,res) => {
    const {link} = req.body 
    const LinkObj = await Link.findById(link)
    
}