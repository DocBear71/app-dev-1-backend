// Application dependencies
const express = require('express');
const router = express.Router();
const Todos = require('../models/Todos');

// route definitions
// Get all todos
router.get('/', getTodos);
// Get a single to-do
router.get('/:id', getSingleTodo);
// Add a new to-do
router.post('/', addTodo);
// Update a single to-do
router.put('/:id', updateSingleTodo);
// Delete a single to-do
router.delete('/:id', deleteSingleTodo);

// Route handlers
async function getTodos (req, res) {
    try {
        const todos = await Todos.find();
        res.json({ success: true, data: todos});
    } catch(error) {
        console.log(error);
        res.status(500).json({success: false, message: 'Something went wrong!'});
    }
}
async function getSingleTodo(req, res) {
    const id = req.params.id;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    const todo = await Todos.findById(id);
    if(!todo) {
        return res.status(404).json({success: false, message: 'Not found!'});
    }
    res.json({ success: true, data: todo});
}
async function addTodo(req, res) {
    const title = req.body.title;
    const completed = false;
    const userId = 1; // Change based on user logged in
    // Validate user input before continuing
    if(title) {
        const todo = new Todos({
            "title": title,
            "completed": completed,
            "userId": userId,
        });
        const savedTodo = await todo.save();
        res.json({success: true, data: savedTodo});
    } else {
        res.status(400).json({ success: false, message: 'Title is required' });
    }
}

async function updateSingleTodo(req, res) {
    const id = req.params.id;
    if (!isValidId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
    }
    todo = {};
    todo.title = req.body.title;
    todo.completed = !!req.body.completed; // Converts string to boolean
    const updatedTodo = await Todos.findByIdAndUpdate(id, {$set: todo}, {new: true});
    if(!updatedTodo) {
        return res.status(404).json({success: false, message: 'Not found!'});
    }
    res.json({success: true, data: updatedTodo});

}

async function deleteSingleTodo(req, res) {
    try {
        const id = req.params.id;
        console.log('Delete request received for id:', id);

        if (!isValidId(id)) {
            console.log('Invalid ID format:', id);
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        const deletedTodo = await Todos.findByIdAndDelete(id);

        if (!deletedTodo) {
            console.log('Todo not found with id:', id);
            return res.status(404).json({ success: false, message: 'Todo not found' });
        }

        console.log('Successfully deleted todo:', deletedTodo);
        return res.json({ success: true, data: deletedTodo });
    } catch (error) {
        console.error('Error in deleteSingleTodo:', error);
        return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
}

function isValidId(id) {
    if (
        (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) ||  // 24-char hex string
        (id instanceof Uint8Array && id.length === 12) ||           // 12-byte Uint8Array
        (Number.isInteger(id))                                      // Integer
    ) {
        return true;
    }
    return false;
}

module.exports = router;