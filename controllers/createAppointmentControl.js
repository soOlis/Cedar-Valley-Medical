const axios = require('axios');

module.exports = {
  async post(req, res) {

    const context = req.body.queryResult.outputContexts;
    console.log("context ", context);

    const refContext = context.find((c) => c.name.includes('botcopy-form-context'));

    const {
      drNPI,
      phoneNumber,
      birthday,
      email,
      firstName,
      scheduleDate,
      ssn,
      lastName,
      gender
    } = refContext.parameters;

    console.log("refContext  ", drNPI,
      phoneNumber,
      birthday,
      email,
      firstName,
      scheduleDate,
      ssn,
      lastName,
      gender);


    // Checking for missing credentials
    const missingFields = [];
    if (!lastName) missingFields.push("First Name");
    if (!firstName) missingFields.push("Last Name");
    if (!email) missingFields.push("Contact email");
    if (!birthday) missingFields.push("Date of Birth");
    if (!phoneNumber) missingFields.push("Contact Phone");
    if (!drNPI) missingFields.push("Dr NPI");
    if (!scheduleDate) missingFields.push("Schedule Date");
    if (!ssn) missingFields.push("SSN");
    if (!gender) missingFields.push("Gender");

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing credentials: ${missingFields.join(", ")}` });
    }

    const scheduleURL = `https://connect.healow.com/apps/api/v1/fhir/IFCABD/dstu2/Schedule?actor=${drNPI}&date=${scheduleDate}&type=none&identifier=none&actor.location=142`;
    const token = 'AA1.U4F2SGVisczY3PEyi9rAzi_1NqoubiCeHsvQdLYyn5zThJNvoDGz2y3cirJocXU3igDBlg33nlj6JfGzE4hcWmUNiAZ6qQnqmZb8WE9ivjJGF-Dwhk1y4vCxUGDpOYalyAh8-PSKvXt2uJA8hEQR65dr08GKh3F8_ENQV-M-QUf4NCvyhuw9llKeZgtAVVjC';

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    axios.get(scheduleURL, { headers })
      .then(response => {
        const scheduleID = response.data && response.data.entry && response.data.entry[0] && response.data.entry[0].resource && response.data.entry[0].resource.id;

        const slotURL = `https://connect.healow.com/apps/api/v1/fhir/IFCABD/dstu2/Slot?schedule=${scheduleID}&slot-type=OA&start=&_count=`;
        axios.get(slotURL, { headers })
          .then(response => {

            const slotID = response.data && response.data.entry && response.data.entry[0] && response.data.entry[0].resource && response.data.entry[0].resource.id;

            console.log("sloID", slotID);
            const appointmentURL = `https://connect.healow.com/apps/api/v1/fhir/IFCABD/dstu2/Appointment?`;
            const payload = {
              "resourceType": "Appointment",
              "contained": [
                {
                  "resourceType": "Patient",
                  "id": ssn,
                  "name": [
                    {
                      "use": "usual",
                      "family": [
                        firstName
                      ],
                      "given": [
                        lastName
                      ],
                      "suffix": [
                        "MSc"
                      ]
                    }
                  ],
                  "telecom": [
                    {
                      "system": "phone",
                      "value": phoneNumber,
                      "use": "mobile"
                    },
                    {
                      "system": "email",
                      "value": email,
                      "use": "home"
                    }
                  ],
                  "gender": gender,
                  "birthDate": birthday,

                  "managingOrganization": {
                    "reference": "Organization/f001",
                    "display": "Burgers University Medical Centre"
                  }
                },
                {
                  "resourceType": "Coverage",
                  "type": {
                    "coding": [
                      {
                        "system": "eCW_insurance_coding_system(Cash/Insurance/Not-Applicable)",
                        "code": "insurance_code",
                        "display": "insurance name"
                      }
                    ],
                    "text": "insurance name"
                  }
                }
              ],
              "id": "",
              "status": "proposed",
              "reason": {
                "text": "The reason that this appointment is being scheduled. (e.g. Regular checkup)"
              },
              "description": "The brief description of the appointment as would be shown on a subject line in a meeting request, or appointment list.",
              "slot": [
                {
                  "reference": slotID
                }
              ],
              "comment": "Additional comments about the appointment.",
              "participant": [
                {
                  "actor": {
                    "reference": "Practitioner/1234564789"
                  },
                  "required": "required"
                }
              ]
            }

            const headers2 = {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json+fhir'
            };
            axios.post(appointmentURL, payload, { headers: headers2 })

              .then(response => {

                // Extract the relevant data from the response object
                const responseData = response.data;

                console.log("Appointment Confirmation", responseData);
                // const div = ;

                const div = {
                  fulfillmentMessages: [
                    {
                      payload: {
                        botcopy: [
                          {
                            text: [
                              {
                                ssml: `<speak>${responseData.text.div}</speak>`,
                                displayText: responseData.text.div,
                                textToSpeech: responseData.text.div,
                              },
                            ],
                          },
                        ],
                      },
                      message: 'payload',
                    },
                  ],
                };
                return res.status(201).json(div);
              })
              .catch(error => {
                console.error('Error-1:', error.message);
                const div = {
                  fulfillmentMessages: [
                    {
                      payload: {
                        botcopy: [
                          {
                            text: [
                              {
                                ssml: `<speak>${error.message}</speak>`,
                                displayText: error.message,
                                textToSpeech: error.message,
                              },
                            ],
                          },
                        ],
                      },
                      message: 'payload',
                    },
                  ],
                };

                return res.status(400).json(div);
              });
          })
          .catch(error => {
            console.error('Error-2:', error.message);
            const div = {
              fulfillmentMessages: [
                {
                  payload: {
                    botcopy: [
                      {
                        text: [
                          {
                            ssml: `<speak>${error.message}</speak>`,
                            displayText: error.message,
                            textToSpeech: error.message,
                          },
                        ],
                      },
                    ],
                  },
                  message: 'payload',
                },
              ],
            };

            return res.status(400).json(div);
          });
      })
      .catch(error => {
        const div = {
          fulfillmentMessages: [
            {
              payload: {
                botcopy: [
                  {
                    text: [
                      {
                        ssml: `<speak>${error.message}</speak>`,
                        displayText: error.message,
                        textToSpeech: error.message,
                      },
                    ],
                  },
                ],
              },
              message: 'payload',
            },
          ],
        };

        return res.status(400).json(div);
      });
  },
};
