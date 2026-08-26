import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPatientAppointments } from "../../services/appointmentService";
import { confirmDirectPayment, createPaymentOrder, verifyPayment } from "../../services/paymentService";
import "../../styles/MyAppointment.css";

function MyAppointments() {
  const { patientId } = useParams();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("gpay");
  const [txnIdInput, setTxnIdInput] = useState("");
  const [payMessage, setPayMessage] = useState("");

  const fetchAppointments = async () => {
    try {
      const response = await getPatientAppointments(patientId);
      setAppointments(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!patientId) return;

    fetchAppointments();

    const interval = setInterval(() => {
      fetchAppointments();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [patientId]);

  const handleJoinConsultation = (meetLink) => {
    if (!meetLink) {
      alert("The consultation link is not available yet.");
      return;
    }
    window.open(meetLink, "_blank", "noopener,noreferrer");
  };

  const handleOpenPayment = (appt) => {
    setSelectedAppointment(appt);
    setActiveTab("gpay");
    setTxnIdInput("");
    setPayMessage("");
  };

  const handleClosePayment = () => {
    setSelectedAppointment(null);
    setPayMessage("");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied: ${text}`);
  };

  const handleConfirmDirectPay = async (method) => {
    if (!selectedAppointment) return;
    try {
      setPayMessage("Processing payment...");
      const res = await confirmDirectPayment(selectedAppointment._id, method, txnIdInput);
      alert(res.message || "Payment recorded successfully!");
      handleClosePayment();
      fetchAppointments();
    } catch (err) {
      setPayMessage(err.response?.data?.message || err.message || "Payment failed");
    }
  };

  const handleRazorpayPay = async () => {
    if (!selectedAppointment) return;
    if (!window.Razorpay) {
      alert("Razorpay checkout is loading. Please try again.");
      return;
    }

    try {
      setPayMessage("Initializing Razorpay checkout...");
      const orderRes = await createPaymentOrder(selectedAppointment._id);
      const { orderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "Swasthya Saathi",
        description: "Completed consultation fee",
        order_id: orderId,
        handler: async (response) => {
          try {
            await verifyPayment(selectedAppointment._id, response);
            alert("Payment verified successfully!");
            handleClosePayment();
            fetchAppointments();
          } catch (vErr) {
            alert(vErr.response?.data?.message || "Payment verification failed");
          }
        },
        theme: { color: "#0f7668" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPayMessage(err.response?.data?.message || err.message || "Unable to start Razorpay");
    }
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  const doctorPhone = selectedAppointment?.doctor?.phone || "";
  const cleanPhone = doctorPhone ? doctorPhone.replace(/\D/g, "") : "";
  const doctorUpi = cleanPhone ? `${cleanPhone}@upi` : "doctor@upi";
  const doctorFee = selectedAppointment?.doctor?.consultationFee || 0;
  const doctorName = selectedAppointment?.doctor?.name || "Doctor";
  const upiUrl = cleanPhone
    ? `upi://pay?pa=${encodeURIComponent(doctorUpi)}&pn=${encodeURIComponent("Dr " + doctorName)}&am=${doctorFee}&cu=INR`
    : "#";

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
          {appointments.map((appointment) => {
            const isCompleted = appointment.status?.toLowerCase() === "completed";
            const isPaid = appointment.payment?.status === "paid";

            return (
              <div className="patient-appointment-card" key={appointment._id}>
                {/* Doctor + Status */}
                <div className="appointment-top">
                  <div>
                    <h2>Dr. {appointment.doctor?.name}</h2>
                    <p>{appointment.doctor?.specialization}</p>
                  </div>
                  <span className={`status ${appointment.status?.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </div>

                {/* Appointment Information */}
                <div className="appointment-info">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(appointment.appointmentDate || appointment.scheduledAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {appointment.appointmentTime || "Scheduled"}
                  </p>
                  <p>
                    <strong>Reason:</strong> {appointment.reason || "Not provided"}
                  </p>
                  {appointment.doctor?.consultationFee !== undefined && (
                    <p>
                      <strong>Consultation Fee:</strong> ₹{appointment.doctor.consultationFee}
                    </p>
                  )}
                </div>

                {/* Pending */}
                {appointment.status === "Pending" && (
                  <div className="appointment-message">
                    <p>⏳ Your appointment request has been sent to the doctor.</p>
                    <p>Waiting for the doctor to confirm your appointment.</p>
                  </div>
                )}

                {/* Confirmed */}
                {appointment.status === "Confirmed" && (
                  <div className="consultation-section">
                    <div className="success-message">
                      <p>
                        ✅ <strong>Dr. {appointment.doctor?.name}</strong> has accepted your appointment.
                      </p>
                    </div>
                    {appointment.meetLink ? (
                      <button
                        className="join-consultation-button"
                        onClick={() => handleJoinConsultation(appointment.meetLink)}
                      >
                        🎥 Join Consultation
                      </button>
                    ) : (
                      <p>Your appointment is confirmed. Consultation link is being prepared.</p>
                    )}
                  </div>
                )}

                {/* Rejected */}
                {appointment.status === "Rejected" && (
                  <div className="appointment-message">
                    <p>❌ The doctor rejected this appointment request.</p>
                  </div>
                )}

                {/* Cancelled */}
                {appointment.status === "Cancelled" && (
                  <div className="appointment-message">
                    <p>This appointment has been cancelled.</p>
                  </div>
                )}

                {/* Completed */}
                {isCompleted && (
                  <div className="appointment-message" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0 }}>✅ Consultation completed.</p>
                      {isPaid && <span className="status-paid-badge" style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", background: "#d1fae5", color: "#065f46", borderRadius: 4, fontWeight: 700, fontSize: 12 }}>Paid</span>}
                    </div>
                    {!isPaid && (
                      <button
                        className="pay-fee-button"
                        style={{ padding: "8px 14px", background: "#0f7668", color: "#fff", border: 0, borderRadius: 8, cursor: "pointer", fontWeight: 700 }}
                        onClick={() => handleOpenPayment(appointment)}
                      >
                        Pay ₹{appointment.doctor?.consultationFee || 0} via UPI / GPay
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Selection Modal */}
      {selectedAppointment && (
        <div className="payment-modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="payment-modal-card" style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 460, width: "90%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>💳 Pay Consultation Fee</h3>
              <button onClick={handleClosePayment} style={{ border: 0, background: "none", fontSize: 22, cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ background: "#e4f4ef", padding: 12, borderRadius: 10, marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 4px", color: "#0f7668" }}>Dr. {doctorName}</h4>
              <p style={{ margin: "2px 0", fontSize: 13 }}>Consultation Fee: <strong>₹{doctorFee}</strong></p>
              <p style={{ margin: "2px 0", fontSize: 13 }}>Doctor Phone: <strong>📞 {doctorPhone || "N/A"}</strong></p>
            </div>

            {payMessage && (
              <div style={{ padding: 8, background: "#fef3c7", color: "#92400e", borderRadius: 6, marginBottom: 12, fontSize: 13, fontWeight: "bold" }}>
                {payMessage}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setActiveTab("gpay")}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #0f7668", background: activeTab === "gpay" ? "#0f7668" : "#fff", color: activeTab === "gpay" ? "#fff" : "#333", fontWeight: 700, cursor: "pointer" }}
              >
                📲 GPay
              </button>
              <button
                onClick={() => setActiveTab("upi")}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #0f7668", background: activeTab === "upi" ? "#0f7668" : "#fff", color: activeTab === "upi" ? "#fff" : "#333", fontWeight: 700, cursor: "pointer" }}
              >
                💸 UPI Pay
              </button>
              <button
                onClick={() => setActiveTab("razorpay")}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #0f7668", background: activeTab === "razorpay" ? "#0f7668" : "#fff", color: activeTab === "razorpay" ? "#fff" : "#333", fontWeight: 700, cursor: "pointer" }}
              >
                💳 Razorpay
              </button>
            </div>

            {activeTab === "gpay" && (
              <div>
                <p style={{ fontSize: 13, color: "#666" }}>Pay directly using Doctor's Google Pay number:</p>
                <div style={{ background: "#f3f4f6", padding: 10, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700 }}>{doctorPhone || "No phone available"}</span>
                  {doctorPhone && (
                    <button onClick={() => handleCopy(doctorPhone)} style={{ padding: "4px 8px", background: "#0f7668", color: "#fff", border: 0, borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                      Copy
                    </button>
                  )}
                </div>
                <a href={upiUrl} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", background: "#4285F4", color: "#fff", padding: 10, borderRadius: 8, textDecoration: "none", fontWeight: 700, marginBottom: 12 }}>
                  🚀 Open GPay App
                </a>
                <input
                  type="text"
                  placeholder="Transaction Ref / UTR (Optional)"
                  value={txnIdInput}
                  onChange={(e) => setTxnIdInput(e.target.value)}
                  style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6, marginBottom: 12, boxSizing: "border-box" }}
                />
                <button onClick={() => handleConfirmDirectPay("gpay")} style={{ width: "100%", padding: 10, background: "#0f7668", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  ✅ Confirm GPay Payment
                </button>
              </div>
            )}

            {activeTab === "upi" && (
              <div>
                <p style={{ fontSize: 13, color: "#666" }}>Pay via any UPI app using Doctor's UPI ID:</p>
                <div style={{ background: "#f3f4f6", padding: 10, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 700 }}>{doctorUpi}</span>
                  <button onClick={() => handleCopy(doctorUpi)} style={{ padding: "4px 8px", background: "#0f7668", color: "#fff", border: 0, borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
                    Copy UPI ID
                  </button>
                </div>
                <a href={upiUrl} target="_blank" rel="noreferrer" style={{ display: "block", textAlign: "center", background: "#0f7668", color: "#fff", padding: 10, borderRadius: 8, textDecoration: "none", fontWeight: 700, marginBottom: 12 }}>
                  📱 Open Any UPI App
                </a>
                <input
                  type="text"
                  placeholder="UPI Ref / UTR (Optional)"
                  value={txnIdInput}
                  onChange={(e) => setTxnIdInput(e.target.value)}
                  style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6, marginBottom: 12, boxSizing: "border-box" }}
                />
                <button onClick={() => handleConfirmDirectPay("upi")} style={{ width: "100%", padding: 10, background: "#0f7668", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  ✅ Confirm UPI Payment
                </button>
              </div>
            )}

            {activeTab === "razorpay" && (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>Pay securely via Cards, NetBanking or Razorpay Gateway.</p>
                <button onClick={handleRazorpayPay} style={{ width: "100%", padding: 10, background: "#0f7668", color: "#fff", border: 0, borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                  💳 Pay via Razorpay
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAppointments;