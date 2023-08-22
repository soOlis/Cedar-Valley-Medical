
const PatientWaitList = require('../models/patientWaitList.model');

const getAllPWList = function (req, res) {
  PatientWaitList.findAll(function (err, patientWaitList) {
    console.log('controller')
    if (err)
      res.send(err);
    console.log('res', patientWaitList);
    res.send(patientWaitList);
  });
};

const createPWList = function (req, res) {
  
  const context = req.body.queryResult.outputContexts;

    const refContext = context.find((c) =>
      c.name.includes("botcopy-form-context")
    );

    const {
      drNPI,
      phoneNumber,
      birthday,
      email,
      firstName,
      scheduleDate,
      lastName,
      gender,
      type,
      appointment_date,
    } = refContext.parameters;

    const errbody = `Sorry, Your appointment for ${scheduleDate} couldn't be scheduled.`;

    // Checking for missing credentials
    const missingFields = [];
    if (!lastName) missingFields.push("First Name");
    if (!firstName) missingFields.push("Last Name");
    if (!email) missingFields.push("Contact email");
    if (!birthday) missingFields.push("Date of Birth");
    if (!phoneNumber) missingFields.push("Contact Phone");
    if (!drNPI) missingFields.push("Dr NPI");
    if (!scheduleDate) missingFields.push("Schedule Date");
    if (!gender) missingFields.push("Gender");

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing credentials: ${missingFields.join(", ")}` });
    }
  //handles null error
  const vstatus='WAITING';
  const new_PatientWaitList = new PatientWaitList({
    drNPI,
    phoneNumber,
    birthday,
    email,
    firstName,
    lastName,
    scheduleDate,
    ssn,
    gender,
    type,
    appointment_date,
    vstatus, });
    new_PatientWaitList.save((err, patientWaitList)=> {
      if (err)
        res.send(err);
      res.json({ error: false, message: "Patient successfully into wait list!", data: patientWaitList });
    });
  
  
};
const findByPatientId = function (req, res) {
  PatientWaitList.findByPatientId(req.params.id, function (err, patientWaitList) {
    if (err)
      res.send(err);
    res.json(patientWaitList);
  });
};

const getPWListById = function (req, res) {
  PatientWaitList.findById(req.params.id, function (err, patientWaitList) {
    if (err)
      res.send(err);
    res.json(patientWaitList);
  });
};
const updatePWList =  (req, res) =>{
  if (req.body.constructor === Object && Object.keys(req.body).length === 0) {
    res.status(400).send({ error: true, message: 'Please provide all required field' });
  } else {
    PatientWaitList.findByIdAndUpdate(req.params.id, new PatientWaitList(req.body), function (err, patientWaitList) {
      if (err)
        res.send(err);
      res.json({ error: false, message: 'PatientWaitList successfully updated' });
    });
  }
};

const deletePWList = (req, res) => {
  PatientWaitList.delete(req.params.id, function (err, patientWaitList) {
    if (err)
      res.send(err);
    res.json({ error: false, message: 'Patient successfully deleted from Wait List' });
  });
};

module.exports = {
  createPWList,
  getAllPWList,
  getPWListById,
  deletePWList,
  updatePWList,
  findByPatientId
};