const router = require("express").Router();
const testRoutes = require("./test");
const appointment = require("./setAppointment");
const sendSMS = require("./sendSms");

//Test route
router.use("/test-route", testRoutes);
router.use("/api", appointment);
router.use("/webhook", sendSMS);

module.exports = router;
