import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getDoctorById,
  updateDoctor,
} from "../../services/doctorService";

import "../../styles/DoctorEdit.css";

function DoctorEdit() {
  const { doctorId } =
    useParams();

  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
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

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response =
          await getDoctorById(
            doctorId
          );

        setFormData(response.data);
      } catch (error) {
        console.error(error);

        alert(
          "Failed to load doctor"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response =
        await updateDoctor(
          doctorId,
          formData
        );

      alert(response.message);

      navigate(
        `/doctors/${doctorId}`
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update doctor"
      );
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="edit-page">
      <div className="edit-card">
        <h1>Edit Doctor Profile</h1>

        <form
          onSubmit={handleSubmit}
          className="edit-form"
        >
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
          />

          <input
            name="specialization"
            placeholder="Specialization"
            value={
              formData.specialization
            }
            onChange={handleChange}
          />

          <input
            name="qualification"
            placeholder="Qualification"
            value={
              formData.qualification
            }
            onChange={handleChange}
          />

          <input
            type="number"
            name="experience"
            placeholder="Experience in years"
            value={
              formData.experience
            }
            onChange={handleChange}
          />

          <input
            type="number"
            name="consultationFee"
            placeholder="Consultation Fee"
            value={
              formData.consultationFee
            }
            onChange={handleChange}
          />

          <input
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
          />

          <input
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
          />

          <input
            name="hospitalOrClinicName"
            placeholder="Hospital / Clinic Name"
            value={
              formData.hospitalOrClinicName
            }
            onChange={handleChange}
          />

          <select
            name="hospitalType"
            value={
              formData.hospitalType
            }
            onChange={handleChange}
          >
            <option value="">
              Select Type
            </option>

            <option value="Hospital">
              Hospital
            </option>

            <option value="Clinic">
              Clinic
            </option>
          </select>

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
          />

          <input
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="primary-button"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorEdit;