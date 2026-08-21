import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDoctors } from "../../services/doctorService";
import "../../styles/DoctorList.css";

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const savedPatient = JSON.parse(
    localStorage.getItem("currentPatient")
  );

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

  // ==============================
  // BOOK APPOINTMENT
  // ==============================

  const handleBook = (doctorId) => {
    if (!savedPatient || !savedPatient._id) {
      alert("Please register as a patient first!");
      navigate("/patients/register");
      return;
    }

    navigate(
      `/book-appointment/${doctorId}/${savedPatient._id}`
    );
  };

  // ==============================
  // VIEW DOCTOR PROFILE
  // ==============================

  const handleView = (doctorId) => {
    navigate(`/doctors/${doctorId}`);
  };

  // ==============================
  // MY APPOINTMENTS
  // ==============================

  const handleMyAppointments = () => {
    if (!savedPatient || !savedPatient._id) {
      alert("Please register as a patient first!");
      navigate("/patients/register");
      return;
    }

    navigate(
      `/patients/${savedPatient._id}/appointments`
    );
  };

  if (loading) {
    return (
      <div className="loading">
        Loading doctors...
      </div>
    );
  }

  return (
    <div className="doctor-list-page">

      <div className="doctor-list-header">

        <h1>Find a Doctor</h1>

        <p>
          Browse doctors and book an appointment
          with the specialist you need.
        </p>

        {/* Patient appointment button */}
        <button
          className="primary-button"
          onClick={handleMyAppointments}
        >
          My Appointments
        </button>

      </div>

      {doctors.length === 0 ? (
        <div className="empty-state">

          <h3>No doctors found</h3>

          <p>
            No doctors are currently registered.
          </p>

        </div>
      ) : (

        <div className="doctor-grid">

          {doctors.map((doctor) => (

            <div
              className="doctor-card"
              key={doctor._id}
            >

              <div className="doctor-image">

                {doctor.image ? (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                  />
                ) : (
                  <div className="doctor-placeholder">
                    
                  </div>
                )}

              </div>

              <div className="doctor-info">

                <h2>
                  Dr. {doctor.name}
                </h2>

                <p>
                  <strong>Specialization:</strong>{" "}
                  {doctor.specialization}
                </p>

                <p>
                  <strong>Qualification:</strong>{" "}
                  {doctor.qualification}
                </p>

                <p>
                  <strong>Experience:</strong>{" "}
                  {doctor.experience} years
                </p>

                <p>
                  <strong>City:</strong>{" "}
                  {doctor.city}
                </p>

                <p>
                  <strong>Consultation Fee:</strong>{" "}
                  ₹{doctor.consultationFee}
                </p>

                <div className="doctor-actions">

                  <button
                    className="primary-button"
                    onClick={() =>
                      handleBook(doctor._id)
                    }
                  >
                    Book Appointment
                  </button>

                  <button
                    className="view-button"
                    onClick={() =>
                      handleView(doctor._id)
                    }
                  >
                    View Profile
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