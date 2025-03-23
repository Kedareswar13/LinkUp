const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();

const path = require("path");

app.use("/", express.static("uploads"));

app.use(cookieParser());

app.use(helmet());

app.use(
    cors({ 
        origin: ["https://localhost:3000"], 
        credentials: true,
     })
);

app.use(express.static(path.join(__dirname,"public")));
if(process.env.NODE_ENV === "development")
{
    app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));

app.use(mongoSanitize());

module.exports = app;