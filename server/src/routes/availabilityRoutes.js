const express = require("express");

const router = express.Router();

const {
  updateAvailability
} = require("../controllers/availabilityController");

router.put(
  "/:id",
  updateAvailability
);

module.exports = router;