const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
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
}, {
    timestamps: true
});

const daily = mongoose.model('DailyTasks', dailyTaskSchema, 'dailyTasks');

module.exports = daily;
