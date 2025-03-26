const multer = require("multer");

// Configure memory storage
const storage = multer.memoryStorage();

// Define upload middleware with file limits
const upload = multer({storage});

module.exports = upload;