// /config/db.js

const mongoose = require('mongoose');

// Create a separate connection for todos
const todoConnection = mongoose.createConnection(process.env.MONGODB_URI_TODOS);

// Create a separate connection for planets
const planetConnection = mongoose.createConnection(process.env.MONGODB_URI_GUIDES);

// Event listeners for the first connection (Todos)
todoConnection.on('connected', () => {
    console.log('Connected to MongoDB Todos database');
});

todoConnection.on('error', (err) => {
    console.error('Error connecting to MongoDB Todos database:', err);
});

// Event listeners for the second connection (Planets)
planetConnection.on('connected', () => {
    console.log('Connected to MongoDB Guides database');
});

planetConnection.on('error', (err) => {
    console.error('Error connecting to MongoDB Guides database:', err);
});

// Combined function to initialize all connections
const connectAll = async () => {
    try {
        // Wait for both connections to establish
        await Promise.all([
            new Promise((resolve, reject) => {
                todoConnection.on('connected', resolve);
                todoConnection.on('error', reject);
            }),
            new Promise((resolve, reject) => {
                planetConnection.on('connected', resolve);
                planetConnection.on('error', reject);
            }),
        ]);

        console.log('Both database connections initialized successfully');
        return { todoConnection, planetConnection };
    } catch (error) {
        console.error('Error initializing database connections:', error);
        process.exit(1);  // Exit the process on failure
    }
};

module.exports = {
    connectAll,
    todoConnection,
    planetConnection
};