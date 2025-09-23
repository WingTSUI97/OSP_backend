const mongoose = require('mongoose');

//create a function to connect to db
const dbConnect = async () => {
    try {
        const DB_CONNECT = process.env.MONGO_URI || process.env.TESTING_DB; // Use TESTING_DB as fallback
        const connect = await mongoose.connect(DB_CONNECT)
        console.log(
            `Databasee connected: ${connect.connection.host}, ${connect.connection.name}\nMongoDB connected successfully.`
        );

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }

};

module.exports = dbConnect;