import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerDoctor } from "../../services/doctorService";
import "../../styles/DoctorRegister.css";

function DoctorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    city: "",
    state: "",
    hospitalOrClinicName: "",
    hospitalType: "",
    address: "",
    image: "",
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
      const response = await registerDoctor(formData);

      console.log("Doctor registration response:", response);

      // Get the MongoDB ID of the newly registered doctor
      const doctorId = response.data._id;

      // Temporarily store doctor ID until authentication is implemented
      localStorage.setItem("doctorId", doctorId);

      alert(response.message);

      // Optional: go directly to the doctor's portal after registration
      navigate(`/doctors/${doctorId}/appointments`);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        qualification: "",
        experience: "",
        consultationFee: "",
        city: "",
        state: "",
        hospitalOrClinicName: "",
        hospitalType: "",
        address: "",
        image: "",
      });
    } catch (error) {
      console.error("FULL ERROR:", error);

      if (error.response) {
        console.log("STATUS:", error.response.status);
        console.log("DATA:", error.response.data);

        alert(
          error.response.data.message || "Server returned an error"
        );
      } else if (error.request) {
        console.log("REQUEST:", error.request);
        alert("Backend server is not reachable");
      } else {
        console.log("ERROR:", error.message);
        alert(error.message);
      }
    }
  };

  return (
    <div className="container">
      <div className="form-card">
        <h2>Doctor Registration</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            type="text"
            name="specialization"
            placeholder="Specialization"
            value={formData.specialization}
            onChange={handleChange}
          />

          <input
            type="text"
            name="qualification"
            placeholder="Qualification"
            value={formData.qualification}
            onChange={handleChange}
          />

          <input
            type="number"
            name="experience"
            placeholder="Experience (Years)"
            value={formData.experience}
            onChange={handleChange}
          />

          <input
            type="number"
            name="consultationFee"
            placeholder="Consultation Fee"
            value={formData.consultationFee}
            onChange={handleChange}
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />

          <input
            type="text"
            name="hospitalOrClinicName"
            placeholder="Hospital / Clinic Name"
            value={formData.hospitalOrClinicName}
            onChange={handleChange}
          />

          <select
            name="hospitalType"
            value={formData.hospitalType}
            onChange={handleChange}
          >
            <option value="">Select Hospital Type</option>
            <option value="Hospital">Hospital</option>
            <option value="Clinic">Clinic</option>
          </select>

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />

          <input
            type="text"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
          />

          <button type="submit">
            Register Doctor
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorRegister;