import express from 'express'
import mongoose from 'mongoose';

const app = express()


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

app.get('/', (req, res) => {
    res.send('Hello, from OSP_backend Server, Updated');
});



mongoose.connect('mongodb+srv://wingtsui97_db_user:o8L8J79B99g1OxNZ@ospbackenddb.3pn0whb.mongodb.net/OSP_backend?retryWrites=true&w=majority&appName=OSPBackendDB')
.then(() => {console.log('Connected to database!');  
})
.catch(() => {console.log('Connection failed!');
})
