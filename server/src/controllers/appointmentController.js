const Appointment = require("../models/Appointment");
const User = require("../models/User");
const crypto = require("crypto");

// =====================================================
// GET ALL REGISTERED DOCTORS
// Patient uses this to see available doctors
// =====================================================

const getRegisteredDoctors = async (req, res) => {
  try {
    if (req.user && req.user.role !== "patient") {
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
// BOOK / CREATE APPOINTMENT
// Patient books an appointment with a doctor
//
// POST /api/appointments/book
// =====================================================

const bookAppointment = async (req, res) => {
  try {
    // Only patients can book appointments
    if (req.user && req.user.role !== "patient") {
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

    // Check doctor
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

    // Validate appointment date
    const appointmentDate = new Date(scheduledAt);

    if (isNaN(appointmentDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date/time",
      });
    }

    // Appointment must be in the future
    if (appointmentDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment must be scheduled for a future date and time",
      });
    }

    // Check whether the doctor already has an appointment
    // at the requested time
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      scheduledAt: appointmentDate,
      status: {
        $in: ["requested", "accepted"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
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
    console.error("Book appointment error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// CREATE APPOINTMENT
// Alias for compatibility with existing code
// =====================================================

const createAppointment = bookAppointment;

// =====================================================
// GET ALL APPOINTMENTS
//
// GET /api/appointments
// =====================================================

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate(
        "doctor",
        "name email phone specialization qualification yearsOfExperience hospitalClinicName location consultationFee preferredLanguage"
      )
      .populate(
        "patient",
        "name email phone age gender location preferredLanguage"
      )
      .sort({
        scheduledAt: 1,
      });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error("Get all appointments error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET PATIENT APPOINTMENTS
//
// GET /api/appointments/patient/:patientId
// =====================================================

const getPatientAppointments = async (req, res) => {
  try {
    // Prefer logged-in user's ID for security
    const patientId =
      req.user && req.user.role === "patient"
        ? req.user.userId
        : req.params.patientId;

    const appointments = await Appointment.find({
      patient: patientId,
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
      count: appointments.length,
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
//
// GET /api/appointments/doctor/:doctorId
// =====================================================

const getDoctorAppointments = async (req, res) => {
  try {
    // Prefer logged-in doctor's ID
    const doctorId =
      req.user && req.user.role === "doctor"
        ? req.user.userId
        : req.params.doctorId;

    const appointments = await Appointment.find({
      doctor: doctorId,
    })
      .populate(
        "patient",
        "name email phone age gender location preferredLanguage"
      )
      .populate(
        "doctor",
        "name email phone specialization qualification hospitalClinicName"
      )
      .sort({
        scheduledAt: 1,
      });

    return res.status(200).json({
      success: true,
      count: appointments.length,
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
//
// PUT /api/appointments/:id/status
//
// Doctor accepts/rejects/completes/cancels appointment
// =====================================================

const updateAppointmentStatus = async (req, res) => {
  try {
    // Only doctors can update appointment status
    if (req.user && req.user.role !== "doctor") {
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
        message:
          "Invalid appointment status. Use accepted, rejected, completed or cancelled",
      });
    }

    // Find appointment
    const appointment = await Appointment.findOne({
      _id: id,
      ...(req.user && req.user.role === "doctor"
        ? { doctor: req.user.userId }
        : {}),
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

    // Update status
    appointment.status = status;

    // =====================================================
    // CREATE JITSI ROOM WHEN ACCEPTED
    // =====================================================

    if (status === "accepted" && !appointment.meetLink) {
      const roomId = crypto.randomUUID();

      appointment.meetLink =
        `https://meet.jit.si/health-${roomId}`;
    }

    // Remove meeting link when rejected/cancelled
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
  bookAppointment,
  createAppointment,
  getAllAppointments,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
};