import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getDoctorAvailability,
  updateDoctorAvailability,
} from "../../services/availabilityService";

import "../../styles/DoctorAvailability.css";

function DoctorAvailability() {
  const { doctorId } =
    useParams();

  const [availability, setAvailability] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchAvailability =
      async () => {
        try {
          const response =
            await getDoctorAvailability(
              doctorId
            );

          setAvailability(
            response.data?.availability ||
              response.data ||
              []
          );
        } catch (error) {
          console.error(error);

          setAvailability([]);
        } finally {
          setLoading(false);
        }
      };

    fetchAvailability();
  }, [doctorId]);

  const addSlot = () => {
    setAvailability([
      ...availability,
      {
        day: "Monday",
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const updateSlot = (
    index,
    field,
    value
  ) => {
    const updated = [
      ...availability,
    ];

    updated[index][field] = value;

    setAvailability(updated);
  };

  const removeSlot = (index) => {
    setAvailability(
      availability.filter(
        (_, i) => i !== index
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response =
        await updateDoctorAvailability(
          doctorId,
          availability
        );

      alert(response.message);
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to update availability"
      );
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Loading availability...
      </div>
    );
  }

  return (
    <div className="availability-page">
      <div className="availability-card">
        <h1>
          Doctor Availability
        </h1>

        <p className="subtitle">
          Set the days and timings when
          patients can book appointments.
        </p>

        <form
          onSubmit={handleSubmit}
        >
          {availability.map(
            (slot, index) => (
              <div
                className="availability-row"
                key={index}
              >
                <select
                  value={slot.day}
                  onChange={(e) =>
                    updateSlot(
                      index,
                      "day",
                      e.target.value
                    )
                  }
                >
                  {days.map((day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {day}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={
                    slot.startTime
                  }
                  onChange={(e) =>
                    updateSlot(
                      index,
                      "startTime",
                      e.target.value
                    )
                  }
                />

                <input
                  type="time"
                  value={
                    slot.endTime
                  }
                  onChange={(e) =>
                    updateSlot(
                      index,
                      "endTime",
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  className="remove-button"
                  onClick={() =>
                    removeSlot(index)
                  }
                >
                  Remove
                </button>
              </div>
            )
          )}

          <div className="availability-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={addSlot}
            >
              + Add Time Slot
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              Save Availability
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DoctorAvailability;