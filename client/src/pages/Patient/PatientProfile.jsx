import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getAllPatients,
} from "../../services/patientService";

import "../../styles/PatientProfile.css";

function PatientProfile() {
  const { patientId } =
    useParams();

  const [patient, setPatient] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response =
          await getAllPatients();

        const foundPatient =
          response.data.find(
            (patient) =>
              patient._id === patientId
          );

        setPatient(foundPatient);
      } catch (error) {
        console.error(error);

        alert(
          "Failed to load patient"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  if (loading) {
    return (
      <div className="loading">
        Loading profile...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="empty-state">
        Patient not found.
      </div>
    );
  }

  return (
    <div className="patient-profile-page">
      <div className="patient-profile-card">
        <div className="patient-avatar">
          {patient.name
            ?.charAt(0)
            .toUpperCase()}
        </div>

        <h1>
          {patient.name}
        </h1>

        <p className="profile-label">
          Patient Profile
        </p>

        <div className="patient-details">
          <div>
            <strong>
              Email
            </strong>
            <p>
              {patient.email}
            </p>
          </div>

          <div>
            <strong>
              Phone
            </strong>
            <p>
              {patient.phone}
            </p>
          </div>

          <div>
            <strong>
              Age
            </strong>
            <p>
              {patient.age}
            </p>
          </div>

          <div>
            <strong>
              Gender
            </strong>
            <p>
              {patient.gender}
            </p>
          </div>

          <div>
            <strong>
              City
            </strong>
            <p>
              {patient.city}
            </p>
          </div>

          <div>
            <strong>
              Address
            </strong>
            <p>
              {patient.address}
            </p>
          </div>
        </div>

        <Link
          to={`/patients/${patientId}/appointments`}
          className="primary-button"
        >
          My Appointments
        </Link>
      </div>
    </div>
  );
}

export default PatientProfile;