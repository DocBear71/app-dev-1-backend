// Application dependencies
const express = require('express');
const router = express.Router();

// route definitions
router.get('/', getPosts);

// Route handlers
function getPosts (req, res) {
    const posts = [];
    posts.push({
        "userId": 1,
        "id": 1,
        "title": "A place in time and space",
        "body": "TBD"
    });
    res.json(posts);
}

module.exports = router;