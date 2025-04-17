const mongoose = require('mongoose');


const connect = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI_TODOS);
    console.log(`Connected to MongoDB connection: ${conn.connection.host}`);
};

module.exports = connect;
