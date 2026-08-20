const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================================
// REGISTER USER
// =====================================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,

      // Patient fields
      age,
      gender,

      // Common fields
      location,
      preferredLanguage,

      // Doctor fields
      medicalRegistrationNumber,
      specialization,
      qualification,
      yearsOfExperience,
      hospitalClinicName,
      consultationFee,
    } = req.body;

    // ---------------------------------------------
    // Basic validation
    // ---------------------------------------------

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    // Check valid role
    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either patient or doctor",
      });
    }

    // ---------------------------------------------
    // Check patient-specific fields
    // ---------------------------------------------

    if (role === "patient") {
      if (
        age === undefined ||
        !gender ||
        !location ||
        !preferredLanguage
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Patient registration requires age, gender, location and preferred language",
        });
      }
    }

    // ---------------------------------------------
    // Check doctor-specific fields
    // ---------------------------------------------

    if (role === "doctor") {
      if (
        !medicalRegistrationNumber ||
        !specialization ||
        !qualification ||
        yearsOfExperience === undefined ||
        !hospitalClinicName ||
        !location ||
        consultationFee === undefined ||
        !preferredLanguage
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Doctor registration requires medical registration number, specialization, qualification, experience, hospital/clinic, location, consultation fee and preferred language",
        });
      }
    }

    // ---------------------------------------------
    // Check if email already exists
    // ---------------------------------------------

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // ---------------------------------------------
    // Hash password
    // ---------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------------------------------------------
    // Common user data
    // ---------------------------------------------

    const userData = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role,
      location: location || "",
      preferredLanguage: preferredLanguage || "English",
    };

    // ---------------------------------------------
    // Add Patient-specific data
    // ---------------------------------------------

    if (role === "patient") {
      userData.age = age;
      userData.gender = gender;
    }

    // ---------------------------------------------
    // Add Doctor-specific data
    // ---------------------------------------------

    if (role === "doctor") {
      userData.medicalRegistrationNumber =
        medicalRegistrationNumber;

      userData.specialization = specialization;

      userData.qualification = qualification;

      userData.yearsOfExperience =
        yearsOfExperience;

      userData.hospitalClinicName =
        hospitalClinicName;

      userData.consultationFee =
        consultationFee;
    }

    // ---------------------------------------------
    // Create user
    // ---------------------------------------------

    const user = new User(userData);

    const savedUser = await user.save();

    // ---------------------------------------------
    // Remove password before sending response
    // ---------------------------------------------

    const userResponse = savedUser.toObject();

    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: `${role} account registered successfully`,
      data: userResponse,
    });

  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// LOGIN USER
// =====================================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
    } = req.body;

    // ---------------------------------------------
    // Validate required fields
    // ---------------------------------------------

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and role are required",
      });
    }

    // Validate role
    if (!["patient", "doctor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // ---------------------------------------------
    // Find user by email
    // ---------------------------------------------

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ---------------------------------------------
    // Make sure selected role matches account role
    // ---------------------------------------------

    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message:
          `This account is registered as a ${user.role}. Please select ${user.role} login.`,
      });
    }

    // ---------------------------------------------
    // Compare password
    // ---------------------------------------------

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ---------------------------------------------
    // Create JWT
    // ---------------------------------------------

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ---------------------------------------------
    // Remove password
    // ---------------------------------------------

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: userResponse,
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// GET PROFILE
// =====================================================

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // ---------------------------------------------
    // Validate required fields
    // ---------------------------------------------

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    // ---------------------------------------------
    // Validate password length
    // ---------------------------------------------

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // ---------------------------------------------
    // Find user
    // ---------------------------------------------

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // ---------------------------------------------
    // Hash new password
    // ---------------------------------------------

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // ---------------------------------------------
    // Update password
    // ---------------------------------------------

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  resetPassword,
};