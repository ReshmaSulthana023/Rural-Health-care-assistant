const express = require("express");

const router = express.Router();

const {
  bookAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

// ==========================================
// Book Appointment
// POST /api/appointments/book
// ==========================================

router.post("/book", bookAppointment);

// ==========================================
// Get All Appointments
// GET /api/appointments
// ==========================================

router.get("/", getAllAppointments);

// ==========================================
// Get Doctor Appointments
// GET /api/appointments/doctor/:doctorId
// ==========================================

router.get(
  "/doctor/:doctorId",
  getDoctorAppointments
);

// ==========================================
// Get Patient Appointments
// GET /api/appointments/patient/:patientId
// ==========================================

router.get(
  "/patient/:patientId",
  getPatientAppointments
);

// ==========================================
// Update Appointment Status
// PUT /api/appointments/:id/status
// ==========================================

router.put(
  "/:id/status",
  updateAppointmentStatus
);

module.exports = router;