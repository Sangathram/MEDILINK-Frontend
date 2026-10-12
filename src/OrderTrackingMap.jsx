import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// =========================================================
// MEDILINK LIVE DELIVERY TRACKING
// =========================================================

const DEFAULT_PATIENT_LOCATION = [17.3850, 78.4867];

// Demo MEDILINK pharmacy location.
// This can later come from the pharmacy database.
const PHARMACY_LOCATION = [17.4065, 78.4772];
const API = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
).replace(/\/+$/, "");

// =========================================================
// DISTANCE HELPERS
// =========================================================

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

function formatDistance(distanceKm) {
  if (distanceKm == null || Number.isNaN(distanceKm)) {
    return "Calculating...";
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

// =========================================================
// FORMAT TIME
// =========================================================

function formatDuration(totalSeconds) {
  if (totalSeconds == null || totalSeconds < 0) {
    return "0 min";
  }

  const seconds = Math.floor(totalSeconds);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }

  return `${minutes} min`;
}

// =========================================================
// FORMAT ETA
// =========================================================

function formatEta(minutes) {
  if (minutes == null || !Number.isFinite(minutes)) {
    return "Calculating...";
  }

  const rounded = Math.max(1, Math.ceil(minutes));

  if (rounded < 60) {
    return `${rounded} min`;
  }

  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  return mins > 0
    ? `${hours} hr ${mins} min`
    : `${hours} hr`;
}

// =========================================================
// COMPONENT
// =========================================================

function OrderTrackingMap({ order }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const vehicleMarkerRef = useRef(null);
  const patientMarkerRef = useRef(null);
  const pharmacyMarkerRef = useRef(null);

  const roadRouteRef = useRef(null);

  const pollingRef = useRef(null);
  const routeTimerRef = useRef(null);
  const durationTimerRef = useRef(null);

  // Previous GPS point is used to calculate movement speed.
  const previousGpsRef = useRef(null);

  // When the delivery starts, we remember the first local time.
  const localDeliveryStartRef = useRef(null);

  // =========================================================
  // PATIENT LOCATION
  // =========================================================

  const [patientLocation, setPatientLocation] = useState(
    DEFAULT_PATIENT_LOCATION
  );

  // =========================================================
  // DELIVERY GPS
  // =========================================================

  const [deliveryLocation, setDeliveryLocation] = useState(null);

  const [locationMessage, setLocationMessage] = useState(
    "Waiting for live delivery location..."
  );

  const [lastUpdated, setLastUpdated] = useState(null);

  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  // =========================================================
  // DISTANCE
  // =========================================================

  const [directDistanceKm, setDirectDistanceKm] = useState(null);

  const [routeDistanceKm, setRouteDistanceKm] = useState(null);

  // =========================================================
  // ETA
  // =========================================================

  const [routeEtaMinutes, setRouteEtaMinutes] = useState(null);

  const [liveEtaMinutes, setLiveEtaMinutes] = useState(null);

  // =========================================================
  // MOVEMENT
  // =========================================================

  const [speedKmh, setSpeedKmh] = useState(null);

  const [movementStatus, setMovementStatus] = useState(
    "WAITING"
  );

  // =========================================================
  // DELIVERY DURATION
  // =========================================================

  const [deliveryDurationSeconds, setDeliveryDurationSeconds] =
    useState(0);

  // =========================================================
  // ROUTE LOADING
  // =========================================================

  const [routeLoading, setRouteLoading] = useState(false);

  // =========================================================
  // TOKEN
  // =========================================================

  const token = localStorage.getItem("token");

  // =========================================================
  // STATUS
  // =========================================================

  const isDelivered =
    order?.status === "DELIVERED";

  const isOutForDelivery =
    order?.status === "DISPATCHED" ||
    order?.deliveryStatus === "OUT_FOR_DELIVERY";

  // =========================================================
  // GET PATIENT LOCATION
  // =========================================================

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Location unavailable. Showing Hyderabad demo destination."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPatientLocation([
          position.coords.latitude,
          position.coords.longitude,
        ]);

        setLocationMessage(
          "Using your current location as delivery destination."
        );
      },
      () => {
        setLocationMessage(
          "Location permission unavailable. Showing Hyderabad demo destination."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  }, []);

  // =========================================================
  // GET REAL DELIVERY PARTNER GPS
  // =========================================================

  const fetchDeliveryLocation = async () => {
    if (!order?.id || !token || isDelivered) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/delivery/location/${order.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (response.status === 204) {
        setDeliveryLocation(null);
        setLastUpdated(null);
        setGpsAccuracy(null);
        setMovementStatus("WAITING");
        setSpeedKmh(null);

        setLocationMessage(
          "🛰️ Waiting for the delivery partner to share live GPS..."
        );

        return;
      }

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          text || "Unable to get delivery location"
        );
      }

      const data = JSON.parse(text);

      if (
        data.latitude == null ||
        data.longitude == null
      ) {
        return;
      }

      const newLatitude = Number(data.latitude);
      const newLongitude = Number(data.longitude);

      const newLocation = [
        newLatitude,
        newLongitude,
      ];

      // =====================================================
      // CALCULATE LIVE MOVEMENT
      // =====================================================

      const gpsTime = data.updatedAt
        ? new Date(data.updatedAt).getTime()
        : Date.now();

      const previousGps = previousGpsRef.current;

      if (previousGps) {
        const distanceKm = calculateDistanceKm(
          previousGps.latitude,
          previousGps.longitude,
          newLatitude,
          newLongitude
        );

        const timeHours =
          (gpsTime - previousGps.timestamp) /
          (1000 * 60 * 60);

        if (timeHours > 0) {
          const calculatedSpeed =
            distanceKm / timeHours;

          // Ignore unrealistic GPS jumps.
          if (
            Number.isFinite(calculatedSpeed) &&
            calculatedSpeed <= 120
          ) {
            setSpeedKmh(calculatedSpeed);

            if (calculatedSpeed >= 3) {
              setMovementStatus("MOVING");
            } else {
              setMovementStatus("STOPPED");
            }
          }
        }
      }

      previousGpsRef.current = {
        latitude: newLatitude,
        longitude: newLongitude,
        timestamp: gpsTime,
      };

      setDeliveryLocation(newLocation);

      setGpsAccuracy(
        data.accuracy != null
          ? Number(data.accuracy)
          : null
      );

      setLastUpdated(
        data.updatedAt
          ? new Date(data.updatedAt)
          : new Date()
      );

      setLocationMessage(
        "🟢 Live delivery partner location"
      );
    } catch (error) {
      console.error(
        "Delivery GPS error:",
        error
      );

      setLocationMessage(
        "Unable to load live delivery location."
      );
    }
  };

  // =========================================================
  // START REAL GPS POLLING
  // =========================================================

  useEffect(() => {
    if (!order?.id || isDelivered) {
      return;
    }

    fetchDeliveryLocation();

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // =======================================================
    // REAL GPS REFRESH EVERY 5 SECONDS
    // =======================================================

    pollingRef.current = setInterval(() => {
      fetchDeliveryLocation();
    }, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [
    order?.id,
    isDelivered,
    token,
  ]);

  // =========================================================
  // CALCULATE DIRECT DISTANCE
  // =========================================================

  useEffect(() => {
    if (!deliveryLocation || !patientLocation) {
      setDirectDistanceKm(null);
      return;
    }

    const distance = calculateDistanceKm(
      deliveryLocation[0],
      deliveryLocation[1],
      patientLocation[0],
      patientLocation[1]
    );

    setDirectDistanceKm(distance);
  }, [
    deliveryLocation,
    patientLocation,
  ]);

  // =========================================================
  // ROAD ROUTE USING OSRM
  //
  // IMPORTANT:
  // We don't call OSRM every 5 seconds.
  // GPS updates every 5 seconds,
  // road route updates every 30 seconds.
  // =========================================================

  const fetchRoadRoute = async () => {
    if (
      !deliveryLocation ||
      !patientLocation ||
      isDelivered
    ) {
      return;
    }

    setRouteLoading(true);

    try {
      const start =
        `${deliveryLocation[1]},${deliveryLocation[0]}`;

      const end =
        `${patientLocation[1]},${patientLocation[0]}`;

      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error(
          "Road routing service unavailable"
        );
      }

      const data = await response.json();

      if (
        !data.routes ||
        !data.routes.length
      ) {
        throw new Error(
          "No road route found"
        );
      }

      const route = data.routes[0];

      // Road distance
      setRouteDistanceKm(
        route.distance / 1000
      );

      // Road ETA
      setRouteEtaMinutes(
        Math.max(
          1,
          Math.ceil(route.duration / 60)
        )
      );

      // =====================================================
      // DRAW ROAD ROUTE
      // =====================================================

      if (mapInstanceRef.current) {
        if (roadRouteRef.current) {
          roadRouteRef.current.remove();
        }

        const coordinates =
          route.geometry.coordinates.map(
            ([longitude, latitude]) => [
              latitude,
              longitude,
            ]
          );

        roadRouteRef.current =
          L.polyline(
            coordinates,
            {
              weight: 6,
              opacity: 0.85,
            }
          ).addTo(
            mapInstanceRef.current
          );
      }
    } catch (error) {
      console.error(
        "Road route error:",
        error
      );

      setRouteDistanceKm(null);
      setRouteEtaMinutes(null);
    } finally {
      setRouteLoading(false);
    }
  };

  // =========================================================
  // FIRST ROUTE LOAD
  // =========================================================

  useEffect(() => {
    if (
      !deliveryLocation ||
      !patientLocation ||
      isDelivered
    ) {
      return;
    }

    fetchRoadRoute();
  }, [
    patientLocation,
    isDelivered,
  ]);

  // =========================================================
  // REFRESH ROAD ROUTE EVERY 30 SECONDS
  //
  // GPS itself still refreshes every 5 seconds.
  // =========================================================

  useEffect(() => {
    if (
      !deliveryLocation ||
      !patientLocation ||
      isDelivered
    ) {
      return;
    }

    if (routeTimerRef.current) {
      clearInterval(routeTimerRef.current);
    }

    routeTimerRef.current =
      setInterval(() => {
        fetchRoadRoute();
      }, 30000);

    return () => {
      if (routeTimerRef.current) {
        clearInterval(
          routeTimerRef.current
        );

        routeTimerRef.current = null;
      }
    };
  }, [
    deliveryLocation,
    patientLocation,
    isDelivered,
  ]);

  // =========================================================
  // DELIVERY DURATION
  // =========================================================

  useEffect(() => {
    if (!isOutForDelivery || isDelivered) {
      setDeliveryDurationSeconds(0);

      return;
    }

    // =======================================================
    // TRY TO USE BACKEND DISPATCH TIME
    // =======================================================

    let startTime = null;

    if (order?.dispatchedAt) {
      const parsed =
        new Date(
          order.dispatchedAt
        ).getTime();

      if (
        Number.isFinite(parsed)
      ) {
        startTime = parsed;
      }
    }

    // =======================================================
    // FALLBACK:
    // Start timer when live GPS first appears.
    // =======================================================

    if (!startTime) {
      if (
        !localDeliveryStartRef.current
      ) {
        localDeliveryStartRef.current =
          Date.now();
      }

      startTime =
        localDeliveryStartRef.current;
    }

    const updateDuration = () => {
      const elapsed =
        Math.max(
          0,
          Math.floor(
            (Date.now() - startTime) /
              1000
          )
        );

      setDeliveryDurationSeconds(
        elapsed
      );
    };

    updateDuration();

    if (durationTimerRef.current) {
      clearInterval(
        durationTimerRef.current
      );
    }

    durationTimerRef.current =
      setInterval(
        updateDuration,
        1000
      );

    return () => {
      if (
        durationTimerRef.current
      ) {
        clearInterval(
          durationTimerRef.current
        );

        durationTimerRef.current =
          null;
      }
    };
  }, [
    isOutForDelivery,
    isDelivered,
    order?.dispatchedAt,
  ]);

  // =========================================================
  // LIVE ETA
  //
  // If the delivery partner is moving,
  // use recent GPS speed.
  //
  // Otherwise use road-routing ETA.
  // =========================================================

  useEffect(() => {
    if (
      !deliveryLocation ||
      !routeDistanceKm
    ) {
      setLiveEtaMinutes(
        routeEtaMinutes
      );

      return;
    }

    if (
      speedKmh != null &&
      speedKmh >= 3 &&
      speedKmh <= 120
    ) {
      const eta =
        (routeDistanceKm /
          speedKmh) *
        60;

      setLiveEtaMinutes(
        Math.max(1, eta)
      );
    } else {
      setLiveEtaMinutes(
        routeEtaMinutes
      );
    }
  }, [
    deliveryLocation,
    routeDistanceKm,
    routeEtaMinutes,
    speedKmh,
  ]);

  // =========================================================
  // MAP INITIALIZATION
  // =========================================================

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    // Don't create the map repeatedly.
    if (mapInstanceRef.current) {
      return;
    }

    const map = L.map(
      mapRef.current,
      {
        zoomControl: true,
      }
    );

    mapInstanceRef.current = map;

    // =======================================================
    // OPENSTREETMAP
    // =======================================================

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    // =======================================================
    // PHARMACY MARKER
    // =======================================================

    pharmacyMarkerRef.current =
      L.circleMarker(
        PHARMACY_LOCATION,
        {
          radius: 10,
          weight: 3,
          fillOpacity: 0.9,
        }
      ).addTo(map);

    pharmacyMarkerRef.current.bindPopup(
      "<strong>🏪 MEDILINK Pharmacy</strong><br/>Order preparation location"
    );

    // =======================================================
    // PATIENT MARKER
    // =======================================================

    patientMarkerRef.current =
      L.circleMarker(
        patientLocation,
        {
          radius: 10,
          weight: 3,
          fillOpacity: 0.9,
        }
      ).addTo(map);

    patientMarkerRef.current.bindPopup(
      "<strong>📍 Delivery Destination</strong><br/>Patient location"
    );

    // =======================================================
    // INITIAL VIEW
    // =======================================================

    const points = [
      PHARMACY_LOCATION,
      patientLocation,
    ];

    if (deliveryLocation) {
      points.push(
        deliveryLocation
      );
    }

    const bounds =
      L.latLngBounds(points);

    map.fitBounds(
      bounds,
      {
        padding: [40, 40],
      }
    );

   setTimeout(() => {
  if (mapInstanceRef.current === map) {
    map.invalidateSize();
  }
}, 300);
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      vehicleMarkerRef.current =
        null;

      patientMarkerRef.current =
        null;

      pharmacyMarkerRef.current =
        null;

      roadRouteRef.current =
        null;
    };
  }, []);

  // =========================================================
  // UPDATE PATIENT MARKER
  // =========================================================

  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !patientLocation
    ) {
      return;
    }

    if (
      patientMarkerRef.current
    ) {
      patientMarkerRef.current.setLatLng(
        patientLocation
      );
    }
  }, [patientLocation]);

  // =========================================================
  // UPDATE LIVE DELIVERY MARKER
  // =========================================================

  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !deliveryLocation
    ) {
      return;
    }

    if (
      !vehicleMarkerRef.current
    ) {
      vehicleMarkerRef.current =
        L.circleMarker(
          deliveryLocation,
          {
            radius: 12,
            weight: 3,
            fillOpacity: 1,
          }
        ).addTo(
          mapInstanceRef.current
        );

      vehicleMarkerRef.current.bindPopup(
        `<strong>🚚 ${
          order?.deliveryPartner ||
          "MEDILINK Delivery Partner"
        }</strong><br/>Live GPS location${
          order?.deliveryPhone
            ? `<br/>📞 ${order.deliveryPhone}`
            : ""
        }`
      );
    } else {
      // Move the existing marker
      // instead of recreating it.
      vehicleMarkerRef.current.setLatLng(
        deliveryLocation
      );
    }
  }, [
    deliveryLocation,
    order?.deliveryPartner,
    order?.deliveryPhone,
  ]);

  // =========================================================
  // UPDATE MAP ROUTE AFTER GPS MOVES
  // =========================================================

  

  // =========================================================
  // RECENTER MAP
  // =========================================================

  const recenterMap = () => {
    if (!mapInstanceRef.current) {
      return;
    }

    const target =
      deliveryLocation ||
      patientLocation;

    mapInstanceRef.current.setView(
      target,
      15,
      {
        animate: true,
        duration: 0.8,
      }
    );
  };

  // =========================================================
  // SHOW ENTIRE DELIVERY ROUTE
  // =========================================================

  const showFullRoute = () => {
    if (
      !mapInstanceRef.current
    ) {
      return;
    }

    const points = [
      patientLocation,
    ];

    if (deliveryLocation) {
      points.push(
        deliveryLocation
      );
    }

    const bounds =
      L.latLngBounds(points);

    mapInstanceRef.current.fitBounds(
      bounds,
      {
        padding: [50, 50],
        maxZoom: 15,
      }
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      style={{
        marginTop: "20px",
        borderRadius: "18px",
        overflow: "hidden",
        border: "1px solid #dbeafe",
        background: "#ffffff",
        boxShadow:
          "0 8px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          padding: "16px",
          background: "#f8fafc",
          borderBottom:
            "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              🗺️ Live Delivery Tracking
            </h3>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#64748b",
                fontSize: "13px",
              }}
            >
              {locationMessage}
            </p>
          </div>

          {/* STATUS */}

          <div
            style={{
              padding:
                "7px 12px",
              borderRadius:
                "999px",
              fontWeight: 800,
              fontSize: "12px",
              background:
                isDelivered
                  ? "#dcfce7"
                  : isOutForDelivery
                  ? "#dbeafe"
                  : "#f1f5f9",
              color:
                isDelivered
                  ? "#166534"
                  : isOutForDelivery
                  ? "#1d4ed8"
                  : "#475569",
            }}
          >
            {isDelivered
              ? "✓ DELIVERED"
              : isOutForDelivery
              ? "🚚 OUT FOR DELIVERY"
              : order?.status ||
                "ORDER_PLACED"}
          </div>
        </div>

        {/* =================================================
            LIVE GPS BAR
        ================================================= */}

        {isOutForDelivery && (
          <div
            style={{
              marginTop: "14px",
              padding: "12px",
              borderRadius:
                "12px",
              background:
                deliveryLocation
                  ? "#f0fdf4"
                  : "#f8fafc",
              border:
                deliveryLocation
                  ? "1px solid #bbf7d0"
                  : "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <strong
                  style={{
                    color:
                      deliveryLocation
                        ? "#166534"
                        : "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {deliveryLocation
                    ? "🟢 LIVE GPS ACTIVE"
                    : "🛰️ WAITING FOR GPS"}
                </strong>
              </div>

              {deliveryLocation && (
                <div
                  style={{
                    fontSize: "12px",
                    color: "#475569",
                  }}
                >
                  Updates every 5 seconds
                </div>
              )}
            </div>

            {deliveryLocation && (
              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  fontSize: "12px",
                  color: "#475569",
                }}
              >
                <span>
                  Accuracy:{" "}
                  <strong>
                    {gpsAccuracy != null
                      ? `${Math.round(
                          gpsAccuracy
                        )} m`
                      : "Unknown"}
                  </strong>
                </span>

                <span>
                  Last update:{" "}
                  <strong>
                    {lastUpdated
                      ? lastUpdated.toLocaleTimeString()
                      : "Just now"}
                  </strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            LIVE DELIVERY CARDS
        ================================================= */}

        {isOutForDelivery &&
          deliveryLocation && (
            <div
              style={{
                marginTop:
                  "12px",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(145px, 1fr))",
                gap: "10px",
              }}
            >
              {/* MOVEMENT */}

              <div
                style={{
                  padding: "13px",
                  borderRadius:
                    "12px",
                  background:
                    movementStatus ===
                    "MOVING"
                      ? "#eff6ff"
                      : movementStatus ===
                        "STOPPED"
                      ? "#fff7ed"
                      : "#f8fafc",
                  border:
                    movementStatus ===
                    "MOVING"
                      ? "1px solid #bfdbfe"
                      : movementStatus ===
                        "STOPPED"
                      ? "1px solid #fed7aa"
                      : "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: 700,
                    marginBottom:
                      "5px",
                  }}
                >
                  DELIVERY STATUS
                </div>

                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    color:
                      movementStatus ===
                      "MOVING"
                        ? "#1d4ed8"
                        : movementStatus ===
                          "STOPPED"
                        ? "#c2410c"
                        : "#64748b",
                  }}
                >
                  {movementStatus ===
                  "MOVING"
                    ? "🚚 MOVING"
                    : movementStatus ===
                      "STOPPED"
                    ? "⏸️ STOPPED"
                    : "🛰️ WAITING"}
                </div>
              </div>

              {/* SPEED */}

              <div
                style={{
                  padding: "13px",
                  borderRadius:
                    "12px",
                  background: "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: 700,
                    marginBottom:
                      "5px",
                  }}
                >
                  CURRENT SPEED
                </div>

                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {speedKmh != null &&
                  speedKmh >= 0
                    ? `${speedKmh.toFixed(
                        1
                      )} km/h`
                    : "Calculating..."}
                </div>
              </div>

              {/* DELIVERY TIME */}

              <div
                style={{
                  padding: "13px",
                  borderRadius:
                    "12px",
                  background: "#faf5ff",
                  border:
                    "1px solid #e9d5ff",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: 700,
                    marginBottom:
                      "5px",
                  }}
                >
                  DELIVERY TIME
                </div>

                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#7e22ce",
                  }}
                >
                  {formatDuration(
                    deliveryDurationSeconds
                  )}
                </div>
              </div>

              {/* DISTANCE */}

              <div
                style={{
                  padding: "13px",
                  borderRadius:
                    "12px",
                  background: "#eff6ff",
                  border:
                    "1px solid #bfdbfe",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: 700,
                    marginBottom:
                      "5px",
                  }}
                >
                  DISTANCE REMAINING
                </div>

                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#1d4ed8",
                  }}
                >
                  {routeLoading
                    ? "Calculating..."
                    : formatDistance(
                        routeDistanceKm ??
                          directDistanceKm
                      )}
                </div>
              </div>

              {/* ETA */}

              <div
                style={{
                  padding: "13px",
                  borderRadius:
                    "12px",
                  background: "#f0fdf4",
                  border:
                    "1px solid #bbf7d0",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: 700,
                    marginBottom:
                      "5px",
                  }}
                >
                  ESTIMATED ARRIVAL
                </div>

                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    color: "#166534",
                  }}
                >
                  {formatEta(
                    liveEtaMinutes ??
                      routeEtaMinutes
                  )}
                </div>
              </div>
            </div>
          )}

        {/* =================================================
            ROUTE INFORMATION
        ================================================= */}

        {isOutForDelivery &&
          deliveryLocation && (
            <div
              style={{
                marginTop:
                  "10px",
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                fontSize: "11px",
                color: "#64748b",
              }}
            >
              <span>
                🛣️{" "}
                {routeLoading
                  ? "Updating road route..."
                  : routeDistanceKm != null
                  ? "Road route active"
                  : "Using direct GPS distance"}
              </span>

              <span>
                🔄 GPS refresh: 5 sec
              </span>

              <span>
                🛣️ Route refresh: 30 sec
              </span>
            </div>
          )}

        {/* =================================================
            DELIVERED MESSAGE
        ================================================= */}

        {isDelivered && (
          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius:
                "10px",
              background: "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              color: "#166534",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            ✅ Order delivered successfully.
            Live GPS tracking has stopped.
          </div>
        )}
      </div>

      {/* ===================================================
          MAP
      =================================================== */}

      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "420px",
          minHeight: "320px",
        }}
      />

      {/* ===================================================
          MAP CONTROLS
      =================================================== */}

      <div
        style={{
          padding:
            "12px 16px",
          display: "flex",
          justifyContent:
            "flex-end",
          gap: "8px",
          flexWrap: "wrap",
          background:
            "#ffffff",
        }}
      >
        <button
          type="button"
          onClick={recenterMap}
          style={{
            border:
              "1px solid #cbd5e1",
            background:
              "#ffffff",
            borderRadius:
              "10px",
            padding:
              "9px 13px",
            fontWeight: 700,
            cursor:
              "pointer",
            color:
              "#334155",
          }}
        >
          🎯 Re-center
        </button>

        <button
          type="button"
          onClick={showFullRoute}
          style={{
            border:
              "1px solid #cbd5e1",
            background:
              "#ffffff",
            borderRadius:
              "10px",
            padding:
              "9px 13px",
            fontWeight: 700,
            cursor:
              "pointer",
            color:
              "#334155",
          }}
        >
          🗺️ Show Route
        </button>
      </div>

      {/* ===================================================
          LEGEND
      =================================================== */}

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          padding:
            "4px 16px 16px",
          fontSize: "13px",
          color: "#475569",
        }}
      >
        <span>
          🏪 Pharmacy
        </span>

        <span>
          🚚 Live Delivery Partner
        </span>

        <span>
          📍 Your Location
        </span>

        {isOutForDelivery &&
          deliveryLocation && (
            <span>
              🟢 GPS Active
            </span>
          )}
      </div>
    </div>
  );
}

export default OrderTrackingMap;