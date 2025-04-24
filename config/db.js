const mongoose = require('mongoose');

// Create a separate connection for todos
const todoConnection = mongoose.createConnection(process.env.MONGODB_URI_TODOS, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Create a separate connection for planets
const planetConnection = mongoose.createConnection(process.env.MONGODB_URI_GUIDES, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Event listeners for the first connection
todoConnection.on('connected', () => {
    console.log('Connected to MongoDB Todos database');
});

todoConnection.on('error', (err) => {
    console.error('Error connecting to MongoDB Todos database:', err);
});

// Event listeners for the second connection
planetConnection.on('connected', () => {
    console.log('Connected to MongoDB Guides database');
});

planetConnection.on('error', (err) => {
    console.error('Error connecting to MongoDB Guides database:', err);
});

// Combined function to initialize all connections
const connectAll = async () => {
    try {
        // Both connections are initialized when the module is imported
        console.log('Database connections initialized');
        return { todoConnection, planetConnection };
    } catch (error) {
        console.error('Error initializing database connections:', error);
        process.exit(1);
    }
};

module.exports = {
    connectAll,
    todoConnection,
    planetConnection
};