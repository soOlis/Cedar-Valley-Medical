const router = require("express").Router();
const testRoutes = require("./test");

//Test route
router.use("/test-route", testRoutes);
module.exports = router;
