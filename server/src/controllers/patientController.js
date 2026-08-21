const Patient = require("../models/patient");

// Register Patient
const registerPatient = async (req, res) => {
  try {
    const patient = new Patient(req.body);

    const savedPatient =
      await patient.save();

    res.status(201).json({
      success: true,
      message:
        "Patient registered successfully",
      data: savedPatient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Patients
const getAllPatients = async (req, res) => {
  try {
    const patients =
      await Patient.find();

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerPatient,
  getAllPatients,
};