const mongoose = require('mongoose');

const socialTaskSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        required: true,
    },
    reward: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
},{
    timestamps: true
});

const social = mongoose.model('SocialTasks', socialTaskSchema, 'socialTasks');

module.exports = social;
