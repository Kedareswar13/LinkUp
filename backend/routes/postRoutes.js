const express = require("express");
const isAuthenticated = require("../middleware/isAuthenticated");
const upload = require("../middleware/multer");
const { createPost } = require("../controllers/postController");

const router = express.Router();

// Define routes
router.post("/create-post", isAuthenticated, upload.single("image"), createPost);

module.exports = router;