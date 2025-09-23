const app = require('./app');

//Start the server
const PORT = process.env.PORT || 7002; // Default to 7002 if PORT is not set
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});