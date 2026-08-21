import axios from "axios";

const API_URL =
  "http://localhost:5000/api/notifications";

export const getDoctorNotifications =
  async (doctorId) => {

    const response = await axios.get(
      `${API_URL}/doctor/${doctorId}`
    );

    return response.data;
  };