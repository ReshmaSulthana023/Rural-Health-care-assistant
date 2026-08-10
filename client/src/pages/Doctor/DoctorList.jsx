import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDoctors, deleteDoctor } from "../../services/doctorService";
import "../../styles/DoctorList.css";

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const savedPatient = JSON.parse(localStorage.getItem("currentPatient"));

  const fetchDoctors = async () => {
    try {
      const response = await getAllDoctors();
      setDoctors(response.data || []);
    } catch (error) {
      console.error("Error loading doctors:", error);
      alert("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // BOOK APPOINTMENT
  const handleBook = (doctorId) => {
    if (!savedPatient || !savedPatient._id) {
      alert("Please register as a patient first!");
      navigate("/patients/register");
      return;
    }
    navigate(`/book-appointment/${doctorId}/${savedPatient._id}`);
  };

  // VIEW DOCTOR
  const handleView = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  // EDIT DOCTOR
  const handleEdit = (doctorId) => {
    navigate(`/doctors/${doctorId}/edit`);
  };

  // DELETE DOCTOR
  const handleDelete = async (doctorId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmDelete) return;

    try {
      const response = await deleteDoctor(doctorId);
      alert(response.message);
      fetchDoctors();
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        error.response?.data?.message || "Failed to delete doctor"
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading doctors...</div>;
  }

  return (
    <div className="doctor-list-page">
      <div className="doctor-list-header">
        <h1>Doctors</h1>
        <p>Find doctors and manage their profiles.</p>
      </div>

      {doctors.length === 0 ? (
        <div className="empty-state">
          <h3>No doctors found</h3>
          <p>No doctors are currently registered.</p>
        </div>
      ) : (
        <div className="doctor-grid">
          {doctors.map((doctor) => (
            <div className="doctor-card" key={doctor._id}>
              {/* Doctor Image */}
              <div className="doctor-image">
                {doctor.image ? (
                  <img src={doctor.image} alt={doctor.name} />
                ) : (
                  <div className="doctor-placeholder">Dr</div>
                )}
              </div>

              {/* Doctor Information */}
              <div className="doctor-info">
                <h2>Dr. {doctor.name}</h2>
                <p>
                  <strong>Specialization:</strong> {doctor.specialization}
                </p>
                <p>
                  <strong>Qualification:</strong> {doctor.qualification}
                </p>
                <p>
                  <strong>Experience:</strong> {doctor.experience} years
                </p>
                <p>
                  <strong>City:</strong> {doctor.city}
                </p>
                <p>
                  <strong>Consultation Fee:</strong> ₹{doctor.consultationFee}
                </p>

                {/* Buttons */}
                <div className="doctor-actions">
                  <button
                    className="primary-button"
                    onClick={() => handleBook(doctor._id)}
                  >
                    Book
                  </button>

                  <button
                    className="view-button"
                    onClick={() => handleView(doctor._id)}
                  >
                    View
                  </button>

                  <button
                    className="edit-button"
                    onClick={() => handleEdit(doctor._id)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(doctor._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorList;