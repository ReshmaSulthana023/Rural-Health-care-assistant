import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";
import "../../pages/Doctor/DoctorAppointment"
import "../../styles/DoctorAppointment.css";

function DoctorAppointments() {
  const { doctorId } =
    useParams();

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const fetchAppointments = async () => {
    try {
      const response =
        await getDoctorAppointments(
          doctorId
        );

      setAppointments(
        response.data || []
      );
    } catch (error) {
      console.error(error);

      alert(
        "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId]);

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      const response =
        await updateAppointmentStatus(
          id,
          status
        );

      alert(response.message);

      fetchAppointments();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update appointment"
      );
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <h1>My Appointments</h1>

        <p>
          Manage appointment requests
          from your patients.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <h3>
            No appointments yet
          </h3>

          <p>
            Patient bookings will appear
            here.
          </p>
        </div>
      ) : (
        <div className="appointment-list">
          {appointments.map(
            (appointment) => (
              <div
                className="appointment-card"
                key={appointment._id}
              >
                <div className="appointment-top">
                  <div>
                    <h2>
                      {
                        appointment
                          .patient?.name
                      }
                    </h2>

                    <p>
                      {
                        appointment
                          .patient?.phone
                      }
                    </p>
                  </div>

                  <span
                    className={`status ${appointment.status.toLowerCase()}`}
                  >
                    {
                      appointment.status
                    }
                  </span>
                </div>

                <div className="appointment-info">
                  <div>
                    <strong>
                      Date
                    </strong>

                    <p>
                      {new Date(
                        appointment.appointmentDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Time
                    </strong>

                    <p>
                      {
                        appointment.appointmentTime
                      }
                    </p>
                  </div>

                  <div>
                    <strong>
                      Reason
                    </strong>

                    <p>
                      {appointment.reason ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                {appointment.status ===
                  "Pending" && (
                  <div className="appointment-actions">
                    <button
                      className="confirm-button"
                      onClick={() =>
                        updateStatus(
                          appointment._id,
                          "Confirmed"
                        )
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="reject-button"
                      onClick={() =>
                        updateStatus(
                          appointment._id,
                          "Rejected"
                        )
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}

                {appointment.status ===
                  "Confirmed" && (
                  <button
                    className="complete-button"
                    onClick={() =>
                      updateStatus(
                        appointment._id,
                        "Completed"
                      )
                    }
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;