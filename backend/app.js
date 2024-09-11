const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const user = require ('./routes/userRoutes');

const { FRONTEND_ORIGIN } = require('./config/env');

const app = express();

// CORS configuration
app.use(cors({
    origin: FRONTEND_ORIGIN, // List your allowed origins here
    credentials: true
}));

app.use(bodyParser.json()); 
app.use(cookieParser());    

// Test route
app.get('/', (req, res) => {
    console.log("Front", FRONTEND_ORIGIN);
    res.send('Server Runs Correctly');
});

app.use('/', user);


module.exports = app;