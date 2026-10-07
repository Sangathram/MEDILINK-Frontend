import React, { useEffect, useState } from "react";

const API = "http://localhost:8080";

const NotificationBell = ({ user, onOrderClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const loadNotifications = async () => {
    if (!user?.id || !token) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/api/notifications/user/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to load notifications");
        return;
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];

      setNotifications(list);

      const unread = list.filter(
        (item) => !item.readStatus
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error("Cannot load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await fetch(
        `${API}/api/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.ok) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, readStatus: true }
              : item
          )
        );

        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }
    } catch (error) {
      console.error(
        "Cannot mark notification as read:",
        error
      );
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;

    try {
      const response = await fetch(
        `${API}/api/notifications/user/${user.id}/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.ok) {
        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            readStatus: true,
          }))
        );

        setUnreadCount(0);
      }
    } catch (error) {
      console.error(
        "Cannot mark all notifications as read:",
        error
      );
    }
  };

  // =========================================================
  // CLICK NOTIFICATION
  // =========================================================

  const handleNotificationClick = async (notification) => {
    // Mark unread notification as read.
    if (!notification.readStatus) {
      await markAsRead(notification.id);
    }

    // If this notification belongs to an order,
    // tell App.jsx.jsx which order should be opened.
    if (notification.orderId != null && onOrderClick) {
      onOrderClick(Number(notification.orderId));
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.id]);

  if (!user) return null;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        zIndex: 1000,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        title="Notifications"
        style={{
          position: "relative",
          border: "none",
          background: "white",
          borderRadius: "12px",
          width: "46px",
          height: "42px",
          cursor: "pointer",
          fontSize: "21px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
      >
        🔔

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              minWidth: "20px",
              height: "20px",
              padding: "0 5px",
              borderRadius: "20px",
              background: "#ef4444",
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid white",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "50px",
            width: "360px",
            maxWidth: "calc(100vw - 30px)",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "15px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #eef0f3",
            }}
          >
            <div>
              <strong style={{ fontSize: "17px" }}>
                🔔 Notifications
              </strong>

              {unreadCount > 0 && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "3px",
                  }}
                >
                  {unreadCount} unread
                </div>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div
            style={{
              maxHeight: "390px",
              overflowY: "auto",
            }}
          >
            {loading && notifications.length === 0 ? (
              <div
                style={{
                  padding: "30px 15px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: "35px 15px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: "32px" }}>🔕</div>

                <div style={{ marginTop: "8px" }}>
                  No notifications yet
                </div>
              </div>
            ) : (
              notifications.map((notification) => {
                const isOrderNotification =
                  notification.orderId != null;

                return (
                  <div
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid #f0f2f5",
                      background: notification.readStatus
                        ? "white"
                        : "#eff6ff",
                      cursor: isOrderNotification
                        ? "pointer"
                        : "default",
                      transition: "background 0.15s ease",
                    }}
                    title={
                      isOrderNotification
                        ? `Open Order #${notification.orderId}`
                        : ""
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "14px",
                          color: "#111827",
                        }}
                      >
                        {notification.title}
                      </strong>

                      {!notification.readStatus && (
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#2563eb",
                            flexShrink: 0,
                            marginTop: "5px",
                          }}
                        />
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "13px",
                        lineHeight: "1.45",
                        color: "#4b5563",
                      }}
                    >
                      {notification.message}
                    </div>

                    {notification.orderId != null && (
                      <div
                        style={{
                          marginTop: "7px",
                          fontSize: "11px",
                          color: "#2563eb",
                          fontWeight: "600",
                        }}
                      >
                        📦 Order #{notification.orderId} • Click to view
                      </div>
                    )}

                    {notification.createdAt && (
                      <div
                        style={{
                          marginTop: "7px",
                          fontSize: "11px",
                          color: "#9ca3af",
                        }}
                      >
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div
            style={{
              padding: "8px 12px",
              textAlign: "center",
              borderTop: "1px solid #eef0f3",
            }}
          >
            <button
              type="button"
              onClick={loadNotifications}
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
