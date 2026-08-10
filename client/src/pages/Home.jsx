import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-card">
        <h1>Healthcare Portal</h1>
        <p>Please select your path to continue</p>

        <div className="role-selection">
          {/* Patient Card */}
          <div className="role-card patient-card">
            <div className="role-icon">👤</div>
            <h2>Patient</h2>
            <p>Register as a patient to find doctors and book consultations.</p>
            <div className="role-actions">
              <button
                className="btn primary-btn"
                onClick={() => navigate("/patients/register")}
              >
                Register as Patient
              </button>
              <button
                className="btn secondary-btn"
                onClick={() => navigate("/doctors")}
              >
                Browse Doctors
              </button>
            </div>
          </div>

          {/* Doctor Card */}
          <div className="role-card doctor-card">
            <div className="role-icon">🩺</div>
            <h2>Doctor</h2>
            <p>Register your medical practice and manage incoming patient bookings.</p>
            <div className="role-actions">
              <button
                className="btn primary-btn"
                onClick={() => navigate("/doctor/register")}
              >
                Register as Doctor
              </button>
              <button
                className="btn secondary-btn"
                onClick={() => navigate("/doctors")}
              >
                View Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;