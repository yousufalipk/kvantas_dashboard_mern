const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    totalBalance: {
        type: Number,
        default: 0,
    },
    balance: {
        type: Number,
    },
    freeGuru: {
        type: Number,
        default: 3,
    },
    fullTank: {
        type: Number,
        default: 3,
    },
    tapBalance: {
        type: Number,
        default: 0,
    },
    timeSta: {
        type: String,
        default: null,
    },
    timeStaTank: {
        type: String,
        default: null,
    },
    daily_claimed: {
        claimed: {
            type: [String],
            default: [],
        },
        day: {
            type: Number,
            default: 0,
        },
        date: {
            type: String,
            default: "",
        },
        reward: {
            type: Number,
            default: 0,
        },
    },
    claimedReferralRewards: {
        type: [String],
        default: [],
    },
    tapValue: {
        level: {
            type: Number,
            default: 0,
        },
        value: {
            type: Number,
            default: 1,
        },
    },
    timeRefill: {
        level: {
            type: Number,
            default: 1,
        },
        duration: {
            type: Number,
            default: 10,
        },
        step: {
            type: Number,
            default: 600,
        },
    },
    level: {
        id: {
            type: Number,
            default: 1,
        },
        name: {
            type: String,
            default: "Bronze",
        },
        imgUrl: {
            type: String,
            default: "/bronze.webp",
        },
    },
    energy: {
        type: Number,
        default: 500,
    },
    battery: {
        level: {
            type: Number,
            default: 1,
        },
        energy: {
            type: Number,
            default: 500,
        },
    },
    refereeId: {
        type: String,
        default: null,
    },
    referrals: {
        type: [String],
        default: [],
    },
    double_booster: {
        startAt: {
            type: String,
            default: "",
        },
        rewardTimer: {
            type: String,
            default: "",
        },
        rewardClaimed: {
            type: Number,
            default: 0,
        },
        rewardStart: {
            type: Boolean,
            default: false,
        },
    },
    power_tap: {
        startAt: {
            type: String,
            default: "",
        },
        rewardTimer: {
            type: String,
            default: "",
        },
        rewardClaimed: {
            type: Number,
            default: 0,
        },
        rewardStart: {
            type: Boolean,
            default: false,
        },
    },
    task_lists: {
        type: [String],
        default: [],
    },
    daily_task_lists: {
        type: [String],
        default: [],
    },
    youtube_booster: {
        date: {
            type: String,
            default: "",
        },
        startAt: {
            type: String,
            default: "",
        },
        status: {
            type: Boolean,
            default: false,
        },
        rewardIndex: {
            type: Number,
            default: 0,
        },
        videoWatch: {
            type: Number,
            default: 0,
        },
    },
    twitterUserName: {
        type: String,
        default: "",
    },
    tonWalletAddress: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});


const user = mongoose.model('telegramUser', userSchema, 'telegramUsers');

module.exports = user;
