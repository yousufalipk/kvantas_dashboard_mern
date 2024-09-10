const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    imageName: {
        type: String,
        required: false, // Adjust this if necessary
    },
    reward: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    subtitle: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const AnnouncementModel = mongoose.model('Announcement', announcementSchema, 'announcements');

module.exports = AnnouncementModel;
