const connectToDb = require('./config/db');
const { PORT } = require('./config/env');
const app = require('./app');

//Db Connection
connectToDb();


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});