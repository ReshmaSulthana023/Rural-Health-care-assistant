import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getDoctorNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

import "../../styles/Notification.css";

function Notification() {
  const { doctorId } = useParams();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await getDoctorNotifications(doctorId);
      setNotifications(response.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [doctorId]);

  // Mark a single notification as read (PRD 5.8)
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      // Update local state so UI reflects change instantly
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  // Mark all unread notifications as read
  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    try {
      await Promise.all(unread.map((n) => markNotificationAsRead(n._id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
        <div>
          <h1>Notifications 🔔</h1>
          <p>Stay updated with your appointment activity.</p>
        </div>

        {unreadCount > 0 && (
          <button
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <h3>No notifications</h3>
          <p>You're all caught up.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
            <div
              className={`notification-card ${
                notification.isRead ? "read" : "unread"
              }`}
              key={notification._id}
            >
              <div className="notification-icon">
                {notification.isRead ? "📭" : "🔔"}
              </div>

              <div className="notification-body">
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.createdAt).toLocaleString()}
                </small>
              </div>

              {!notification.isRead && (
                <button
                  className="mark-read-btn"
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notification;