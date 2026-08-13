import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientAppointments } from "../../services/appointmentService";
import "../../styles/MyAppointment.css";

function MyAppointments() {
  const { patientId } = useParams();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const response =
        await getPatientAppointments(patientId);

      setAppointments(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId) return;

    // Initial load
    fetchAppointments();

    // Check for status/link changes every 5 seconds
    const interval = setInterval(() => {
      fetchAppointments();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [patientId]);

  const handleJoinConsultation = (meetLink) => {
    if (!meetLink) {
      alert(
        "The consultation link is not available yet."
      );
      return;
    }

    window.open(
      meetLink,
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <div className="loading">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="patient-appointments-page">

      <div className="appointments-header">

        <h1>My Appointments</h1>

        <p>
          View your upcoming and previous
          consultations.
        </p>

      </div>

      {appointments.length === 0 ? (

        <div className="empty-state">

          <h3>No appointments</h3>

          <p>
            You haven't booked any appointments yet.
          </p>

        </div>

      ) : (

        <div className="patient-appointment-list">

          {appointments.map((appointment) => (

            <div
              className="patient-appointment-card"
              key={appointment._id}
            >

              {/* Doctor + Status */}

              <div className="appointment-top">

                <div>

                  <h2>
                    Dr. {appointment.doctor?.name}
                  </h2>

                  <p>
                    {appointment.doctor?.specialization}
                  </p>

                </div>

                <span
                  className={`status ${appointment.status?.toLowerCase()}`}
                >
                  {appointment.status}
                </span>

              </div>

              {/* Appointment Information */}

              <div className="appointment-info">

                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    appointment.appointmentDate
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {appointment.appointmentTime}
                </p>

                <p>
                  <strong>Reason:</strong>{" "}
                  {appointment.reason ||
                    "Not provided"}
                </p>

              </div>

              {/* Pending */}

              {appointment.status === "Pending" && (

                <div className="appointment-message">

                  <p>
                    ⏳ Your appointment request has
                    been sent to the doctor.
                  </p>

                  <p>
                    Waiting for the doctor to
                    confirm your appointment.
                  </p>

                </div>

              )}

              {/* Confirmed */}

              {appointment.status === "Confirmed" && (

                <div className="consultation-section">

                  <div className="success-message">

                    <p>
                      ✅ <strong>
                        Dr. {appointment.doctor?.name}
                      </strong>{" "}
                      has accepted your appointment.
                    </p>

                  </div>

                  {appointment.meetLink ? (

                    <button
                      className="join-consultation-button"
                      onClick={() =>
                        handleJoinConsultation(
                          appointment.meetLink
                        )
                      }
                    >
                      🎥 Join Consultation
                    </button>

                  ) : (

                    <p>
                      Your appointment is confirmed.
                      The consultation link is being
                      prepared.
                    </p>

                  )}

                </div>

              )}

              {/* Rejected */}

              {appointment.status === "Rejected" && (

                <div className="appointment-message">

                  <p>
                    ❌ The doctor rejected this
                    appointment request.
                  </p>

                </div>

              )}

              {/* Cancelled */}

              {appointment.status === "Cancelled" && (

                <div className="appointment-message">

                  <p>
                    This appointment has been
                    cancelled.
                  </p>

                </div>

              )}

              {/* Completed */}

              {appointment.status === "Completed" && (

                <div className="appointment-message">

                  <p>
                    ✅ This consultation has been
                    completed.
                  </p>

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default MyAppointments;