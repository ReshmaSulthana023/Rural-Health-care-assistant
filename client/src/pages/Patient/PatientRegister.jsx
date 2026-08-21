import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerPatient } from "../../services/patientService";

import "../../styles/PatientRegister.css";

function PatientRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    city: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await registerPatient(formData);

      alert(response.message || "Registration Successful!");

      // 1. Extract patient object/data from backend response
      const patientData = response.data || response.patient || response;

      // 2. Persist patient info in localStorage so it can be accessed on booking
      if (patientData && (patientData._id || patientData.id)) {
        localStorage.setItem("currentPatient", JSON.stringify(patientData));

        // 3. Navigate directly to the Doctors page to pick a doctor
        navigate("/doctors");
      } else {
        alert("Registered, but could not retrieve Patient ID. Please try again.");
      }
    } catch (error) {
      console.error("Patient Registration Error:", error);

      alert(
        error.response?.data?.message || "Patient registration failed"
      );
    }
  };

  return (
    <div className="patient-register-page">
      <div className="patient-register-card">
        <h1>Patient Registration</h1>

        <p className="subtitle">
          Create your patient profile to book appointments.
        </p>

        <form onSubmit={handleSubmit} className="patient-form">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            required
          />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            rows="4"
          />

          <button type="submit" className="primary-button">
            Register & Find Doctor
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientRegister;