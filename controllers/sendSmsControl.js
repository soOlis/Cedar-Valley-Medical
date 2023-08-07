const twilio = require("twilio");
require("dotenv").config();

module.exports = {
  async post(req, res) {

    const accountSid = process.env.ACCOUNT_SID;
    const authToken = process.env.TOKEN;
    const portalLink = "https://mypay.poscorp.com/cvmedspcl#/account/login";
    const twilioClient = twilio(accountSid, authToken);
    const data = req.body;

    // data.phone_number
    if (data && data.sessionInfo && data.sessionInfo.parameters && data.sessionInfo.parameters.user_number) {
      const phoneNumber = data.sessionInfo.parameters.user_number;

      try {
        const message = await twilioClient.messages.create({
          body: `Your payment portal link: ${portalLink}`, //message to user's number
          from: process.env.TWILIO_NUMBER, //"TWILIO_PHONE_NUMBER",
          to: phoneNumber,
        });

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
