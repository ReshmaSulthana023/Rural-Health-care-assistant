import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bookAppointment } from "../../services/appointmentService";
import "../../styles/BookAppointment.css";

function BookAppointment() {
  const { doctorId, patientId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await bookAppointment({
        doctor: doctorId,
        patient: patientId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
      });

      alert(response.message || "Appointment booked successfully!");

      setFormData({
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });

      navigate(`/patients/${patientId}/appointments`);
    } catch (error) {
      console.error("Appointment booking error:", error);
      alert(
        error.response?.data?.message || "Failed to book appointment"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="book-appointment-page">
      <div className="book-appointment-container">
        <h1>Book Appointment</h1>
        <p className="subtitle">
          Choose a convenient date and time for your consultation.
        </p>

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-group">
            <label>Appointment Date</label>
            <input
              type="date"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Appointment Time</label>
            <input
              type="time"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Reason for Visit</label>
            <textarea
              name="reason"
              placeholder="Briefly describe your reason for consultation"
              value={formData.reason}
              onChange={handleChange}
              rows="5"
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookAppointment;