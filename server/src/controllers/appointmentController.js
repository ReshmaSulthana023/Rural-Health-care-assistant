const Appointment = require("../models/appointment");
const crypto = require("crypto");

// ==========================================
// Book Appointment
// ==========================================

const bookAppointment = async (req, res) => {
  try {
    const {
      doctor,
      patient,
      appointmentDate,
      appointmentTime,
      reason,
    } = req.body;

    // Check if the selected slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor,
      appointmentDate,
      appointmentTime,
      status: {
        $in: ["Pending", "Confirmed"],
      },
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: "This appointment slot is already booked",
      });
    }

    // Create appointment
    const appointment = new Appointment({
      doctor,
      patient,
      appointmentDate,
      appointmentTime,
      reason,
    });

    const savedAppointment = await appointment.save();

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: savedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get All Appointments
// ==========================================

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor")
      .populate("patient")
      .sort({
        appointmentDate: 1,
      });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Doctor's Appointments
// ==========================================

const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
    })
      .populate("patient")
      .sort({
        appointmentDate: 1,
      });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Get Patient's Appointments
// ==========================================

const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.params.patientId,
    })
      .populate("doctor")
      .sort({
        appointmentDate: 1,
      });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// Update Appointment Status
// ==========================================

const updateAppointmentStatus = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const { status } = req.body;

    // Validate status
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Rejected",
      "Cancelled",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status",
      });
    }

    appointment.status = status;

    // ==========================================
    // Telemedicine
    // Generate meeting link when appointment
    // is confirmed
    // ==========================================

    if (status === "Confirmed" && !appointment.meetLink) {
      const roomId = crypto.randomUUID();

      appointment.meetLink = `https://meet.jit.si/health-${roomId}`;
    }

    // If appointment is rejected or cancelled,
    // remove the meeting link if one exists.
    if (
      status === "Rejected" ||
      status === "Cancelled"
    ) {
      appointment.meetLink = null;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  bookAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
};