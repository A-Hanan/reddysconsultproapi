const mongoose = require("mongoose");

const ExpertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    linkedInProfile: {
      type: String,
      default: "",
    },
    profile: {
      type: String,
      default: "",
    },
    minFee: {
      type: Number,
      default: 50,
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },
    personalInfo: {
      type: Object,
    },
    professionalInfo: {
      type: Object,
    },
    bankAccountDetails: {
      type: Object,
    },
    appointmentFee: {
      type: Number,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    profileViews: {
      type: Number,
    },
    startAvailabilityTime: {
      type: String,
      default: "09:00:00",
    },
    endAvailabilityTime: {
      type: String,
      default: "21:00:00",
    },
  },
  {
    timestamps: true,
  }
);

const Expert = mongoose.models.Expert || mongoose.model("Expert", ExpertSchema);
module.exports = Expert;
