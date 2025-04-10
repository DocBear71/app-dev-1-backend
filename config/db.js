const mongoose = require('mongoose');


// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log('Connected!'))
//     .catch((err) => console.log(err));

const connect = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI_TODOS);
    console.log(`Connected to MongoDB connection: ${conn.connection.host}`);
};

// const connect = async () => {
//     const conn = await mongoose.connect(process.env.MONGODB_URI_GUIDES);
//     console.log(`Connected to MongoDB connection: ${conn.connection.host}`);
// };

module.exports = connect;