import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAllPatients } from "../../services/patientService";
import { getPatientAppointments } from "../../services/appointmentService";
import { getSymptomHistory } from "../../services/symptomService";
import "../../styles/HealthRecords.css";

function HealthRecords() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch patient profile
        const patientRes = await getAllPatients();
        const found = (patientRes.data || []).find((p) => p._id === patientId);
        setPatient(found || null);

        // Fetch appointments
        const apptRes = await getPatientAppointments(patientId);
        setAppointments(apptRes.data || []);

        // Fetch symptom history if token is available
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const sympRes = await getSymptomHistory(token);
            setSymptoms(sympRes.data || []);
          } catch (e) {
            console.log("Could not load symptom history", e);
          }
        }
      } catch (error) {
        console.error("Error loading health records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (loading) return <div className="loading">Loading health records...</div>;

  return (
    <div className="health-records-page">
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to={`/patients/${patientId}`}>&larr; Back to Profile</Link>
      </div>

      <div className="records-header">
        <h1>Digital Health Records 📁</h1>
        <p>Medical summary, consultation history, and symptom logs.</p>
      </div>

      {/* Patient Basic Info Card */}
      {patient && (
        <div className="records-card">
          <h2>Patient Details</h2>
          <div className="patient-info-grid">
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>Age:</strong> {patient.age} years</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
            <p><strong>Location:</strong> {patient.city || patient.address || "Not specified"}</p>
          </div>
        </div>
      )}

      {/* Consultations / Appointments History */}
      <div className="records-card">
        <h2>Past Consultations & Appointments ({appointments.length})</h2>
        {appointments.length === 0 ? (
          <p className="no-data">No appointments recorded.</p>
        ) : (
          <div className="records-list">
            {appointments.map((appt) => (
              <div key={appt._id} className="record-item">
                <div>
                  <h3>Doctor: Dr. {appt.doctor?.name || "Unassigned"} ({appt.doctor?.specialization || "General"})</h3>
                  <p><strong>Reason:</strong> {appt.reason || "General checkup"}</p>
                  <p><small>Scheduled: {new Date(appt.scheduledAt || appt.appointmentDate).toLocaleString()}</small></p>
                </div>
                <span className={`status-badge status-${(appt.status || "requested").toLowerCase()}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Symptom Checker History */}
      <div className="records-card">
        <h2>Symptom Check History ({symptoms.length})</h2>
        {symptoms.length === 0 ? (
          <p className="no-data">No symptom checks logged yet.</p>
        ) : (
          <div className="records-list">
            {symptoms.map((item) => (
              <div key={item._id} className="record-item">
                <div>
                  <h3>Symptoms: {Array.isArray(item.symptoms) ? item.symptoms.join(", ") : item.symptoms}</h3>
                  <p><strong>Possible Conditions:</strong> {item.result?.possibleConditions?.join(", ") || "N/A"}</p>
                  <p><strong>Recommendation:</strong> {item.result?.recommendation}</p>
                  <p><small>Checked on: {new Date(item.createdAt).toLocaleString()}</small></p>
                </div>
                <span className={`urgency-badge urgency-${(item.result?.urgency || "moderate").toLowerCase()}`}>
                  {item.result?.urgency || "Moderate"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthRecords;
