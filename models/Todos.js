const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId: 'number',
    title: 'string',
    completed: 'boolean',
});

const Todos = mongoose.model('Todos', schema);

module.exports = Todos;