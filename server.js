const express = require("express");
require("dotenv").config();

const app = express();
const cors = require("cors");
const routes = require("./routes");
const connectDB = require("./DB/db");
// middleware to parse data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// use routes
app.use(routes);
connectDB();
// check for "production" enviroment and set port
const PORT = process.env.PORT || 3002;

// start server
app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});

