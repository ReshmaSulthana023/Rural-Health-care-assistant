const express = require("express");

const router = express.Router();

// Import appointment controller
const appointmentController = require("../controllers/appointmentController");

// Import authentication middleware
const protect = require("../middleware/authMiddleware");


// Patient gets all registered doctors
router.get(
  "/doctors",
  protect,
  appointmentController.getRegisteredDoctors
);

// Patient books an appointment
router.post(
  "/",
  protect,
  appointmentController.createAppointment
);

// Patient gets their appointments
router.get(
  "/patient",
  protect,
  appointmentController.getPatientAppointments
);

// Doctor gets their appointments
router.get(
  "/doctor",
  protect,
  appointmentController.getDoctorAppointments
);

// Doctor accepts/rejects appointment
router.patch(
  "/:id/status",
  protect,
  appointmentController.updateAppointmentStatus
);


// Export router
module.exports = router;