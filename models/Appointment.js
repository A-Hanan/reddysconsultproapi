const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    expertId: {
      type: String,
      required: true,
    },
    expert: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    description: {
      type: String,
      required: true,
    },
    isSeen: {
      type: Boolean,
      default: false,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = { Appointment };
