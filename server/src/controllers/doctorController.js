const Doctor = require("../models/doctor");

// Register a new doctor
const registerDoctor = async (req, res) => {
  try {
    // Create a new doctor document
    const doctor = new Doctor(req.body);

    // Save to MongoDB
    const savedDoctor = await doctor.save();

    // Send success response
    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      data: savedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerDoctor,
};