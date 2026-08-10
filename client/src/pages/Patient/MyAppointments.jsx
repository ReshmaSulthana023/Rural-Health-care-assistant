import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientAppointments } from "../../services/appointmentService";
import "../../styles/MyAppointment.css";

function MyAppointments() {
  const { patientId } = useParams();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await getPatientAppointments(patientId);
        setAppointments(response.data || []);
      } catch (error) {
        console.error(error);
        alert("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchAppointments();
    }
  }, [patientId]);

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  return (
    <div className="patient-appointments-page">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <p>View your upcoming and previous consultations.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <h3>No appointments</h3>
          <p>You haven't booked any appointments yet.</p>
        </div>
      ) : (
        <div className="patient-appointment-list">
          {appointments.map((appointment) => (
            <div
              className="patient-appointment-card"
              key={appointment._id}
            >
              <div className="appointment-top">
                <div>
                  <h2>Dr. {appointment.doctor?.name}</h2>
                  <p>{appointment.doctor?.specialization}</p>
                </div>

                <span
                  className={`status ${appointment.status?.toLowerCase()}`}
                >
                  {appointment.status || "Pending"}
                </span>
              </div>

              <div className="appointment-info">
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    appointment.appointmentDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Time:</strong> {appointment.appointmentTime}
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {appointment.reason || "Not provided"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAppointments;