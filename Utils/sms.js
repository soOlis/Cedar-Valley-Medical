const twilio = require("twilio");
require("dotenv").config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.TOKEN;
const twilioClient = twilio(accountSid, authToken);

async function sendSMS(phoneNumber, body) {
  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: process.env.TWILIO_NUMBER,
      to: phoneNumber,
    });
    return message;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send SMS");
  }
}

module.exports = sendSMS;
