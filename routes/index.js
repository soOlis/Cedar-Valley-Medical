const router = require("express").Router();
const testRoutes = require("./test");
const appointment = require("./setAppointment");


//Test route
router.use("/test-route", testRoutes);
router.use("/api", appointment);

module.exports = router;
