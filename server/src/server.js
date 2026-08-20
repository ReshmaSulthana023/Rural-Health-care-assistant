require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const connectDB = require("./config/db");

// Routes
const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const symptomRoutes = require("./routes/symptomRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

// Create Express app
const app = express();


// ==========================================
// Connect to MongoDB
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

app.use("/api/doctors", doctorRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/symptoms", symptomRoutes);

app.use("/api/appointments", appointmentRoutes);


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