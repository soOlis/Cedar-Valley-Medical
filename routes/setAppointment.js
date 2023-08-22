const router = require("express").Router();
const appointmentController = require("../controllers/createAppointmentControl");

router.post("/create-appointment", appointmentController.post);
router.post("/appointment/cancel/:appointment_id", appointmentController.cancel)
module.exports = router;
