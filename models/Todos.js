const mongoose = require('mongoose');
const { todoConnection } = require('../config/db');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: Number,
        default: 1
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Use the todoConnection instead of the default mongoose connection
const Todos = todoConnection.model('todos', todoSchema);

module.exports = Todos;