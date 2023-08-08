const sendSMS = require("../Utils/sms");

module.exports = {
  async post(req, res) {
    const portalLink = "https://mypay.poscorp.com/cvmedspcl#/account/login";
    const data = req.body;

    // data.phone_number
    if (
      data &&
      data.sessionInfo &&
      data.sessionInfo.parameters &&
      data.sessionInfo.parameters["phone-number"] &&
      data.fulfillmentInfo &&
      data.fulfillmentInfo.tag &&
      ["billing portal"].includes(data.fulfillmentInfo.tag)
    ) {
      const phoneNumber = data.sessionInfo.parameters["phone-number"];
      let body = "";
      if (data.fulfillmentInfo.tag == "billing portal") {
        body =
          "Your payment portal link: https://mypay.poscorp.com/cvmedspcl#/account/login";
      }

      try {
        await sendSMS(phoneNumber, body);

        const response = {
          fulfillment_response: {
            messages: [
              {
                text: {
                  text: [
                    `Thank you for providing your phone number. We have sent you a message with the payment portal link. Please check your phone. Let me know if you need any further assistance.`,
                  ],
                },
              },
            ],
          },
        };

        res.json(response);
      } catch (error) {
        console.error("Error sending SMS:", error);
        res.status(500).send("Internal server error");
      }
    } else {
      res.status(400).send("Bad request");
    }
  },
};
