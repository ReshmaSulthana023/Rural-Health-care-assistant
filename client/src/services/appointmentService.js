import axios from "axios";

const API_URL =
  "http://localhost:5000/api/appointments";

// Book Appointment
export const bookAppointment = async (
  appointmentData
) => {
  const response = await axios.post(
    `${API_URL}/book`,
    appointmentData
  );

  return response.data;
};

// Get All Appointments
export const getAllAppointments = async () => {
  const response = await axios.get(API_URL);

  return response.data;
};

// Get Doctor Appointments
export const getDoctorAppointments = async (
  doctorId
) => {
  const response = await axios.get(
    `${API_URL}/doctor/${doctorId}`
  );

  return response.data;
};

// Get Patient Appointments
export const getPatientAppointments = async (
  patientId
) => {
  const response = await axios.get(
    `${API_URL}/patient/${patientId}`
  );

  return response.data;
};

// Update Appointment Status
export const updateAppointmentStatus = async (
 id,
  status
) => {
  const response = await axios.put(
    `${API_URL}/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};