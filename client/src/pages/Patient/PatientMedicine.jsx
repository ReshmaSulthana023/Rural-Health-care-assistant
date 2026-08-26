import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getMedicinesByPatient,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from "../../services/medicineService";
import "../../styles/PatientMedicine.css";

const emptyForm = {
  medicineName: "",
  dosage: "",
  frequency: "",
  time: "",
  startDate: "",
  endDate: "",
};

function PatientMedicine() {
  const { patientId } = useParams();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);

  // For inline editing
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

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

  // Handle Add form input change
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle Edit form input change
  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  // Add new medicine
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMedicine({ patientId, ...form });
      setForm(emptyForm);
      fetchMedicines();
    } catch (error) {
      console.error(error);
      alert("Failed to add medicine reminder");
    }
  };

  // Start editing a medicine
  const handleEdit = (med) => {
    setEditingId(med._id);
    setEditForm({
      medicineName: med.medicineName,
      dosage: med.dosage,
      frequency: med.frequency,
      time: med.time,
      startDate: med.startDate?.split("T")[0] || "",
      endDate: med.endDate?.split("T")[0] || "",
    });
  };

  // Save edited medicine
  const handleEditSave = async (id) => {
    try {
      await updateMedicine(id, editForm);
      setEditingId(null);
      fetchMedicines();
    } catch (error) {
      console.error(error);
      alert("Failed to update medicine reminder");
    }
  };

  // Delete medicine
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reminder?")) {
      try {
        await deleteMedicine(id);
        fetchMedicines();
      } catch (error) {
        console.error(error);
        alert("Failed to delete reminder");
      }
    }
  };

  if (loading) return <div className="loading">Loading medicines...</div>;

  return (
    <div className="medicine-page">
      <div style={{ marginBottom: "1rem" }}>
        <Link to={`/patients/${patientId}`}>&larr; Back to Profile</Link>
      </div>

      {/* ── Add Medicine Form ── */}
      <div className="medicine-card">
        <h2>Add Medicine Reminder</h2>
        <form className="medicine-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Medicine Name</label>
              <input
                type="text"
                name="medicineName"
                required
                value={form.medicineName}
                onChange={handleChange}
                placeholder="e.g. Paracetamol"
              />
            </div>
            <div className="form-group">
              <label>Dosage</label>
              <input
                type="text"
                name="dosage"
                required
                value={form.dosage}
                onChange={handleChange}
                placeholder="e.g. 1 Tablet"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Frequency</label>
              <select
                name="frequency"
                required
                value={form.frequency}
                onChange={handleChange}
              >
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
                name="time"
                required
                value={form.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                required
                value={form.startDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                required
                value={form.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Add Reminder
          </button>
        </form>
      </div>

      {/* ── Medicines List ── */}
      <div className="medicine-card">
        <h2>Your Reminders</h2>
        {medicines.length === 0 ? (
          <p>No medicine reminders found.</p>
        ) : (
          <div className="medicine-list">
            {medicines.map((med) =>
              editingId === med._id ? (
                /* ── Inline Edit Form ── */
                <div key={med._id} className="medicine-item edit-mode">
                  <div className="medicine-info" style={{ flex: 1 }}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Medicine Name</label>
                        <input
                          type="text"
                          name="medicineName"
                          value={editForm.medicineName}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Dosage</label>
                        <input
                          type="text"
                          name="dosage"
                          value={editForm.dosage}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Frequency</label>
                        <select
                          name="frequency"
                          value={editForm.frequency}
                          onChange={handleEditChange}
                        >
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
                          name="time"
                          value={editForm.time}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          value={editForm.startDate}
                          onChange={handleEditChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          value={editForm.endDate}
                          onChange={handleEditChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="medicine-actions">
                    <button
                      className="save-btn"
                      onClick={() => handleEditSave(med._id)}
                    >
                      Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Normal Card ── */
                <div key={med._id} className="medicine-item">
                  <div className="medicine-info">
                    <h3>
                      {med.medicineName} — {med.dosage}
                    </h3>
                    <p>
                      <strong>Frequency:</strong> {med.frequency} at {med.time}
                    </p>
                    <p>
                      <strong>Duration:</strong>{" "}
                      {new Date(med.startDate).toLocaleDateString()} to{" "}
                      {new Date(med.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="medicine-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(med)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(med._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientMedicine;
