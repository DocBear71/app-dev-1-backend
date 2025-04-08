const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userID: 'number',
    title: 'string',
    completed: 'boolean',
});

const Todo = mongoose.model('Todos', schema);

module.exports = Todo;















