const express = require('express');
const dotenv = require('dotenv').config();
const dbConnect = require('./config/dbConnect');   

//Database connection
dbConnect();

const app = express()

//Middleware to parse JSON requests
app.use(express.json())

//Routes
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/auth', require('./routes/authRoutes'));

//Start the server
const PORT = process.env.PORT || 7002; // Default to 7002 if PORT is not set
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});