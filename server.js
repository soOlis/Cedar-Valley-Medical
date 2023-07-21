const express = require("express");

const app = express();
const cors = require("cors");
const routes = require("./routes");

// middleware to parse data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// use routes
app.use(routes);

// check for "production" enviroment and set port
const PORT = process.env.PORT || 3002;

// start server
app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
