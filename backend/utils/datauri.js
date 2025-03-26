const DataUriParser = require("datauri/parser");
const path = require("path");

const getDataUri = (file) => {
    if (!file || !file.buffer || !file.originalname) {
        throw new Error("Invalid file input. Ensure file contains buffer and originalname.");
    }

    const parser = new DataUriParser();
    const extName = path.extname(file.originalname); // No need for .toString()
    
    return parser.format(extName, file.buffer).content;
};

module.exports = getDataUri;