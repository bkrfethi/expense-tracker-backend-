const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
    group : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Group"
    },
    expires_in : {
        type : Date.now(),
        default : null 
    },
    expired : {
        type : Boolean,
        default : false 
    }
})
module.exports = mongoose.model('Link', LinkSchema); // Changed 'group' to 'Group' to follow naming conventions
