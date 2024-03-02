const express = require('express');
const dotenv = require('dotenv');
const dentists = require('./routes/dentists');
const auth = require('./routes/auth');
const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env'});

connectDB();

const app = express();
app.use(express.json());
app.use('/api/dentists', dentists);
app.use('/api/auth', auth);


const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ' , process.env.NODE_ENV, ' mode on port', PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});