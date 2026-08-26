import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Get symptom history for the logged-in patient (JWT-auth required)
export const getSymptomHistory = async (token) => {
  const response = await axios.get(`${BASE_URL}/symptoms/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
