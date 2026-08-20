require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db");

// Routes
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const authRoutes = require("./routes/authRoutes");
const symptomRoutes = require("./routes/symptomRoutes");

const app = express();

// ==========================================
// Connect Database
// ==========================================

connectDB();

// ==========================================
// Middleware
// ==========================================

app.use(cors());
app.use(helmet());
app.use(express.json());

// ==========================================
// Routes
// ==========================================

// Doctor Routes
app.use("/api/doctors", doctorRoutes);

// Patient Routes
app.use("/api/patients", patientRoutes);

// Doctor Availability Routes
app.use("/api/availability", availabilityRoutes);

// Appointment Routes
app.use("/api/appointments", appointmentRoutes);

// Notification Routes
app.use("/api/notifications", notificationRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/symptoms", symptomRoutes);

// ==========================================
// Test Route
// ==========================================

app.get("/ping", (req, res) => {
  res.json({
    status: "ok",
  });
});

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
