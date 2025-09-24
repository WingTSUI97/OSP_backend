const express = require('express');
const dotenv = require('dotenv').config();
const dbConnect = require('./config/dbConnect');

const adminRoutes = require('./routes/adminRoutes');
const participantRoutes = require('./routes/participantRoutes');

//Database connection
if (process.env.NODE_ENV !== 'test') {
  dbConnect();
}

const app = express()

//Middleware to parse JSON requests
app.use(express.json())

//Routes
app.use('/api/admin', adminRoutes);
app.use('/api', participantRoutes);

module.exports = app