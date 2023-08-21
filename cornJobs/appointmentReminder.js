const cron = require("node-cron");
const Appointment = require("../models/appointment");
const sendSMS = require("../Utils/sms");

cron.schedule("0 0 * * *", async () => {
  // Calculate the date for appointments in 2 days
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  try {
    //  appointments within 2days
    const appointments = await Appointment.find({
      scheduleDate: twoDaysFromNow,
    });

    appointments.forEach(async (appointment) => {
      const phoneNumber = appointment.phoneNumber;
      const reminderMessage = "Your appointment is scheduled for [date].";

      await sendSMS(phoneNumber, reminderMessage);
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }
});
