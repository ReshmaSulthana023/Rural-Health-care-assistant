import axios from "axios";

const API_URL = "http://localhost:5000/api/doctors";

export const registerDoctor = async (doctorData) => {
  const response = await axios.post(
    `${API_URL}/register`,
    doctorData
  );

  return response.data;
};