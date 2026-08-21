import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getDoctorNotifications,
} from "../../services/notificationService";

import "../../styles/Notification.css";

function Notification() {
  const { doctorId } =
    useParams();

  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchNotifications =
      async () => {
        try {
          const response =
            await getDoctorNotifications(
              doctorId
            );

          setNotifications(
            response.data || []
          );
        } catch (error) {
          console.error(error);

          alert(
            "Failed to load notifications"
          );
        } finally {
          setLoading(false);
        }
      };

    fetchNotifications();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="loading">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>
          Notifications 🔔
        </h1>

        <p>
          Stay updated with your
          appointment activity.
        </p>
      </div>

      {notifications.length ===
      0 ? (
        <div className="empty-state">
          <h3>
            No notifications
          </h3>

          <p>
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map(
            (notification) => (
              <div
                className={`notification-card ${
                  notification.isRead
                    ? "read"
                    : "unread"
                }`}
                key={
                  notification._id
                }
              >
                <div className="notification-icon">
                  🔔
                </div>

                <div>
                  <p>
                    {
                      notification.message
                    }
                  </p>

                  <small>
                    {new Date(
                      notification.createdAt
                    ).toLocaleString()}
                  </small>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default Notification;