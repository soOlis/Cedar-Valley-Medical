const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentSchema = new Schema({
  drNPI: { type: String },
  phoneNumber: { type: String, require: true },
  birthday: { type: Date },
  email: { type: String, require: true, unique: true },
  firstName: { type: String, require: true },
  lastName: { type: String },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other", "Prefer not to say"],
  },
  scheduleDate: { type: Date },
  ssn: { type: String, require: true },
  // executed: { type: Boolean, default: null },
  // executionResponseMessage: { type: String, default: null },
});

module.exports = Appointment = mongoose.model("appointment", appointmentSchema);
