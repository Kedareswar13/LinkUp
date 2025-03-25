const dotenv = require("dotenv");
const mongoose = require("mongoose");
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});


dotenv.config({ path: "./config.env" });

const app = require("./app");

mongoose.connect(process.env.DB).then(() => { 
    console.log("DB Connection successful");
}).catch(err => {
    console.log("DB Connection failed:", err);
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => { 
    console.log(`App Running on port ${port}`);
});


// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.log(err.name, err.message);

    // Gracefully close the server before exiting
    server.close(() => {
        process.exit(1);
    });
});
    