const router = require("express").Router();
const patientWaitList = require("../controllers/patientWaitLisControl");
 
router.post("/patientwaitlist", patientWaitList.createPWList);
module.exports = router;
