// file /api/index.js
// Application dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectAll } = require('../config/db');

// Initialize database connections
connectAll();

// Application setup
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route definition
app.use(express.static('public')); // This will display /public/index.html when the server loads

const todosRouter = require("../routes/todos");
app.use("/api/todos", todosRouter);

const planetsRouter = require("../routes/planets");
app.use("/api/planets", planetsRouter);

const cityExplorerRouter = require("../routes/cityExplorer");
app.use("/api/cityExplorer", cityExplorerRouter);

app.use("*", fileNotFound);
app.use(errorHandler);

// Route handlers
function fileNotFound(req, res) {
    res.status(404).send("Not Found");
}

function errorHandler(err, req, res, next) {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Server error: ' + err.message });
}

// App listener
app.listen(port, () => console.log(`Server started on port ${port}`));