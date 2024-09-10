const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

const ConnectToDb = async () => {
    mongoose.connect(MONGODB_URI)
    .then((val)=> {
        console.log("Database Connected Succesfuly!")
    })
    .catch((val)=> {
        console.log("Error Connecting Database!")
    })
} 


module.exports = ConnectToDb;