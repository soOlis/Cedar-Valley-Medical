const router = require("express").Router();
const testController = require("../controllers/test");
const sendSmsController = require("../controllers/sendSmsControl");

router.get("/get", testController.get);
router.post("/sendSms", sendSmsController.post);

module.exports = router;
