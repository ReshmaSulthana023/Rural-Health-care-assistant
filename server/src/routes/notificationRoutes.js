const express = require("express");

const router = express.Router();

const {
  getDoctorNotifications
} = require(
  "../controllers/notificationController"
);

router.get(
  "/doctor/:doctorId",
  getDoctorNotifications
);

module.exports = router;