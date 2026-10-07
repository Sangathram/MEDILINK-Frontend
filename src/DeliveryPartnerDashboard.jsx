import { useEffect, useRef, useState } from "react";

const API = "http://localhost:8080";

function DeliveryPartnerDashboard({ user, partnerId = 1 }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("Not Started");
  const [gpsPosition, setGpsPosition] = useState(null);
  const [gpsError, setGpsError] = useState("");
  const [lastGpsUpdate, setLastGpsUpdate] = useState(null);

  const watchIdRef = useRef(null);
  const gpsOrderIdRef = useRef(null);

  const token = localStorage.getItem("token");

  // =========================================================
  // READ API RESPONSE
  // =========================================================

  const readResponse = async (response) => {
    const text = await response.text();

    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  // =========================================================
  // LOAD ASSIGNED ORDERS
  // =========================================================

  const loadAssignedOrders = async () => {
    if (!partnerId) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/api/delivery-partner/orders/${partnerId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await readResponse(response);

      if (response.ok) {
        setOrders(Array.isArray(data) ? data : []);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load assigned orders"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to MEDILINK backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedOrders();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
    };
  }, [partnerId]);

  // =========================================================
  // GPS
  // =========================================================

  const stopLiveLocation = () => {
    if (
      watchIdRef.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = null;
    gpsOrderIdRef.current = null;
    setGpsActive(false);
    setGpsStatus("Stopped");
    setGpsError("");
  };

  const sendLocationToBackend = async (
    orderId,
    position
  ) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;

    setGpsPosition({
      latitude,
      longitude,
      accuracy,
    });

    try {
      const response = await fetch(
        `${API}/api/delivery/location/${orderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            latitude,
            longitude,
            accuracy,
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || "GPS upload failed"
        );
      }

      setGpsStatus("Live GPS Active");
      setLastGpsUpdate(new Date());
      setGpsError("");
    } catch (error) {
      console.error(error);
      setGpsStatus("GPS Active - Upload Error");
      setGpsError(error.message || "Unable to upload location");
    }
  };

  const startLiveLocation = (order) => {
    if (!navigator.geolocation) {
      setGpsError(
        "Geolocation is not supported by this browser."
      );
      setGpsStatus("GPS Not Supported");
      return;
    }

    if (order.status === "DELIVERED") {
      alert(
        "This order is already delivered. GPS tracking is not needed."
      );
      return;
    }

    // Stop an existing GPS session first.
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );
    }

    gpsOrderIdRef.current = order.id;
    setTrackingOrderId(order.id);
    setGpsActive(true);
    setGpsStatus("Requesting GPS permission...");
    setGpsError("");
    setGpsPosition(null);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        sendLocationToBackend(order.id, position);
      },
      (error) => {
        console.error(error);

        let message = "Unable to get your location.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        } else if (error.code === 2) {
          message =
            "Your device could not determine the current location.";
        } else if (error.code === 3) {
          message =
            "GPS request timed out. Please try again.";
        }

        setGpsActive(false);
        setGpsStatus("GPS Error");
        setGpsError(message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    watchIdRef.current = watchId;
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getNextStatus = (status) => {
    if (status === "PLACED") return "PROCESSING";
    if (status === "PROCESSING") return "DISPATCHED";
    if (status === "DISPATCHED") return "DELIVERED";
    return null;
  };

  const getStatusLabel = (order) => {
    if (order?.deliveryStatus === "OUT_FOR_DELIVERY") {
      return "Out for Delivery";
    }

    if (order?.deliveryStatus === "DELIVERED") {
      return "Delivered";
    }

    if (order?.deliveryStatus === "PROCESSING") {
      return "Processing";
    }

    if (order?.status === "DELIVERED") return "Delivered";
    if (order?.status === "DISPATCHED") return "Out for Delivery";
    if (order?.status === "PROCESSING") return "Processing";

    return "Order Placed";
  };

  const getStatusStyle = (order) => {
    if (order?.status === "DELIVERED") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (order?.status === "DISPATCHED") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (order?.status === "PROCESSING") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      background: "#f1f5f9",
      color: "#475569",
    };
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const updateOrderStatus = async (order) => {
    const nextStatus = getNextStatus(order.status);

    if (!nextStatus) {
      alert("This order cannot be changed.");
      return;
    }

    const actionText = {
      PROCESSING: "start processing",
      DISPATCHED: "dispatch",
      DELIVERED: "mark as delivered",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText[nextStatus]} Order #${order.id}?`
    );

    if (!confirmed) return;

    setUpdatingOrderId(order.id);

    try {
      const response = await fetch(
        `${API}/api/orders/${order.id}/status?status=${nextStatus}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await readResponse(response);

      if (response.ok) {
        setOrders((currentOrders) =>
          currentOrders.map((item) =>
            item.id === order.id ? data : item
          )
        );

        if (nextStatus === "DELIVERED") {
          if (gpsOrderIdRef.current === order.id) {
            stopLiveLocation();
          }
        }

        alert(
          `Order #${order.id} updated to ${nextStatus}.`
        );

        await loadAssignedOrders();
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Status update failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // =========================================================
  // ACTION BUTTON
  // =========================================================

  const renderActionButton = (order) => {
    if (order.status === "DELIVERED") {
      return (
        <div
          style={{
            padding: "11px 14px",
            borderRadius: "10px",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          🎉 Order Completed
        </div>
      );
    }

    let label = "";
    let icon = "";

    if (order.status === "PLACED") {
      label = "Process Order";
      icon = "⚙️";
    } else if (order.status === "PROCESSING") {
      label = "Dispatch Order";
      icon = "🚚";
    } else if (order.status === "DISPATCHED") {
      label = "Mark Delivered";
      icon = "✅";
    } else {
      return null;
    }

    const updating = updatingOrderId === order.id;

    return (
      <button
        type="button"
        onClick={() => updateOrderStatus(order)}
        disabled={updating}
        style={{
          width: "100%",
          border: "none",
          borderRadius: "10px",
          padding: "12px 16px",
          background: updating ? "#94a3b8" : "#2563eb",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 700,
          cursor: updating ? "not-allowed" : "pointer",
        }}
      >
        {updating ? "⏳ Updating..." : `${icon} ${label}`}
      </button>
    );
  };

  const activeOrders = orders.filter(
    (order) => order.status !== "DELIVERED"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  const gpsOrder = orders.find(
    (order) => order.id === trackingOrderId
  );

  return (
    <section style={{ marginTop: "24px" }}>
      {/* HEADER */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "18px",
          padding: "22px",
          marginBottom: "18px",
          boxShadow: "0 5px 18px rgba(15, 23, 42, 0.07)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>
              🚚 Delivery Partner Dashboard
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
              }}
            >
              Manage your assigned MEDILINK orders.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAssignedOrders}
            disabled={loading}
            style={{
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳ Loading..." : "🔄 Refresh Orders"}
          </button>
        </div>

        {/* QUICK STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginTop: "18px",
          }}
        >
          <Stat
            label="Assigned Orders"
            value={orders.length}
            background="#eff6ff"
            border="#bfdbfe"
            text="#1d4ed8"
          />

          <Stat
            label="Active Deliveries"
            value={activeOrders}
            background="#fff7ed"
            border="#fed7aa"
            text="#c2410c"
          />

          <Stat
            label="Delivered"
            value={deliveredOrders}
            background="#f0fdf4"
            border="#bbf7d0"
            text="#166534"
          />
        </div>
      </div>

      {/* LIVE GPS PANEL */}
      {gpsOrder && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "18px",
            padding: "20px",
            marginBottom: "18px",
            border: "1px solid #bfdbfe",
            boxShadow: "0 5px 18px rgba(15, 23, 42, 0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                📍 Live GPS Tracking — Order #{gpsOrder.id}
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: gpsActive ? "#15803d" : "#64748b",
                  fontWeight: 700,
                }}
              >
                {gpsActive ? "🟢 " : "⚪ "}
                {gpsStatus}
              </p>
            </div>

            {gpsActive && (
              <button
                type="button"
                onClick={stopLiveLocation}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  background: "#dc2626",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ⏹ Stop Live Location
              </button>
            )}
          </div>

          {gpsPosition ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <GpsValue
                label="Latitude"
                value={gpsPosition.latitude.toFixed(6)}
              />

              <GpsValue
                label="Longitude"
                value={gpsPosition.longitude.toFixed(6)}
              />

              <GpsValue
                label="Accuracy"
                value={`${Math.round(
                  gpsPosition.accuracy
                )} meters`}
              />

              <GpsValue
                label="Last Update"
                value={
                  lastGpsUpdate
                    ? lastGpsUpdate.toLocaleTimeString()
                    : "-"
                }
              />
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>
              Waiting for the device to provide a GPS position...
            </p>
          )}

          {gpsError && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "13px",
              }}
            >
              ⚠️ {gpsError}
            </div>
          )}
        </div>
      )}

      {/* ORDERS */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          Loading assigned orders...
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "45px 20px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={{ fontSize: "44px" }}>📦</div>
          <h3>No assigned orders</h3>
          <p style={{ color: "#64748b" }}>
            Orders assigned to you will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "18px",
          }}
        >
          {orders.map((order) => {
            const statusStyle = getStatusStyle(order);
            const isGpsOrder = trackingOrderId === order.id;
            const canTrack =
              order.status !== "DELIVERED";

            return (
              <div
                key={order.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "18px",
                  boxShadow:
                    "0 5px 18px rgba(15, 23, 42, 0.07)",
                }}
              >
                {/* ORDER HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "15px",
                  }}
                >
                  <strong style={{ fontSize: "17px" }}>
                    ORDER #{order.id}
                  </strong>

                  <span
                    style={{
                      ...statusStyle,
                      padding: "7px 11px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 800,
                    }}
                  >
                    {getStatusLabel(order).toUpperCase()}
                  </span>
                </div>

                {/* DETAILS */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "13px",
                    padding: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <Detail
                    label="Tracking ID"
                    value={order.trackingId || "Not available"}
                  />

                  <Detail
                    label="Product Type"
                    value={order.productType || "MEDICINE"}
                  />

                  <Detail
                    label="Medicine ID"
                    value={
                      order.medicineId != null
                        ? order.medicineId
                        : "-"
                    }
                  />

                  <Detail
                    label="Healthcare Product ID"
                    value={
                      order.healthcareProductId != null
                        ? order.healthcareProductId
                        : "-"
                    }
                  />

                  <Detail
                    label="Quantity"
                    value={order.quantity ?? "-"}
                  />

                  <Detail
                    label="Total"
                    value={`₹${Number(
                      order.totalPrice || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <Detail
                    label="Customer ID"
                    value={order.userId ?? "-"}
                  />

                  <Detail
                    label="Delivery Status"
                    value={
                      order.deliveryStatus ||
                      getStatusLabel(order)
                    }
                  />

                  <Detail
                    label="Estimated Delivery"
                    value={
                      order.estimatedDelivery ||
                      "To be updated"
                    }
                    last
                  />
                </div>

                {/* PARTNER */}
                <div
                  style={{
                    marginBottom: "15px",
                    padding: "13px",
                    borderRadius: "12px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginBottom: "5px",
                    }}
                  >
                    🚚 Delivery Partner
                  </div>

                  <strong>
                    {order.deliveryPartner ||
                      user?.name ||
                      "MEDILINK Delivery Partner"}
                  </strong>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "13px",
                      color: "#475569",
                    }}
                  >
                    📞 {order.deliveryPhone || "Phone not available"}
                  </div>
                </div>

                {/* GPS BUTTON */}
                {canTrack && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isGpsOrder && gpsActive) {
                        stopLiveLocation();
                      } else {
                        startLiveLocation(order);
                      }
                    }}
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      marginBottom: "10px",
                      background:
                        isGpsOrder && gpsActive
                          ? "#dc2626"
                          : "#0f766e",
                      color: "#ffffff",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {isGpsOrder && gpsActive
                      ? "⏹ Stop Live GPS"
                      : "📍 Start Live GPS"}
                  </button>
                )}

                {/* STATUS */}
                {renderActionButton(order)}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function Detail({ label, value, last = false }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
        padding: "8px 0",
        borderBottom: last ? "none" : "1px solid #e2e8f0",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: "12px",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          fontSize: "12px",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function Stat({
  label,
  value,
  background,
  border,
  text,
}) {
  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "12px",
        background,
        border: `1px solid ${border}`,
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#64748b",
        }}
      >
        {label}
      </div>

      <strong
        style={{
          fontSize: "24px",
          color: text,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function GpsValue({ label, value }) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "10px",
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "#64748b",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>

      <strong style={{ fontSize: "13px" }}>
        {value}
      </strong>
    </div>
  );
}

export default DeliveryPartnerDashboard;
