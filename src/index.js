const express = require('express');
const dotenv = require('dotenv').config();
const dbConnect = require('./config/dbConnect');

const adminRoutes = require('./routes/adminRoutes');
const participantRoutes = require('./routes/participantRoutes');

//Database connection
dbConnect();

const app = express()

//Middleware to parse JSON requests
app.use(express.json())

//Routes
app.use('/api/admin', adminRoutes);
app.use('/api/participant', participantRoutes);

//Start the server
const PORT = process.env.PORT || 7002; // Default to 7002 if PORT is not set
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});