const dotenv = require("dotenv");
const mongoose = require("mongoose");

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