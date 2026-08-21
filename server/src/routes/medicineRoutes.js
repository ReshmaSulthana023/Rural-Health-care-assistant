const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");

// Get all medicines for a specific patient
router.get("/patient/:patientId", medicineController.getMedicinesByPatient);

// Add a new medicine
router.post("/", medicineController.addMedicine);

// Update a medicine
router.put("/:id", medicineController.updateMedicine);

// Delete a medicine
router.delete("/:id", medicineController.deleteMedicine);

module.exports = router;
