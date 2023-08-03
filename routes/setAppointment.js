const router = require("express").Router();

const appointmentController = require("../controllers/createAppointmentControl");

router.post("/create-appointment", appointmentController.post);

module.exports = router;
