const axios = require("axios");
const { strExtraxt } = require("../Utils/stringExtractor");
const sendSMS = require("../Utils/sms");
const connectDB = require("../DB/db");
const Appointment = require("../models/appointment");

module.exports = {
  async post(req, res) {
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

    const scheduleURL = `https://connect.healow.com/apps/api/v1/fhir/IFCABD/dstu2/Schedule?actor=${drNPI}&date=${scheduleDate}&type=none&identifier=none&actor.location=142`;
    const token =
      "AA1.U4F2SGVisczY3PEyi9rAzi_1NqoubiCeHsvQdLYyn5zThJNvoDGz2y3cirJocXU3igDBlg33nlj6JfGzE4hcWmUNiAZ6qQnqmZb8WE9ivjJGF-Dwhk1y4vCxUGDpOYalyAh8-PSKvXt2uJA8hEQR65dr08GKh3F8_ENQV-M-QUf4NCvyhuw9llKeZgtAVVjC";

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(scheduleURL, { headers })
      .then((response) => {
        const scheduleID =
          response.data &&
          response.data.entry &&
          response.data.entry[0] &&
          response.data.entry[0].resource &&
          response.data.entry[0].resource.id;

        const slotURL = `https://connect.healow.com/apps/api/v1/fhir/IFCABD/dstu2/Slot?schedule=${scheduleID}&slot-type=OA&start=&_count=`;
        axios
          .get(slotURL, { headers })
          .then((response) => {
            const slotID =
              response.data &&
              response.data.entry &&
              response.data.entry[0] &&
              response.data.entry[0].resource &&
              response.data.entry[0].resource.id;

            console.log("sloID", slotID);
            const appointmentURL = `https://connect.healow.com/apps/api/v1/fhir/IFCABD/dstu2/Appointment?`;
            const payload = {
              resourceType: "Appointment",
              contained: [
                {
                  resourceType: "Patient",
                  id: `${email}-${birthday}`,
                  name: [
                    {
                      use: "usual",
                      family: [firstName],
                      given: [lastName],
                      suffix: ["MSc"],
                    },
                  ],
                  telecom: [
                    {
                      system: "phone",
                      value: phoneNumber,
                      use: "mobile",
                    },
                    {
                      system: "email",
                      value: email,
                      use: "home",
                    },
                  ],
                  gender: gender,
                  birthDate: birthday,

                  managingOrganization: {
                    reference: "Organization/f001",
                    display: "Burgers University Medical Centre",
                  },
                },
                {
                  resourceType: "Coverage",
                  type: {
                    coding: [
                      {
                        system:
                          "eCW_insurance_coding_system(Cash/Insurance/Not-Applicable)",
                        code: "insurance_code",
                        display: "insurance name",
                      },
                    ],
                    text: "insurance name",
                  },
                },
              ],
              id: "",
              status: "proposed",
              reason: {
                text: "The reason that this appointment is being scheduled. (e.g. Regular checkup)",
              },
              description:
                "The brief description of the appointment as would be shown on a subject line in a meeting request, or appointment list.",
              slot: [
                {
                  reference: slotID,
                },
              ],
              comment: "Additional comments about the appointment.",
              participant: [
                {
                  actor: {
                    reference: "Practitioner/1234564789",
                  },
                  required: "required",
                },
              ],
            };

            const headers2 = {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json+fhir",
            };
            axios
              .post(appointmentURL, payload, { headers: headers2 })

              .then(async (response) => {
                try {
                  // Extract the relevant data from the response object
                  const responseData = response.data;

                  console.log("Appointment Confirmation", responseData);

                  //extract string data from responce
                  const extractedData = strExtraxt(responseData.text.div);

                  const smsBody = `Thank you, ${firstName} Your appointment has been reserved for ${extractedData.date} at ${extractedData.time}.  Please complete the appropriate forms before your visit, which you can find here:
                https://cedarvalleygi.com/patient-forms/`;

                  await sendSMS(phoneNumber, smsBody);

                  // return res.status(201);
                } catch (err) {
                  return res.status(400);
                }

                try {
                  //save data to database
                  await connectDB();

                  const newAppointment = new Appointment({
                    drNPI,
                    phoneNumber,
                    birthday,
                    email,
                    firstName,
                    lastName,
                    scheduleDate,
                    ssn,
                    gender,
                    // executed: null,
                    // executionResponseMessage: null,
                  });
                  //save data to database and send responce
                  await newAppointment.save();

                  return res.status(201);
                } catch (err) {
                  console.log(err);
                  return res.status(400);
                }
              })
              .catch((error) => {
                console.error("Error-1:", error.message);

                sendSMS(phoneNumber, errbody)
                  .then(() => {
                    return res.status(201);
                  })
                  .catch((err) => {
                    console.log(err);
                    return res.status(400);
                  });
              });
          })
          .catch((error) => {
            console.error("Error-2:", error.message);

            sendSMS(phoneNumber, errbody)
              .then(() => {
                return res.status(201);
              })
              .catch((err) => {
                console.log(err);
                return res.status(400);
              });
          });
      })
      .catch((error) => {
        sendSMS(phoneNumber, errbody)
          .then(() => {
            return res.status(201);
          })
          .catch((err) => {
            console.log(err);
            return res.status(400);
          });
      });
  },
};
