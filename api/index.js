// Application Dependencies
const express = require('express');
// const req = require("express/lib/request");
require('dotenv').config();
const dbConnect = require('../config/db.js');
dbConnect();


// Application Setup
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route Definition
app.use(express.static('public')); // This will display /public/index.html when the server loads
// These two conflict with each other.
// app.get('/', (request, response) => {
//     response.send("Welcome to Edward McKeown's API!");
// });

const todosRouter = require("../routes/todos");
app.use("/api/todos", todosRouter);

const postsRouter = require("../routes/posts");
app.use("/api/posts", postsRouter);

// Create a new route for planets in your index.js file
const planetsRouter = require("../routes/planets");
const mongoose = require("mongoose");
app.use("/api/planets", planetsRouter);


app.get("/test-err", (req, res) => {
    throw new Error("There was a problem with error: " + req.url);
})
app.use("*", fileNotFound);
app.use(errorHandler);
// Route handlers
function fileNotFound (req, res) {
    res.status(404).send('Not Found');
}


function errorHandler (err, req, res) {
    res.status(500).send("I'm sorry, something happened");
}

// App Listener
app.listen(port, () => console.log(`Listening on port ${port}`));








