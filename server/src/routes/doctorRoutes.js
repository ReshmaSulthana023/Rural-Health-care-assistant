const express = require("express");
const router = express.Router();

const { registerDoctor } = require("../controllers/doctorController");

// Register Doctor
router.post("/register", registerDoctor);

module.exports = router;
