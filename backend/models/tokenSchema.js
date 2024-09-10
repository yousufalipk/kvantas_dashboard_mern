const mongoose = require('mongoose');


//Referesh Token Schema
const refreshTokenSchema = new mongoose.Schema ({
    token: {
        type: String, 
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    }
},{
    timestamps: true
})

const refreshToken = mongoose.model('refreshToken', refreshTokenSchema);


module.exports = refreshToken;