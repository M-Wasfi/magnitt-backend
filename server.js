const app = require("./app");

const connectDB = require("./helpers/connectDB");

connectDB();

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`.blue.bold));
