const axios = require('axios');

module.exports = {
  async post(req, res) {

    const {
      given,
      family,
      email,
      phone,
      gender,
      birthdate,
      drNPI,
      scheduleDate,
      ssn
    } = req.body;

    // Checking for missing credentials
    const missingFields = [];
    if (!given) missingFields.push("First Name");
    if (!family) missingFields.push("Last Name");
    if (!email) missingFields.push("Contact email");
    if (!birthdate) missingFields.push("Date of Birth");
    if (!phone) missingFields.push("Contact Phone");
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
        const scheduleID = response.data?.entry[0]?.resource?.id

        const slotURL = `https://connect.healow.com/apps/api/v1/fhir/IFCABD/dstu2/Slot?schedule=${scheduleID}&slot-type=OA&start=&_count=`;
        axios.get(slotURL, { headers })
          .then(response => {


            const slotID = response.data?.entry[0]?.resource?.id
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
                        family
                      ],
                      "given": [
                        given
                      ],
                      "suffix": [
                        "MSc"
                      ]
                    }
                  ],
                  "telecom": [
                    {
                      "system": "phone",
                      "value": phone,
                      "use": "mobile"
                    },
                    {
                      "system": "email",
                      "value": email,
                      "use": "home"
                    }
                  ],
                  "gender": gender,
                  "birthDate": birthdate,

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
                const div = responseData.text.div;
                return res.status(201).json(div);
              })
              .catch(error => {
                console.error('Error-1:', error.message);

                return res.status(400).json({ message: error.message });
              });
          })
          .catch(error => {
            console.error('Error-2:', error.message);

            return res.status(400).json({ message: error.message });
          });
      })
      .catch(error => {
        console.error('Error-3:', error.message);

        return res.status(400).json({ message: error.message });
      });
  },
};
