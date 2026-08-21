import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getMedicinesByPatient, addMedicine, deleteMedicine } from "../../services/medicineService";
import "../../styles/PatientMedicine.css";

function PatientMedicine() {
  const { patientId } = useParams();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await getMedicinesByPatient(patientId);
      setMedicines(res.data);
    } catch (error) {
      console.error("Failed to load medicines", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMed = {
        patientId,
        medicineName,
        dosage,
        frequency,
        time,
        startDate,
        endDate,
      };
      await addMedicine(newMed);
      alert("Medicine reminder added!");
      
      // Reset form
      setMedicineName("");
      setDosage("");
      setFrequency("");
      setTime("");
      setStartDate("");
      setEndDate("");
      
      // Refresh list
      fetchMedicines();
    } catch (error) {
      console.error(error);
      alert("Failed to add medicine reminder");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      try {
        await deleteMedicine(id);
        alert("Reminder deleted");
        fetchMedicines();
      } catch (error) {
        console.error(error);
        alert("Failed to delete reminder");
      }
    }
  };

  if (loading) return <div>Loading medicines...</div>;

  return (
    <div className="medicine-page">
      <div style={{ marginBottom: "1rem" }}>
        <Link to={`/patients/${patientId}`}>&larr; Back to Profile</Link>
      </div>

      <div className="medicine-card">
        <h2>Add Medicine Reminder</h2>
        <form className="medicine-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine Name</label>
              <input
                type="text"
                required
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Paracetamol"
              />
            </div>
            <div className="form-group">
              <label>Dosage</label>
              <input
                type="text"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 Tablet"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Frequency</label>
              <select required value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="">Select Frequency</option>
                <option value="Once a day">Once a day</option>
                <option value="Twice a day">Twice a day</option>
                <option value="Three times a day">Three times a day</option>
                <option value="As needed">As needed</option>
              </select>
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">Add Reminder</button>
        </form>
      </div>

      <div className="medicine-card">
        <h2>Your Reminders</h2>
        {medicines.length === 0 ? (
          <p>No medicine reminders found.</p>
        ) : (
          <div className="medicine-list">
            {medicines.map((med) => (
              <div key={med._id} className="medicine-item">
                <div className="medicine-info">
                  <h3>{med.medicineName} - {med.dosage}</h3>
                  <p><strong>Frequency:</strong> {med.frequency} at {med.time}</p>
                  <p><strong>Duration:</strong> {new Date(med.startDate).toLocaleDateString()} to {new Date(med.endDate).toLocaleDateString()}</p>
                </div>
                <button className="delete-btn" onClick={() => handleDelete(med._id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientMedicine;
