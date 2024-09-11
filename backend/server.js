const express = require('express');
const cors = require('cors');
const { PORT, FRONTEND_URL } = require('./config/env');
const ConnectToDb = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true, 
}));

// Db Connection
ConnectToDb();

// test route
app.get(`/`, (req, res)=> {
    return res.status(200).json("Server is running correctly!");
})

// Importing User Routes
app.use('/', userRoutes);

app.listen(PORT, (val)=> {
    console.log(`Server is running on port: ${PORT}`);
})