const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    mode: {
      type: String,
      enum: ["telemedicine", "in-person"],
      default: "telemedicine",
    },

    status: {
      type: String,
      enum: [
        "requested",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
      default: "requested",
    },

    // Jitsi meeting URL
    meetLink: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

module.exports = Appointment;