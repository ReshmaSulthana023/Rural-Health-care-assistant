import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getDoctorById } from "../../services/doctorService";
import "../../styles/DoctorProfile.css";

function DoctorProfile() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const savedPatient = JSON.parse(
    localStorage.getItem("currentPatient")
  );

  const patientId = savedPatient?._id;

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await getDoctorById(doctorId);
        setDoctor(response.data);
      } catch (error) {
        console.error(error);
        alert("Failed to load doctor profile");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  const handleBookClick = (e) => {
    if (!patientId) {
      e.preventDefault();

      alert(
        "Please register or log in as a patient first!"
      );

      navigate("/patients/register");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Loading profile...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="empty-state">
        Doctor not found.
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* =========================
            Doctor Header
        ========================= */}

        <div className="profile-top">

          {doctor.image ? (
            <img
              src={doctor.image}
              alt={doctor.name}
              className="profile-image"
            />
          ) : (
            <div className="profile-placeholder">
              Dr
            </div>
          )}

          <div>

            <h1>
              Dr. {doctor.name}
            </h1>

            <p className="profile-specialization">
              {doctor.specialization}
            </p>

            <p>
              {doctor.experience} years experience
            </p>

          </div>

        </div>

        {/* =========================
            Doctor Details
        ========================= */}

        <div className="profile-details">

          <div>
            <strong>Qualification</strong>
            <p>{doctor.qualification}</p>
          </div>

          <div>
            <strong>Consultation Fee</strong>
            <p>₹{doctor.consultationFee}</p>
          </div>

          <div>
            <strong>Hospital / Clinic</strong>
            <p>
              {doctor.hospitalOrClinicName}
            </p>
          </div>

          <div>
            <strong>Location</strong>
            <p>
              {doctor.city}, {doctor.state}
            </p>
          </div>

          <div>
            <strong>Address</strong>
            <p>{doctor.address}</p>
          </div>

        </div>

        {/* =========================
            Patient Action
        ========================= */}

        <div className="profile-actions">

          <Link
            to={
              patientId
                ? `/book-appointment/${doctor._id}/${patientId}`
                : "#"
            }
            onClick={handleBookClick}
            className="primary-button"
          >
            Book Appointment
          </Link>

        </div>

      </div>

    </div>
  );
}

export default DoctorProfile;