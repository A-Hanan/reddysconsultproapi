const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
    },
    professionalism: {
      type: Number,
      required: true,
    },
    communication: {
      type: Number,
      required: true,
    },
    behaviour: {
      type: Number,
      required: true,
    },
    satisfaction: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    appointmentId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = { Review };
