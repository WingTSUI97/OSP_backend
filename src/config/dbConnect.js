const mongoose = require('mongoose');

//create a function to connect to db
const dbConnect = async (uri) => {
    try {
        const DB_CONNECT = uri || process.env.MONGO_URI || process.env.TESTING_DB; // Use TESTING_DB as fallback
        const connect = await mongoose.connect(DB_CONNECT)
        
        // Only log connection details if not in test environment
        if (process.env.NODE_ENV !== 'test') {
            console.log(
                `Databasee connected: ${connect.connection.host}, ${connect.connection.name}\nMongoDB connected successfully.`
            );
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Don't exit process in test environment
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
        throw error;
    }

};

module.exports = dbConnect;