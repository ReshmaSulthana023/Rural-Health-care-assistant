const Appointment = require("../models/Appointment");
const User = require("../models/User");
const crypto = require("crypto");
// =====================================================
// GET ALL REGISTERED DOCTORS
// Patient uses this to see available doctors
// =====================================================

const getRegisteredDoctors = async (req, res) => {
  try {
    // Only patients can view the doctor directory
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can view registered doctors",
      });
    }

    const doctors = await User.find({
      role: "doctor",
    })
      .select(
        "name email phone specialization qualification yearsOfExperience hospitalClinicName location consultationFee preferredLanguage"
      )
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Get doctors error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// CREATE APPOINTMENT
// Patient books an appointment with a doctor
// =====================================================

const createAppointment = async (req, res) => {
  try {
    // Only patients can book appointments
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can book appointments",
      });
    }

    const {
      doctorId,
      scheduledAt,
      reason,
      mode,
    } = req.body;

    // Check required fields
    if (!doctorId || !scheduledAt || !reason) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, appointment date/time and reason are required",
      });
    }

    // Check whether doctor exists
    const doctor = await User.findOne({
      _id: doctorId,
      role: "doctor",
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check that appointment time is in the future
    const appointmentDate = new Date(scheduledAt);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date/time",
      });
    }

    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Appointment must be scheduled for a future date and time",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.userId,
      doctor: doctorId,
      scheduledAt: appointmentDate,
      reason: reason.trim(),
      mode: mode || "telemedicine",
      status: "requested",
    });

    // Get complete appointment information
    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate(
        "patient",
        "name email phone age gender location preferredLanguage"
      )
      .populate(
        "doctor",
        "name email phone specialization qualification yearsOfExperience hospitalClinicName location consultationFee preferredLanguage"
      );

    return res.status(201).json({
      success: true,
      message: "Appointment request sent successfully",
      data: populatedAppointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET PATIENT APPOINTMENTS
// Patient sees all their appointments
// =====================================================

const getPatientAppointments = async (req, res) => {
  try {
    // Only patients can access this
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access patient appointments",
      });
    }

    const appointments = await Appointment.find({
      patient: req.user.userId,
    })
      .populate(
        "doctor",
        "name email phone specialization qualification yearsOfExperience hospitalClinicName location consultationFee preferredLanguage"
      )
      .sort({
        scheduledAt: 1,
      });

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Get patient appointments error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET DOCTOR APPOINTMENTS
// Doctor sees consultation requests
// =====================================================

const getDoctorAppointments = async (req, res) => {
  try {
    // Only doctors can access this
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can access doctor appointments",
      });
    }

    const appointments = await Appointment.find({
      doctor: req.user.userId,
    })
      .populate(
        "patient",
        "name email phone age gender location preferredLanguage"
      )
      .populate(
        "doctor",
        "name specialization qualification hospitalClinicName"
      )
      .sort({
        scheduledAt: 1,
      });

    return res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// UPDATE APPOINTMENT STATUS
// Doctor accepts / rejects appointment
// =====================================================

const updateAppointmentStatus = async (req, res) => {
  try {
    // Only doctors can update appointment status
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update appointment status",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "accepted",
      "rejected",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    // Find appointment belonging to this doctor
    const appointment = await Appointment.findOne({
      _id: id,
      doctor: req.user.userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Requested appointment can only be accepted/rejected
    if (
      (status === "accepted" || status === "rejected") &&
      appointment.status !== "requested"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This appointment request has already been processed",
      });
    }

    // Update appointment status
    appointment.status = status;

    // ==========================================
    // CREATE JITSI ROOM WHEN DOCTOR ACCEPTS
    // ==========================================

    if (
      status === "accepted" &&
      !appointment.meetLink
    ) {
      const roomId = crypto.randomUUID();

      appointment.meetLink =
        `https://meet.jit.si/health-${roomId}`;
    }

    // Remove meeting link if appointment is rejected/cancelled
    if (
      status === "rejected" ||
      status === "cancelled"
    ) {
      appointment.meetLink = null;
    }

    await appointment.save();

    // Get updated appointment
    const updatedAppointment =
      await Appointment.findById(appointment._id)
        .populate(
          "patient",
          "name email phone age gender location preferredLanguage"
        )
        .populate(
          "doctor",
          "name email specialization qualification hospitalClinicName"
        );

    let message =
      "Appointment status updated successfully";

    if (status === "accepted") {
      message =
        "Appointment accepted and Jitsi consultation created";
    }

    if (status === "rejected") {
      message =
        "Appointment rejected successfully";
    }

    if (status === "completed") {
      message =
        "Appointment marked as completed";
    }

    if (status === "cancelled") {
      message =
        "Appointment cancelled";
    }

    return res.status(200).json({
      success: true,
      message,
      data: updatedAppointment,
    });

  } catch (error) {
    console.error(
      "Update appointment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

module.exports = {
  getRegisteredDoctors,
  createAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};