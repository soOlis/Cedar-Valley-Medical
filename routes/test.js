const router = require("express").Router();
const testController = require("../controllers/test");

router.get("/get", testController.get);

module.exports = router;
