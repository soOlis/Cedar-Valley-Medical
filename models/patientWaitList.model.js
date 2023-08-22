const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PatientWaitListSchema = new Schema({
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
    type: {type: String,},
    appointment_date: {type: Date,},
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});
module.exports = PatientWaitList = mongoose.model("patient_wait_list", PatientWaitListSchema);
