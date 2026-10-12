import { useEffect, useState } from "react";
import PatientProfile from "./PatientProfile";
import AiHealthAssistant from "./AiHealthAssistant";
import OrderTrackingMap from "./OrderTrackingMap";
import PatientCareProducts from "./PatientCareProducts";
import "./App.css";
import NotificationBell from "./NotificationBell";
import DeliveryPartnerDashboard from "./DeliveryPartnerDashboard";

const API = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");

// =========================================================
// DELIVERY CHARGE SETTINGS
// =========================================================
const FREE_DELIVERY_LIMIT = 99;
const DELIVERY_CHARGE = 30;

// =========================================================
// MEDICINE IMAGE MAPPING
// Images must be inside public/medicine-images/
// =========================================================

const getMedicineImage = (name = "") => {
  const medicine = name.toLowerCase();

  if (medicine.includes("paracetamol")) return "/medicine-images/paracetamol.jpg";
  if (medicine.includes("amoxicillin")) return "/medicine-images/amoxicillin.jpg";
  if (medicine.includes("ibuprofen")) return "/medicine-images/ibuprofen.jpg";
  if (medicine.includes("cetirizine")) return "/medicine-images/cetirizine.jpg";
  if (medicine.includes("azithromycin")) return "/medicine-images/azithromycin.jpg";
  if (medicine.includes("doxycycline")) return "/medicine-images/doxycycline.jpg";
  if (medicine.includes("cefixime")) return "/medicine-images/cefixime.jpg";
  if (medicine.includes("cefuroxime")) return "/medicine-images/cefuroxime.jpg";
  if (medicine.includes("pantoprazole")) return "/medicine-images/pantoprazole.jpg";
  if (medicine.includes("omeprazole")) return "/medicine-images/omeprazole.jpg";
  if (medicine.includes("rabeprazole")) return "/medicine-images/rabeprazole.jpg";
  if (medicine.includes("esomeprazole")) return "/medicine-images/esomeprazole.jpg";
  if (medicine.includes("metformin")) return "/medicine-images/metformin.jpg";
  if (medicine.includes("glimepiride")) return "/medicine-images/glimepiride.jpg";
  if (medicine.includes("amlodipine")) return "/medicine-images/amlodipine.jpg";
  if (medicine.includes("losartan")) return "/medicine-images/losartan.jpg";
  if (medicine.includes("telmisartan")) return "/medicine-images/telmisartan.jpg";
  if (medicine.includes("atorvastatin")) return "/medicine-images/atorvastatin.jpg";
  if (medicine.includes("rosuvastatin")) return "/medicine-images/rosuvastatin.jpg";
  if (medicine.includes("aspirin")) return "/medicine-images/aspirin.jpg";
  if (medicine.includes("clopidogrel")) return "/medicine-images/clopidogrel.jpg";
  if (medicine.includes("montelukast")) return "/medicine-images/montelukast.jpg";
  if (medicine.includes("fexofenadine")) return "/medicine-images/fexofenadine.jpg";
  if (medicine.includes("levocetirizine")) return "/medicine-images/levocetirizine.jpg";
  if (medicine.includes("fluconazole")) return "/medicine-images/fluconazole.jpg";
  if (medicine.includes("acyclovir")) return "/medicine-images/acyclovir.jpg";
  if (medicine.includes("prednisolone")) return "/medicine-images/prednisolone.jpg";
  if (medicine.includes("hydroxyzine")) return "/medicine-images/hydroxyzine.jpg";
  if (medicine.includes("folic acid")) return "/medicine-images/folic-acid.jpg";
  if (medicine.includes("folic")) return "/medicine-images/folic-acid.jpg";
  if (medicine.includes("calcium")) return "/medicine-images/calcium.jpg";
  if (medicine.includes("vitamin b12")) return "/medicine-images/vitamin-b12.jpg";
  if (medicine.includes("vitamin d3")) return "/medicine-images/vitamin-d3.jpg";
  if (medicine.includes("levothyroxine")) return "/medicine-images/levothyroxine.jpg";
  if (medicine.includes("tamsulosin")) return "/medicine-images/tamsulosin.jpg";
  if (medicine.includes("gabapentin")) return "/medicine-images/gabapentin.jpg";
  if (medicine.includes("pregabalin")) return "/medicine-images/pregabalin.jpg";
  if (medicine.includes("aceclofenac")) return "/medicine-images/aceclofenac.jpg";
  if (medicine.includes("diclofenac")) return "/medicine-images/diclofenac.jpg";
  if (medicine.includes("domperidone")) return "/medicine-images/domperidone.jpg";
  if (medicine.includes("ondansetron")) return "/medicine-images/ondansetron.jpg";

  return "/medicine-images/default.jpg";
};

const getMedicineCategory = (medicine) => {
  const text = (
    (medicine?.name || "") +
    " " +
    (medicine?.description || "")
  ).toLowerCase();

  if (
    text.includes("antibiotic") ||
    text.includes("amoxicillin") ||
    text.includes("azithromycin") ||
    text.includes("doxycycline") ||
    text.includes("cefixime") ||
    text.includes("cefuroxime")
  ) {
    return "Antibiotic";
  }

  if (
    text.includes("vitamin") ||
    text.includes("calcium") ||
    text.includes("folic")
  ) {
    return "Vitamins & Supplements";
  }

  if (
    text.includes("pain") ||
    text.includes("paracetamol") ||
    text.includes("ibuprofen") ||
    text.includes("diclofenac") ||
    text.includes("aceclofenac")
  ) {
    return "Pain Relief";
  }

  if (
    text.includes("gastric") ||
    text.includes("acidity") ||
    text.includes("pantoprazole") ||
    text.includes("omeprazole") ||
    text.includes("rabeprazole") ||
    text.includes("esomeprazole")
  ) {
    return "Gastric Care";
  }

  if (
    text.includes("blood pressure") ||
    text.includes("amlodipine") ||
    text.includes("losartan") ||
    text.includes("telmisartan")
  ) {
    return "Blood Pressure";
  }

  if (
    text.includes("diabetic") ||
    text.includes("metformin") ||
    text.includes("glimepiride")
  ) {
    return "Diabetes Care";
  }

  if (
    text.includes("cholesterol") ||
    text.includes("atorvastatin") ||
    text.includes("rosuvastatin")
  ) {
    return "Cholesterol Care";
  }

  if (
    text.includes("allergy") ||
    text.includes("antihistamine") ||
    text.includes("cetirizine") ||
    text.includes("levocetirizine") ||
    text.includes("fexofenadine") ||
    text.includes("montelukast") ||
    text.includes("hydroxyzine")
  ) {
    return "Allergy Care";
  }

  if (
    text.includes("thyroid") ||
    text.includes("levothyroxine")
  ) {
    return "Thyroid Care";
  }

  return "Tablet";
};

const getStockLabel = (stock) => {
  if (stock === null || stock === undefined) return "Stock unavailable";
  if (Number(stock) === 0) return "Out of Stock";
  if (Number(stock) <= 10) return "Low Stock";
  return "In Stock";
};

const CartSection = ({
  cart,
  cartItemCount,
  clearCart,
  increaseCartQuantity,
  decreaseCartQuantity,
  removeFromCart,
  cartTotal,
  deliveryCharge,
  cartGrandTotal,
  placeCartOrders,
}) => {
    const [showOrderReview, setShowOrderReview] = useState(false);
    return (
      <section className="section cart-section">
        <div className="section-title-row">
          <div>
            <h2>🛒 My Cart ({cartItemCount})</h2>
            <p className="cart-subtitle">
              Review your selected medicines and healthcare products before ordering.
            </p>
          </div>

          {cart.length > 0 && (
            <button
              className="danger-button"
              onClick={clearCart}
            type="button">
              🗑️ Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>
              Add medicines or healthcare products from the list above to start
              your order.
            </p>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={`${item.productType || "MEDICINE"}-${item.id}`}
                >
                  <img
                    src={
                      item.productType === "HEALTHCARE" && item.image
                        ? `/healthcare-image/${item.image}`
                        : getMedicineImage(item.name)
                    }
                    alt={item.name}
                    className="cart-item-image"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/medicine-images/default.jpg";
                    }}
                  />

                  <div className="cart-item-info">
                    <h3>
                      {item.productType === "HEALTHCARE"
                        ? "🩺 "
                        : "💊 "}
                      {item.name}
                    </h3>

                    {item.productType === "HEALTHCARE" ? (
                      <>
                        <p>
                          ₹{Number(item.price || 0).toFixed(2)} /{" "}
                          {item.unitShort || "unit"}
                        </p>

                        {item.weight && (
                          <p className="cart-item-unit-info">
                            ⚖️ {item.weight}
                          </p>
                        )}
                      </>
                    ) : (
                      <p>
                        ₹{Number(item.price || 0).toFixed(2)} ×{" "}
                        {item.quantity}
                      </p>
                    )}
                  </div>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      className="quantity-button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        decreaseCartQuantity(
                          item.id,
                          item.productType || "MEDICINE"
                        );
                      }}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      className="quantity-button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        increaseCartQuantity(
                          item.id,
                          item.productType || "MEDICINE"
                        );
                      }}
                    >
                      +
                    </button>
                  </div>

                  <strong className="cart-item-total">
                    ₹
                    {(
                      Number(item.price || 0) *
                      item.quantity
                    ).toLocaleString("en-IN")}
                  </strong>

                  <button
                    type="button"
                    className="cart-remove-button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFromCart(
                        item.id,
                        item.productType || "MEDICINE"
                      );
                    }}
                    title="Remove from cart"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Total Items</span>
                <strong>{cartItemCount}</strong>
              </div>

              <div>
                <span>Items Subtotal</span>
                <strong>
                  ₹{cartTotal.toLocaleString("en-IN")}
                </strong>
              </div>

              <div>
                <span>Delivery Charge</span>
                <strong>
                  {deliveryCharge === 0 ? (
                    <span className="free-delivery">
                      FREE
                    </span>
                  ) : (
                    "₹" +
                    deliveryCharge.toLocaleString("en-IN")
                  )}
                </strong>
              </div>

              {cartTotal > 0 && cartTotal < FREE_DELIVERY_LIMIT && (
                <div className="delivery-message">
                  Add ₹
                  {(FREE_DELIVERY_LIMIT - cartTotal).toLocaleString(
                    "en-IN"
                  )}{" "}
                  more to get FREE delivery 🎉
                </div>
              )}

              <div className="cart-grand-total">
                <span>Grand Total</span>
                <strong>
                  ₹{cartGrandTotal.toLocaleString("en-IN")}
                </strong>
              </div>

            <button
  className="success-button checkout-button"
  onClick={() => setShowOrderReview(true)}
  type="button"
>
  🛒 Review & Place Order
</button>
     {showOrderReview && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      borderRadius: "14px",
      background: "#f8fafc",
      border: "1px solid #dbeafe",
    }}
  >
    <h3 style={{ marginTop: 0 }}>
      🧾 Review Your Order
    </h3>

    <p>
      Total Items: <strong>{cartItemCount}</strong>
    </p>

    <p>
      Items Subtotal:{" "}
      <strong>
        ₹{cartTotal.toLocaleString("en-IN")}
      </strong>
    </p>

    <p>
      Delivery Charge:{" "}
      <strong>
        {deliveryCharge === 0
          ? "FREE"
          : "₹" + deliveryCharge.toLocaleString("en-IN")}
      </strong>
    </p>

    <p>
      Grand Total:{" "}
      <strong>
        ₹{cartGrandTotal.toLocaleString("en-IN")}
      </strong>
    </p>

    <div
      style={{
        display: "flex",
        gap: "12px",
        marginTop: "18px",
      }}
    >
      <button
        type="button"
        className="danger-button"
        onClick={() => setShowOrderReview(false)}
      >
        ❌ Cancel
      </button>

      <button
        type="button"
        className="success-button"
        onClick={() => {
          setShowOrderReview(false);
          placeCartOrders(true);
        }}
      >
        ✅ Confirm Order
      </button>
    </div>
  </div>
)}
            </div>
          </>
        )}
      </section>
    );
};



// =========================================================
// APP
// =========================================================

function App() {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [registrationAge, setRegistrationAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Restore a session only when both the saved user and auth token exist.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (!savedUser || !savedToken) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      return parsedUser && parsedUser.role ? parsedUser : null;
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const [medicines, setMedicines] = useState([]);
  const [healthcareProducts, setHealthcareProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
const [deliveryPartners, setDeliveryPartners] = useState([]);
const [loadingDeliveryPartners, setLoadingDeliveryPartners] = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);

  const [search, setSearch] = useState("");
  const [activeDashboardSection, setActiveDashboardSection] = useState("overview");

const [initialOrderFilter, setInitialOrderFilter] = useState("ALL");

  const dashboardSections = {


PATIENT: [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "cart", label: "My Cart", icon: "🛒" },
  { id: "orders", label: "Orders", icon: "📦" },
  { id: "products", label: "Browse Medicines", icon: "💊" },
  { id: "prescriptions", label: "Prescriptions", icon: "📋" },
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "ai", label: "AI Assistant", icon: "🤖" },
],



  ADMIN: [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "users", label: "Patients & Users", icon: "👥" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "medicines", label: "Medicines", icon: "💊" },
    { id: "prescriptions", label: "Prescriptions", icon: "📋" },
    { id: "deliveryPartners", label: "Delivery Partners", icon: "🚚" },
  ],

  PHARMACY: [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "inventory", label: "Inventory", icon: "💊" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "prescriptions", label: "Prescriptions", icon: "📋" },
  ],
};

  const [medicinePage, setMedicinePage] = useState(1);
  const medicinesPerPage = 9;

  // Patient cart
  const [cart, setCart] = useState([]);

  // Patient order tracking
  const [trackingOrder, setTrackingOrder] = useState(null);

  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const token = localStorage.getItem("token");
  const resetToken = new URLSearchParams(window.location.search).get("token");

  // =========================================================
  // SAFE RESPONSE READER
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
  // LOGIN / REGISTER
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      const age = Number(registrationAge);

      if (!Number.isInteger(age) || age < 18) {
        alert(
          "MEDILINK registration is available only for users aged 18 years or above."
        );
        return;
      }

      try {
        const response = await fetch(`${API}/api/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await readResponse(response);

        if (response.ok) {
          alert("Registration successful! Please login.");

          setIsRegister(false);
          setName("");
          setRegistrationAge("");
          setEmail("");
          setPassword("");
        } else {
          alert(
            typeof data === "string"
              ? data
              : data?.message || "Registration failed"
          );
        }
      } catch (error) {
        console.error(error);
        alert("Cannot connect to MEDILINK backend.");
      }

      return;
    }

    try {
      const response = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await readResponse(response);

      if (response.ok) {
        // Accept either { token, id, name, role, ... } or
        // { token/accessToken, user: { id, name, role, ... } } responses.
        const sessionUser = data?.user ?? data;
        const sessionToken = data?.token ?? data?.accessToken ?? sessionUser?.token;

        if (!sessionToken || !sessionUser?.role) {
          console.error("Unexpected login response:", data);
          alert("Login response is missing the authentication token or user role. Check the backend login response.");
          return;
        }

        const safeUser = { ...sessionUser };
        delete safeUser.token;
        delete safeUser.accessToken;

        localStorage.setItem("token", sessionToken);
        localStorage.setItem("user", JSON.stringify(safeUser));

        setUser(safeUser);
        setActiveDashboardSection("overview");
        setEmail("");
        setPassword("");

        alert(
          "Login successful!\n\nWelcome " +
            (safeUser.name || safeUser.email || "User") +
            "\nRole: " +
            safeUser.role
        );
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Invalid email or password"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to MEDILINK backend.");
    }
  };

  // =========================================================
  // FORGOT PASSWORD
  // =========================================================

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter your registered email address.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await readResponse(response);

      if (response.ok) {
        alert(
          "Password reset link sent successfully!\n\n" +
            "Please check your email and open the reset link."
        );
        setEmail("");
        setIsForgotPassword(false);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Unable to send password reset email"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to MEDILINK backend.");
    }
  };

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetToken) {
      alert("Invalid password reset link.");
      return;
    }

    if (resetPasswordValue.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    if (resetPasswordValue !== confirmResetPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: resetPasswordValue,
        }),
      });

      const data = await readResponse(response);

      if (response.ok) {
        alert(
          "Password reset successful!\n\n" +
            "You can now login with your new password."
        );

        window.location.href = window.location.origin;
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Password reset failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to MEDILINK backend.");
    }
  };

  // =========================================================
  // LOAD MEDICINES
  // =========================================================

  const loadMedicines = async (searchText = "") => {
    setLoadingMedicines(true);

    try {
      const url = searchText.trim()
        ? `${API}/api/medicines/search?name=${encodeURIComponent(
            searchText
          )}`
        : `${API}/api/medicines`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await readResponse(response);

      if (response.ok) {
        setMedicines(data || []);
        setMedicinePage(1);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load medicines"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot load medicines.");
    } finally {
      setLoadingMedicines(false);
    }
  };

  // =========================================================
  // LOAD HEALTHCARE PRODUCTS
  // =========================================================

  const loadHealthcareProducts = async () => {
    try {
      const response = await fetch(`${API}/api/healthcare-products`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await readResponse(response);

      if (response.ok) {
        setHealthcareProducts(Array.isArray(data) ? data : []);
      } else {
        console.error(
          "Failed to load healthcare products:",
          data
        );
      }
    } catch (error) {
      console.error(
        "Cannot load healthcare products:",
        error
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = () => {
    loadMedicines(search);
  };

  // =========================================================
  // LOAD PATIENT ORDERS
  // =========================================================

  const loadMyOrders = async () => {
    if (!user) return;

    setLoadingOrders(true);

    try {
      const response = await fetch(
        `${API}/api/orders/user/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await readResponse(response);

      if (response.ok) {
        setOrders(data || []);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load orders"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // =========================================================
  // LOAD ALL ORDERS
  // =========================================================

  const loadAllOrders = async () => {
    setLoadingOrders(true);

    try {
      const response = await fetch(`${API}/api/orders`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await readResponse(response);

      if (response.ok) {
        setOrders(data || []);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load orders"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot load orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // LOAD AVAILABLE ORDERS FOR DELIVERY PARTNERS
  const loadAvailableOrders = async () => {
    setLoadingOrders(true);

    try {
      const response = await fetch(`${API}/api/orders/available`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await readResponse(response);

      if (response.ok) {
        setOrders(Array.isArray(data) ? data : []);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load available orders"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot load available orders.");
    } finally {
      setLoadingOrders(false);
    }
  };

  // =========================================================
  // LOAD USERS
  // =========================================================

  const loadUsers = async () => {
    setLoadingUsers(true);

    try {
      const response = await fetch(`${API}/api/users`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await readResponse(response);

      if (response.ok) {
        setUsers(data || []);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load users"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot load users.");
    } finally {
      setLoadingUsers(false);
    }
  };

const loadDeliveryPartners = async () => {
  setLoadingDeliveryPartners(true);

  try {
    const response = await fetch(`${API}/api/delivery-partners`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await readResponse(response);

    if (response.ok) {
      setDeliveryPartners(Array.isArray(data) ? data : []);
    } else {
      console.error("Failed to load delivery partners:", data);
      alert(
        typeof data === "string"
          ? data
          : data?.message || "Failed to load delivery partners"
      );
    }
  } catch (error) {
    console.error(error);
    alert("Cannot load delivery partners.");
  } finally {
    setLoadingDeliveryPartners(false);
  }
};



  // =========================================================
  // PATIENT CART
  // =========================================================

  const addToCart = (product) => {
  const stock = Number(product.stock);

  if (!Number.isFinite(stock) || stock <= 0) {
    alert("This product is out of stock.");
    return;
  }

  // Detect whether this is a medicine or healthcare product
  const isHealthcareProduct =
    product.productType === "HEALTHCARE" ||
    product.healthcareProductId != null ||
    product.category === "BANDAGE" ||
    product.category === "FIRST_AID" ||
    product.category === "FRUITS" ||
    product.category === "ENERGY_DRINK" ||
    product.category === "HYDRATION";

  const productType = isHealthcareProduct
    ? "HEALTHCARE"
    : "MEDICINE";

  setCart((currentCart) => {

    const existing = currentCart.find(
      (item) =>
        item.id === product.id &&
        item.productType === productType
    );

    if (existing) {

      if (existing.quantity >= stock) {
        alert(
          "You cannot add more than the available stock."
        );

        return currentCart;
      }

      return currentCart.map((item) =>
        item.id === product.id &&
        item.productType === productType
          ? {
              ...item,
              quantity: item.quantity + 1
            }
          : item
      );
    }

    return [
      ...currentCart,
      {
        ...product,

        // Important for order processing
        productType: productType,

        medicineId:
          productType === "MEDICINE"
            ? product.id
            : null,

        healthcareProductId:
          productType === "HEALTHCARE"
            ? product.id
            : null,

        quantity: 1
      }
    ];
  });

  alert(
    `${product.name} added to cart.`
  );
};

 const increaseCartQuantity = (productId, productType = "MEDICINE") => {
  setCart((currentCart) =>
    currentCart.map((item) => {

      if (
        item.id !== productId ||
        (item.productType || "MEDICINE") !== productType
      ) {
        return item;
      }

      const stock = Number(item.stock);

      if (!Number.isFinite(stock) || stock <= 0) {
        alert("This product is out of stock.");
        return item;
      }

      if (item.quantity >= stock) {
        alert("Maximum available stock reached.");
        return item;
      }

      return {
        ...item,
        quantity: item.quantity + 1
      };
    })
  );
};

  const decreaseCartQuantity = (
  productId,
  productType = "MEDICINE"
) => {
  setCart((currentCart) =>
    currentCart.map((item) => {

      if (
        item.id !== productId ||
        (item.productType || "MEDICINE") !== productType
      ) {
        return item;
      }

      if (item.quantity <= 1) {
        return {
          ...item,
          quantity: 1
        };
      }

      return {
        ...item,
        quantity: item.quantity - 1
      };
    })
  );
};

  const removeFromCart = (
  productId,
  productType = "MEDICINE"
) => {
  setCart((currentCart) =>
    currentCart.filter(
      (item) =>
        !(
          item.id === productId &&
          (item.productType || "MEDICINE") === productType
        )
    )
  );
};

  // =========================================================
  // BUY AGAIN / REORDER
  // =========================================================

  const buyAgain = (order) => {
    if (!order) return;

    const isHealthcare =
      order.productType === "HEALTHCARE" ||
      order.healthcareProductId != null;

    const product = isHealthcare
      ? healthcareProducts.find(
          (item) =>
            Number(item.id) ===
            Number(order.healthcareProductId)
        )
      : medicines.find(
          (item) =>
            Number(item.id) ===
            Number(order.medicineId)
        );

    if (!product) {
      alert("This product is no longer available.");
      return;
    }

    const stock = Number(product.stock);
    const quantity = Number(order.quantity || 1);

    if (!Number.isFinite(stock) || stock <= 0) {
      alert(`${product.name} is currently out of stock.`);
      return;
    }

    if (stock < quantity) {
      alert(
        `Only ${stock} unit(s) of ${product.name} are currently available.`
      );
      return;
    }

    const productType = isHealthcare
      ? "HEALTHCARE"
      : "MEDICINE";

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) =>
          Number(item.id) === Number(product.id) &&
          (item.productType || "MEDICINE") === productType
      );

      if (existing) {
        const newQuantity =
          Number(existing.quantity || 0) + quantity;

        if (newQuantity > stock) {
          alert(
            `Cannot add ${quantity} more. Only ${stock} unit(s) are available.`
          );
          return currentCart;
        }

        return currentCart.map((item) =>
          Number(item.id) === Number(product.id) &&
          (item.productType || "MEDICINE") === productType
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          productType,
          medicineId:
            productType === "MEDICINE" ? product.id : null,
          healthcareProductId:
            productType === "HEALTHCARE" ? product.id : null,
          quantity,
        },
      ];
    });

    alert(`${product.name} added to your cart again.`);
  };

  // =========================================================
  // CART TOTALS
  // =========================================================

  const cartItemCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const clearCart = () => {
    if (cart.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear your cart?"
    );

    if (confirmed) {
      setCart([]);
    }
  };

  // Delivery is charged once per cart checkout.
  // Subtotal ₹99 or more gets FREE delivery.
  const deliveryCharge =
    cartTotal >= FREE_DELIVERY_LIMIT
      ? 0
      : cartTotal > 0
      ? DELIVERY_CHARGE
      : 0;

  const cartGrandTotal = cartTotal + deliveryCharge;

  // =========================================================
  // PLACE CART ORDERS
  // =========================================================

  const placeCartOrders = async (skipConfirmation = false) => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!skipConfirmation) {
  const confirmOrder = window.confirm(
    "Place " +
      cartItemCount +
      " item(s)?\n\n" +
      "Items Subtotal: ₹" +
      cartTotal.toLocaleString("en-IN") +
      "\nDelivery Charge: " +
      (deliveryCharge === 0
        ? "FREE"
        : "₹" + deliveryCharge.toLocaleString("en-IN")) +
      "\nGrand Total: ₹" +
      cartGrandTotal.toLocaleString("en-IN") +
      "\n\nProceed with your order?"
  );

  if (!confirmOrder) return;
}

    const cartSnapshot = [...cart];

    try {
      const response = await fetch(`${API}/api/orders/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(
          cartSnapshot.map((item) => ({
            userId: user.id,

            // Send the correct product ID based on product type.
            // Medicines use medicineId.
            // Healthcare products use healthcareProductId.
            medicineId:
              item.productType === "HEALTHCARE"
                ? null
                : item.medicineId ?? item.id,

            healthcareProductId:
              item.productType === "HEALTHCARE"
                ? item.healthcareProductId ?? item.id
                : null,

            productType:
              item.productType === "HEALTHCARE"
                ? "HEALTHCARE"
                : "MEDICINE",

            quantity: item.quantity,
          }))
        ),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message || "Cart order failed."
        );
      }

      alert(
        "All cart items were ordered successfully!\\n\\n" +
          "Items: " +
          cartItemCount +
          "\\nItems Subtotal: ₹" +
          cartTotal.toLocaleString("en-IN") +
          "\\nDelivery Charge: " +
          (deliveryCharge === 0
            ? "FREE"
            : "₹" + deliveryCharge.toLocaleString("en-IN")) +
          "\\nGrand Total: ₹" +
          cartGrandTotal.toLocaleString("en-IN")
      );

      setCart([]);
      loadMedicines();
      loadMyOrders();
    } catch (error) {
      console.error(error);

      alert(
        "The cart order could not be completed.\\n\\n" +
          (error.message || "Please try again.")
      );

      loadMedicines();
      loadMyOrders();
    }
  };

  // =========================================================
  // DIRECT PLACE ORDER
  // =========================================================

  const placeOrder = async (medicine) => {
    if (medicine.stock === null || medicine.stock <= 0) {
      alert("This medicine is out of stock.");
      return;
    }

    const quantityInput = prompt(
      "Enter quantity for " + medicine.name + ":"
    );

    if (quantityInput === null) return;

    const quantity = Number(quantityInput);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (Number(medicine.stock) < quantity) {
      alert("Insufficient stock.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          userId: user.id,
          medicineId: medicine.id,
          quantity,
        }),
      });

      const data = await readResponse(response);

      if (response.ok) {
        alert(
          "Order placed successfully!\n\n" +
            "Order ID: " +
            data.id +
            "\nTracking ID: " +
            (data.trackingId || "Available in Track Order") +
            "\nEstimated Delivery: " +
            (data.estimatedDelivery || "To be updated") +
            "\nTotal Price: ₹" +
            data.totalPrice
        );

        loadMedicines();
        loadMyOrders();
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Order failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to MEDILINK backend.");
    }
  };

  // =========================================================
  // PRESCRIPTIONS
  // =========================================================

  const loadMyPrescriptions = async () => {
    if (!user || user.role !== "PATIENT") return;

    setLoadingPrescriptions(true);

    try {
      const response = await fetch(`${API}/api/prescriptions/my`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await readResponse(response);

      if (response.ok) {
        setPrescriptions(Array.isArray(data) ? data : []);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load prescriptions"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot load prescriptions.");
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const loadAllPrescriptions = async () => {
    if (
      !user ||
      (user.role !== "PHARMACY" && user.role !== "ADMIN")
    ) {
      return;
    }

    setLoadingPrescriptions(true);

    try {
      const response = await fetch(`${API}/api/prescriptions`, {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await readResponse(response);

      if (response.ok) {
        setPrescriptions(Array.isArray(data) ? data : []);
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to load prescriptions"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot load prescriptions.");
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const uploadPrescription = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    const extension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png"];

    if (
      !allowedTypes.includes(file.type) &&
      !allowedExtensions.includes(extension)
    ) {
      alert("Only PDF, JPG, JPEG and PNG files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Prescription file must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingPrescription(true);

    try {
      const response = await fetch(`${API}/api/prescriptions/upload`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
        },
        body: formData,
      });

      const data = await readResponse(response);

      if (response.ok) {
        alert(
          "Prescription uploaded successfully!\n\n" +
            "Status: " +
            (data?.status || "PENDING")
        );

        await loadMyPrescriptions();
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Prescription upload failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot upload prescription.");
    } finally {
      setUploadingPrescription(false);
      event.target.value = "";
    }
  };

  const viewPrescription = async (prescription) => {
    try {
      const response = await fetch(
        `${API}/api/prescriptions/${prescription.id}/file`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!response.ok) {
        const data = await readResponse(response);
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Unable to open prescription"
        );
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const newWindow = window.open(objectUrl, "_blank");

      if (!newWindow) {
        alert("Please allow pop-ups to view the prescription.");
      }

      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (error) {
      console.error(error);
      alert("Cannot open prescription.");
    }
  };

  const updatePrescriptionStatus = async (prescription, status) => {
    const action = status === "APPROVED" ? "approve" : "reject";

    const confirmed = window.confirm(
      "Are you sure you want to " +
        action +
        " Prescription #" +
        prescription.id +
        "?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/api/prescriptions/${prescription.id}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await readResponse(response);

      if (response.ok) {
        alert(
          "Prescription #" +
            prescription.id +
            " is now " +
            status + "."
        );

        await loadAllPrescriptions();
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Prescription status update failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot update prescription status.");
    }
  };

  // =========================================================
  // ADD MEDICINE
  // =========================================================

  const addMedicine = async () => {
    const medicineName = prompt("Enter medicine name:");
    if (!medicineName) return;

    const manufacturer = prompt("Enter manufacturer:");
    if (!manufacturer) return;

    const description = prompt("Enter description:");
    if (!description) return;

    const priceInput = prompt("Enter price:");
    if (priceInput === null) return;

    const stockInput = prompt("Enter stock:");
    if (stockInput === null) return;

    const price = Number(priceInput);
    const stock = Number(stockInput);

    if (
      Number.isNaN(price) ||
      Number.isNaN(stock) ||
      price < 0 ||
      stock < 0
    ) {
      alert("Please enter valid price and stock.");
      return;
    }

    try {
      const response = await fetch(`${API}/api/medicines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          name: medicineName,
          manufacturer,
          description,
          price,
          stock,
        }),
      });

      const data = await readResponse(response);

      if (response.ok) {
        alert("Medicine added successfully!");
        loadMedicines();
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Failed to add medicine"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to MEDILINK backend.");
    }
  };

  // =========================================================
  // UPDATE MEDICINE
  // =========================================================

  const updateMedicine = async (medicine) => {
    const medicineName = prompt(
      "Medicine name:",
      medicine.name || ""
    );
    if (medicineName === null) return;

    const manufacturer = prompt(
      "Manufacturer:",
      medicine.manufacturer || ""
    );
    if (manufacturer === null) return;

    const description = prompt(
      "Description:",
      medicine.description || ""
    );
    if (description === null) return;

    const priceInput = prompt(
      "Price:",
      medicine.price ?? ""
    );
    if (priceInput === null) return;

    const stockInput = prompt(
      "Stock:",
      medicine.stock ?? ""
    );
    if (stockInput === null) return;

    const price = Number(priceInput);
    const stock = Number(stockInput);

    if (
      Number.isNaN(price) ||
      Number.isNaN(stock) ||
      price < 0 ||
      stock < 0
    ) {
      alert("Invalid price or stock.");
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/medicines/${medicine.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            name: medicineName,
            manufacturer,
            description,
            price,
            stock,
          }),
        }
      );

      const data = await readResponse(response);

      if (response.ok) {
        alert("Medicine updated successfully!");
        loadMedicines();
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Update failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot update medicine.");
    }
  };

  // =========================================================
  // DELETE MEDICINE
  // =========================================================

  const deleteMedicine = async (medicine) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete " +
        medicine.name +
        "?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API}/api/medicines/${medicine.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await readResponse(response);

      if (response.ok) {
        alert("Medicine deleted successfully!");
        loadMedicines();
      } else {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Delete failed"
        );
      }
    } catch (error) {
      console.error(error);
      alert("Cannot delete medicine.");
    }
  };

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  // =========================================================
// UPDATE ORDER STATUS
// =========================================================


const updateOrderStatus = async (order) => {
  const currentStatus = String(
    order.status || order.deliveryStatus || "PLACED"
  ).toUpperCase();

  let nextStatus = "";

  if (
    currentStatus === "PLACED" ||
    currentStatus === "ORDER_PLACED"
  ) {
    nextStatus = "PROCESSING";
  } else if (currentStatus === "PROCESSING") {
    nextStatus = "DISPATCHED";
  } else if (currentStatus === "DISPATCHED") {
    nextStatus = "DELIVERED";
  } else {
    alert("This order cannot be changed.");
    return;
  }

  const confirmUpdate = window.confirm(
    "Change Order #" +
      order.id +
      " from " +
      currentStatus +
      " to " +
      nextStatus +
      "?"
  );

  if (!confirmUpdate) return;

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
      alert(
        "Order #" +
          order.id +
          " updated to " +
          nextStatus
      );

      await loadAllOrders();
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
  }
};

  // =========================================================
  // LOGOUT
  // =========================================================

  const logout = () => {
    // Clear the session so the next user must authenticate again.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMedicines([]);
    setHealthcareProducts([]);
    setOrders([]);
    setUsers([]);
    setPrescriptions([]);
    setCart([]);
    setTrackingOrder(null);
    setActiveDashboardSection("overview");
    setSearch("");
    setEmail("");
    setPassword("");
  };

  // =========================================================
  // LOAD DATA AFTER LOGIN
  // =========================================================

useEffect(() => {
  if (!user || !token) return;

  loadMedicines();
  loadHealthcareProducts();

  if (user.role === "PATIENT") {
    loadMyOrders();
    loadMyPrescriptions();
  }

  if (user.role === "ADMIN" || user.role === "PHARMACY") {
    loadAllOrders();
    loadAllPrescriptions();
  }

  if (user.role === "DELIVERY_PARTNER") {
    loadAvailableOrders();
  }

  if (user.role === "ADMIN") {
    loadUsers();
  }
}, [user, token]);

  // =========================================================
  // PRESCRIPTION SECTION
  // =========================================================

  const PrescriptionSection = ({ management = false }) => {
    const pendingCount = prescriptions.filter(
      (item) => item.status === "PENDING"
    ).length;

    return (
      <section className="section">
        <div className="section-title-row">
          <div>
            <h2>
              {management
                ? "📋 Prescription Requests"
                : "📋 My Prescriptions"}
            </h2>
            <p className="stats-subtitle">
              {management
                ? `${pendingCount} prescription${pendingCount === 1 ? "" : "s"} awaiting review`
                : "Upload prescriptions and track their approval status"}
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={
              management
                ? loadAllPrescriptions
                : loadMyPrescriptions
            }
          type="button">
            🔄 Refresh
          </button>
        </div>

        {!management && (
          <div
            style={{
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px" }}>
                  📤 Upload Prescription
                </h3>
                <p style={{ margin: 0, color: "#64748b" }}>
                  PDF, JPG, JPEG or PNG • Maximum 5 MB
                </p>
              </div>

              <label
                className="success-button"
                style={{
                  cursor: uploadingPrescription
                    ? "not-allowed"
                    : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  opacity: uploadingPrescription ? 0.7 : 1,
                }}
              >
                {uploadingPrescription
                  ? "⏳ Uploading..."
                  : "📤 Choose File"}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={uploadPrescription}
                  disabled={uploadingPrescription}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        )}

        {loadingPrescriptions ? (
          <p className="center-text">
            Loading prescriptions...
          </p>
        ) : prescriptions.length === 0 ? (
          <p className="center-text">
            {management
              ? "No prescriptions have been uploaded."
              : "You have not uploaded any prescriptions yet."}
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {prescriptions.map((prescription) => {
              const status = prescription.status || "PENDING";
              const statusClass =
                status === "APPROVED"
                  ? "success"
                  : status === "REJECTED"
                  ? "danger"
                  : "pending";

              return (
                <div
                  key={prescription.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "18px",
                    background: "#ffffff",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#64748b",
                          marginBottom: "5px",
                        }}
                      >
                        Prescription #{prescription.id}
                      </div>
                      <h3
                        style={{
                          margin: 0,
                          wordBreak: "break-word",
                        }}
                      >
                        📄 {prescription.fileName}
                      </h3>
                    </div>

                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        background:
                          statusClass === "success"
                            ? "#dcfce7"
                            : statusClass === "danger"
                            ? "#fee2e2"
                            : "#fef3c7",
                        color:
                          statusClass === "success"
                            ? "#166534"
                            : statusClass === "danger"
                            ? "#991b1b"
                            : "#92400e",
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  {management && (
                    <p
                      style={{
                        margin: "12px 0 4px",
                        color: "#475569",
                      }}
                    >
                      <strong>Patient ID:</strong> {prescription.patientId}
                    </p>
                  )}

                  <p
                    style={{
                      margin: "4px 0 14px",
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Uploaded: {prescription.uploadedAt
                      ? new Date(prescription.uploadedAt).toLocaleString("en-IN")
                      : "-"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="primary-button"
                      onClick={() => viewPrescription(prescription)}
                    type="button">
                      👁️ View File
                    </button>

                    {management && status === "PENDING" && (
                      <>
                        <button
                          className="success-button"
                          onClick={() =>
                            updatePrescriptionStatus(
                              prescription,
                              "APPROVED"
                            )
                          }
                        type="button">
                          ✓ Approve
                        </button>

                        <button
                          className="danger-button"
                          onClick={() =>
                            updatePrescriptionStatus(
                              prescription,
                              "REJECTED"
                            )
                          }
                        type="button">
                          ✕ Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  };

  // =========================================================
  // MEDICINE SECTION
  // =========================================================

  const MedicineSection = ({ management = false }) => {
    const totalPages = Math.max(
      1,
      Math.ceil(medicines.length / medicinesPerPage)
    );

    const visibleMedicines = medicines.slice(
      (medicinePage - 1) * medicinesPerPage,
      medicinePage * medicinesPerPage
    );

    return (
      <section className="section">
        <div className="section-title-row">
          <h2>
            {management
              ? "💊 Medicine Management"
              : "💊 Available Medicines"}
          </h2>

          {management && (
            <button
              className="success-button"
              onClick={addMedicine}
            type="button">
              ➕ Add Medicine
            </button>
          )}
        </div>

<div className="search-row">
  <input
    type="text"
    placeholder="Search medicines, healthcare & wellness products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleSearch();
    }}
  />

  <button
    className="primary-button"
    onClick={handleSearch}
    type="button"
  >
    Search
  </button>

  <button
    className="secondary-button"
    onClick={() => {
      setSearch("");
      setMedicinePage(1);
      loadMedicines();
    }}
    type="button"
  >
    All
  </button>
</div>

        {loadingMedicines ? (
          <p className="center-text">
            Loading medicines...
          </p>
        ) : medicines.length === 0 ? (
          <p className="center-text">
            No medicines found.
          </p>
        ) : (
          <>
            <div className="medicine-grid">
              {visibleMedicines.map((medicine) => (
                <div
                  className="medicine-card"
                  key={medicine.id}
                >
                  <div className="medicine-image-container">
                    <img
                      src={getMedicineImage(medicine.name)}
                      alt={medicine.name}
                      className="medicine-image"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/medicine-images/default.jpg";
                      }}
                    />
                  </div>

                  <div className="medicine-category">
                    {getMedicineCategory(medicine)}
                  </div>

                  <h3>{medicine.name}</h3>

                  <p>
                    <strong>Manufacturer:</strong>{" "}
                    {medicine.manufacturer ||
                      "Not available"}
                  </p>

                  <p>
                    <strong>Description:</strong>{" "}
                    {medicine.description ||
                      "Not available"}
                  </p>

                  <p>
                    <strong>Price:</strong>{" "}
                    {medicine.price !== null &&
                    medicine.price !== undefined
                      ? "₹" + medicine.price
                      : "Not available"}
                  </p>

                  <p>
                    <strong>Stock:</strong>{" "}
                    {medicine.stock !== null &&
                    medicine.stock !== undefined
                      ? medicine.stock
                      : "Not available"}
                  </p>

                  <div className="stock-status">
                    {getStockLabel(medicine.stock)}
                  </div>

                  {management ? (
                    <div className="card-buttons">
                      <button
                        className="primary-button"
                        onClick={() =>
                          updateMedicine(medicine)
                        }
                      type="button">
                        ✏️ Update
                      </button>

                      <button
                        className="danger-button"
                        onClick={() =>
                          deleteMedicine(medicine)
                        }
                      type="button">
                        🗑️ Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      className={
                        medicine.stock > 0
                          ? "success-button full-button"
                          : "disabled-button full-button"
                      }
                      disabled={
                        medicine.stock === null ||
                        medicine.stock <= 0
                      }
                      onClick={() =>
                        addToCart(medicine)
                      }
                    type="button">
                      {medicine.stock > 0
                        ? "🛒 Add to Cart"
                        : "Out of Stock"}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="medicine-pagination">
                <button
                  className="secondary-button"
                  disabled={medicinePage === 1}
                  onClick={() =>
                    setMedicinePage((page) =>
                      Math.max(1, page - 1)
                    )
                  }
                type="button">
                  ← Previous
                </button>

                <span className="page-info">
                  Page {medicinePage} of {totalPages}
                </span>

                <button
                  className="primary-button"
                  disabled={medicinePage === totalPages}
                  onClick={() =>
                    setMedicinePage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                type="button">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  // =========================================================
  // CART SECTION
  // =========================================================

  // =========================================================
  // REFRESH SINGLE TRACKING ORDER
  // =========================================================

  const refreshTrackingOrder = async () => {
    if (!trackingOrder?.id) return;

    try {
      const response = await fetch(
        `${API}/api/orders/${trackingOrder.id}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Unable to refresh tracking"
        );
        return;
      }

      setTrackingOrder(data);

      setOrders((currentOrders) =>
        currentOrders.map((item) =>
          item.id === data.id ? data : item
        )
      );
    } catch (error) {
      console.error(error);
      alert("Cannot refresh order tracking.");
    }
  };

  // =========================================================
  // OPEN ORDER FROM NOTIFICATION
  // =========================================================

  const openOrderFromNotification = async (orderId) => {
    if (!orderId) return;

    try {
      const response = await fetch(
        `${API}/api/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok || !data) {
        alert(
          typeof data === "string"
            ? data
            : data?.message || "Unable to open this order."
        );
        return;
      }

      // Open the exact order in the existing tracking modal.
      setTrackingOrder(data);

      // Keep the order list synchronized too.
      setOrders((currentOrders) => {
        const exists = currentOrders.some(
          (item) => Number(item.id) === Number(data.id)
        );

        if (!exists) {
          return [data, ...currentOrders];
        }

        return currentOrders.map((item) =>
          Number(item.id) === Number(data.id)
            ? data
            : item
        );
      });
    } catch (error) {
      console.error(
        "Unable to open order from notification:",
        error
      );
      alert("Cannot load this order.");
    }
  };

  const formatTrackingTime = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =========================================================
  // ORDER TRACKING HELPERS
  // =========================================================

  const trackingSteps = [
    {
      status: "ORDER_PLACED",
      title: "Order Placed",
      icon: "📝",
      description: "Your order has been received by MEDILINK.",
    },
    {
      status: "PROCESSING",
      title: "Processing",
      icon: "⚙️",
      description: "The pharmacy is preparing your medicines.",
    },
    {
      status: "PACKED",
      title: "Packed",
      icon: "📦",
      description: "Your medicines have been packed safely.",
    },
    {
      status: "OUT_FOR_DELIVERY",
      title: "Out for Delivery",
      icon: "🚚",
      description: "Your order is on the way to you.",
    },
    {
      status: "DELIVERED",
      title: "Delivered",
      icon: "🎉",
      description: "Your order has been delivered successfully.",
    },
  ];

  const getTrackingIndex = (order) => {
    if (!order) return 0;

    const deliveryStatus = order.deliveryStatus;
    const status = order.status;

    if (deliveryStatus === "DELIVERED" || status === "DELIVERED") {
      return 4;
    }

    if (deliveryStatus === "OUT_FOR_DELIVERY" || status === "DISPATCHED") {
      return 3;
    }

    if (order.packedAt) {
      return 2;
    }

    if (deliveryStatus === "PROCESSING" || status === "PROCESSING") {
      return 1;
    }

    return 0;
  };

  const getDisplayDeliveryStatus = (order) => {
    if (!order) return "ORDER_PLACED";

    if (order.deliveryStatus) {
      return order.deliveryStatus;
    }

    if (order.status === "DELIVERED") return "DELIVERED";
    if (order.status === "DISPATCHED") return "OUT_FOR_DELIVERY";
    if (order.status === "PROCESSING") return "PROCESSING";

    return "ORDER_PLACED";
  };

  const getTrackingStatusLabel = (status) => {
    const labels = {
      ORDER_PLACED: "Order Placed",
      PROCESSING: "Processing",
      PACKED: "Packed",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered",
    };

    return labels[status] || status || "Order Placed";
  };

  // =========================================================
  // TRACKING MODAL
  // =========================================================

  const OrderTrackingModal = () => {
    if (!trackingOrder) return null;

    const currentIndex = getTrackingIndex(trackingOrder);
    const displayStatus =
      getDisplayDeliveryStatus(trackingOrder);

    return (
      <div
        className="tracking-modal-overlay"
        onClick={() => setTrackingOrder(null)}
      >
        <div
          className="tracking-modal"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(1100px, 96vw)",
            maxHeight: "92vh",
            overflowY: "auto",
          }}
        >
          {/* HEADER */}
          <div className="tracking-modal-header">
            <div>
              <h2>
                📦 Track Order #{trackingOrder.id}
              </h2>

              <p>
                Current status:{" "}
                <strong>
                  {getTrackingStatusLabel(displayStatus)}
                </strong>
              </p>
            </div>

            <button
              className="tracking-close-button"
              onClick={() => setTrackingOrder(null)}
            type="button">
              ✕
            </button>
          </div>

          {/* TRACKING INFORMATION */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "4px",
                }}
              >
                Tracking ID
              </span>
              <strong>
                {trackingOrder.trackingId || "Generating..."}
              </strong>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "4px",
                }}
              >
                Estimated Delivery
              </span>
              <strong>
                {trackingOrder.estimatedDelivery ||
                  "To be updated"}
              </strong>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "4px",
                }}
              >
                Delivery Partner
              </span>
              <strong>
                {trackingOrder.deliveryPartner ||
                  "Assigned by pharmacy"}
              </strong>
            </div>

            <div
              style={{
                padding: "14px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "4px",
                }}
              >
                Partner Phone
              </span>
              <strong>
                {trackingOrder.deliveryPhone || "Not assigned"}
              </strong>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="tracking-summary">
            <div>
              <span>Order ID</span>
              <strong>#{trackingOrder.id}</strong>
            </div>

            <div>
              <span>Product</span>
              <strong>
                {trackingOrder.productType === "HEALTHCARE" ||
                trackingOrder.healthcareProductId != null
                  ? "🩺 " + getOrderProductName(trackingOrder)
                  : "💊 " + getOrderProductName(trackingOrder)}
              </strong>
            </div>

            <div>
              <span>Product Type</span>
              <strong>
                {trackingOrder.productType || "MEDICINE"}
              </strong>
            </div>

            <div>
              <span>Quantity</span>
              <strong>{trackingOrder.quantity}</strong>
            </div>

            <div>
              <span>Total</span>
              <strong>
                ₹
                {Number(
                  trackingOrder.totalPrice || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          {/* MAP */}
          <div
            style={{
              marginTop: "20px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>
                  🗺️ Live Delivery Map
                </h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  MEDILINK delivery route and order location
                </p>
              </div>

              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background:
                    displayStatus === "DELIVERED"
                      ? "#dcfce7"
                      : "#dbeafe",
                  color:
                    displayStatus === "DELIVERED"
                      ? "#166534"
                      : "#1d4ed8",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {getTrackingStatusLabel(displayStatus)}
              </span>
            </div>

            <OrderTrackingMap order={trackingOrder} />
          </div>

          {/* TIMELINE */}
          <div>
            <h3 style={{ marginBottom: "14px" }}>
              📍 Delivery Timeline
            </h3>

            <div className="tracking-timeline">
              {trackingSteps.map((step, index) => {
                const completed = index <= currentIndex;
                const isCurrent = index === currentIndex;

                let timestamp = null;

                if (index === 0) {
                  timestamp = trackingOrder.createdAt;
                } else if (index === 1) {
                  timestamp =
                    trackingOrder.status === "PROCESSING" ||
                    currentIndex >= 1
                      ? trackingOrder.updatedAt
                      : null;
                } else if (index === 2) {
                  timestamp = trackingOrder.packedAt;
                } else if (index === 3) {
                  timestamp = trackingOrder.dispatchedAt;
                } else if (index === 4) {
                  timestamp = trackingOrder.deliveredAt;
                }

                return (
                  <div
                    className={
                      "tracking-step " +
                      (completed ? "completed " : "") +
                      (isCurrent ? "current" : "")
                    }
                    key={step.status}
                  >
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={
                          "tracking-line " +
                          (index < currentIndex
                            ? "completed"
                            : "")
                        }
                      />
                    )}

                    <div className="tracking-marker">
                      {completed ? "✓" : step.icon}
                    </div>

                    <div className="tracking-content">
                      <h3>{step.title}</h3>

                      <p>{step.description}</p>

                      {timestamp && (
                        <small
                          style={{
                            color: "#64748b",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          {formatTrackingTime(timestamp)}
                        </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DELIVERY COMPLETION MESSAGE */}
          {displayStatus === "DELIVERED" && (
            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                borderRadius: "12px",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                fontWeight: 600,
              }}
            >
              🎉 Your MEDILINK order has been delivered successfully.
              Thank you for using MEDILINK.
            </div>
          )}

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              flexWrap: "wrap",
              marginTop: "20px",
            }}
          >
            <button
              className="secondary-button"
              onClick={refreshTrackingOrder}
            type="button">
              🔄 Refresh Tracking
            </button>

            <button
              className="tracking-refresh-button"
              onClick={() => setTrackingOrder(null)}
            type="button">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // ORDER PRODUCT DISPLAY
  // =========================================================

  const getOrderProductName = (order) => {
    if (!order) return "Unknown Product";

    if (
      order.productType === "HEALTHCARE" ||
      order.healthcareProductId != null
    ) {
      const product = healthcareProducts.find(
        (item) =>
          Number(item.id) === Number(order.healthcareProductId)
      );

      return product?.name ||
        `Healthcare Product #${order.healthcareProductId ?? "-"}`;
    }

    const medicine = medicines.find(
      (item) => Number(item.id) === Number(order.medicineId)
    );

    return medicine?.name ||
      `Medicine #${order.medicineId ?? "-"}`;
  };

  // =========================================================
  // ORDERS SECTION
  // =========================================================


const OrdersSection = ({
  adminView = false,
  initialFilter = "ALL",
}) => {

    const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");

    const [currentOrderPage, setCurrentOrderPage] = useState(1);
    const ordersPerPage = 2;

const [orderSearchTerm, setOrderSearchTerm] = useState("");



useEffect(() => {
  setCurrentOrderPage(1);
}, [orderSearchTerm, orderStatusFilter]);



useEffect(() => {
  setOrderStatusFilter(initialFilter || "ALL");
  setCurrentOrderPage(1);
}, [initialFilter]);


    const getOrderDate = (order) => {
      const value =
        order?.createdAt ||
        order?.orderDate ||
        order?.placedAt ||
        order?.updatedAt;

      if (!value) return "Order placed";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "Order placed";

      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    };

    const getOrderStatusClass = (order) => {
      const status =
        order?.deliveryStatus ||
        order?.status ||
        "ORDER_PLACED";

      if (status === "DELIVERED") return "success";
      if (
        status === "DISPATCHED" ||
        status === "OUT_FOR_DELIVERY"
      ) {
        return "info";
      }
      if (
        status === "PROCESSING" ||
        status === "PACKED"
      ) {
        return "warning";
      }

      return "pending";
    };

    const getOrderStatusText = (order) => {
      if (!order) return "Order Placed";

      if (order.deliveryStatus === "OUT_FOR_DELIVERY") {
        return "Out for Delivery";
      }

      if (order.deliveryStatus === "ORDER_PLACED") {
        return "Order Placed";
      }

      if (order.deliveryStatus) {
        return getTrackingStatusLabel(order.deliveryStatus);
      }

      if (order.status === "DISPATCHED") {
        return "Out for Delivery";
      }

      if (order.status === "PROCESSING") {
        return "Processing";
      }

      if (order.status === "DELIVERED") {
        return "Delivered";
      }

      return "Order Placed";
    };

    const getOrderImage = (order) => {
      if (
        order?.productType === "HEALTHCARE" ||
        order?.healthcareProductId != null
      ) {
        const product = healthcareProducts.find(
          (item) =>
            Number(item.id) ===
            Number(order.healthcareProductId)
        );

        return product?.image
          ? `/healthcare-image/${product.image}`
          : "/medicine-images/default.jpg";
      }

      const medicine = medicines.find(
        (item) =>
          Number(item.id) === Number(order?.medicineId)
      );

      return medicine
        ? getMedicineImage(medicine.name)
        : "/medicine-images/default.jpg";
    };

    const openTracking = async (order) => {
      setTrackingOrder(order);

      try {
        const response = await fetch(
          `${API}/api/orders/${order.id}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await readResponse(response);

        if (response.ok && data) {
          setTrackingOrder(data);
        }
      } catch (error) {
        console.error(
          "Unable to load latest tracking data:",
          error
        );
      }
    };


const filteredOrders = orders.filter((order) => {
  const searchText = orderSearchTerm.trim().toLowerCase();

  const orderId = String(order.id ?? "").toLowerCase();

  const patientName = String(
    order.patient?.name ||
    order.user?.name ||
    order.patientName ||
    order.userName ||
    order.customerName ||
    order.customer?.name ||
    ""
  ).toLowerCase();

  const matchesSearch =
    !searchText ||
    orderId.includes(searchText) ||
    patientName.includes(searchText);

  const status = String(
    order.deliveryStatus || order.status || "ORDER_PLACED"
  ).toUpperCase();

  let matchesStatus = true;

  if (orderStatusFilter === "PLACED") {
    matchesStatus =
      status === "ORDER_PLACED" || status === "PLACED";
  } else if (orderStatusFilter === "PROCESSING") {
    matchesStatus =
      status === "PROCESSING" || status === "PACKED";
  } else if (orderStatusFilter === "OUT_FOR_DELIVERY") {
    matchesStatus =
      status === "OUT_FOR_DELIVERY" || status === "DISPATCHED";
  } else if (orderStatusFilter === "DELIVERED") {
    matchesStatus = status === "DELIVERED";
  }

  return matchesSearch && matchesStatus;
});



const totalOrderPages = Math.max(
  1,
  Math.ceil(filteredOrders.length / ordersPerPage)
);

const paginatedOrders = filteredOrders.slice(
  (currentOrderPage - 1) * ordersPerPage,
  currentOrderPage * ordersPerPage
);




    return (
      <section className="section">
        <div className="section-title-row">
          <div>
            <h2>
              📦 {adminView ? "Orders" : "My Orders"}
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              {adminView
                ? "Manage and update customer orders."
                : "View your order history, delivery status and tracking details."}
            </p>
          </div>

          <button
            className="primary-button"
            onClick={
              adminView
                ? loadAllOrders
                : loadMyOrders
            }
            type="button"
          >
            🔄 Refresh Orders
          </button>
        </div>


        <div style={{ margin: "20px 0" }}>
          <input
            type="text"
            value={orderSearchTerm}
            onChange={(event) => setOrderSearchTerm(event.target.value)}
            placeholder="Search by Order ID or patient name..."
            aria-label="Search orders by ID or patient name"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "12px 16px",
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>


        {adminView && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            {[
              { label: "All Orders", value: "ALL", color: "#475569" },
              { label: "Placed", value: "PLACED", color: "#2563eb" },
              { label: "Processing", value: "PROCESSING", color: "#b45309" },
              { label: "Out for Delivery", value: "OUT_FOR_DELIVERY", color: "#0369a1" },
              { label: "Delivered", value: "DELIVERED", color: "#15803d" },
            ].map((filter) => {
              const count = orders.filter((order) => {
                const status = order.deliveryStatus || order.status || "ORDER_PLACED";

                if (filter.value === "ALL") return true;
                if (filter.value === "PLACED") {
                  return status === "ORDER_PLACED" || status === "PLACED";
                }
                if (filter.value === "PROCESSING") {
                  return status === "PROCESSING" || status === "PACKED";
                }
                if (filter.value === "OUT_FOR_DELIVERY") {
                  return status === "OUT_FOR_DELIVERY" || status === "DISPATCHED";
                }
                return status === "DELIVERED";
              }).length;

              const selected = orderStatusFilter === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setOrderStatusFilter(filter.value)}
                  style={{
                    padding: "16px 12px",
                    borderRadius: "12px",
                    border: selected
                      ? `2px solid ${filter.color}`
                      : "1px solid #e2e8f0",
                    background: selected ? "#f1f5f9" : "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ color: filter.color, fontWeight: 700 }}>
                    {filter.label}
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>
                    {count}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    orders
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {loadingOrders ? (
          <p className="center-text">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              borderRadius: "16px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "42px" }}>📦</div>

            <h3>
              {adminView
                ? "No orders found"
                : "You have not placed any orders yet"}
            </h3>

            {!adminView && (
              <p style={{ color: "#64748b" }}>
                Your medicine and healthcare product orders
                will appear here.
              </p>
            )}
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

           {paginatedOrders.map((order) => {
              const isHealthcare =
                order.productType === "HEALTHCARE" ||
                order.healthcareProductId != null;

              const productName =
                getOrderProductName(order);

              const statusText =
                getOrderStatusText(order);

              const statusClass =
                getOrderStatusClass(order);

              return (

<div
  key={order.id}
  onClick={() => openTracking(order)}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter") openTracking(order);
  }}
  style={{
    background: "#ffffff",
    border: "1px solid #dbe5f1",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(15, 40, 75, 0.06)",
    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
    minWidth: 0,
    overflow: "hidden",
  }}
>


                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          marginBottom: "4px",
                        }}
                      >
                        ORDER #{order.id}
                      </div>

                      <strong
                        style={{
                          fontSize: "13px",
                          color: "#475569",
                        }}
                      >
                        {getOrderDate(order)}
                      </strong>
                    </div>

                    <span
                      style={{
                        padding: "7px 11px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        background:
                          statusClass === "success"
                            ? "#dcfce7"
                            : statusClass === "info"
                            ? "#dbeafe"
                            : statusClass === "warning"
                            ? "#fef3c7"
                            : "#f1f5f9",
                        color:
                          statusClass === "success"
                            ? "#166534"
                            : statusClass === "info"
                            ? "#1d4ed8"
                            : statusClass === "warning"
                            ? "#92400e"
                            : "#475569",
                      }}
                    >
                      {statusText}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      padding: "14px",
                      borderRadius: "14px",
                      background: "#f8fafc",
                      marginBottom: "14px",
                    }}
                  >
                    <img
                      src={getOrderImage(order)}
                      alt={productName}
                      style={{
                        width: "76px",
                        height: "76px",
                        objectFit: "contain",
                        borderRadius: "12px",
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        padding: "6px",
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "/medicine-images/default.jpg";
                      }}
                    />

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          marginBottom: "4px",
                        }}
                      >
                        {isHealthcare
                          ? "🩺 Healthcare Product"
                          : "💊 Medicine"}
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          wordBreak: "break-word",
                        }}
                      >
                        {productName}
                      </h3>

                      <p
                        style={{
                          margin: "6px 0 0",
                          color: "#64748b",
                          fontSize: "13px",
                        }}
                      >
                        Quantity:{" "}
                        <strong>{order.quantity}</strong>
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(2, minmax(0, 1fr))",
                      gap: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    <div
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        Total
                      </span>
                      <strong>
                        ₹
                        {Number(
                          order.totalPrice || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        Type
                      </span>
                      <strong>
                        {isHealthcare
                          ? "HEALTHCARE"
                          : "MEDICINE"}
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        Tracking ID
                      </span>
                      <strong
                        style={{
                          fontSize: "12px",
                          wordBreak: "break-word",
                        }}
                      >
                        {order.trackingId || "Available in Track Order"}
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        Estimated Delivery
                      </span>
                      <strong style={{ fontSize: "12px" }}>
                        {order.estimatedDelivery ||
                          "To be updated"}
                      </strong>
                    </div>
                  </div>

                  {adminView && (
                    <div
                      style={{
                        marginBottom: "14px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        color: "#475569",
                        fontSize: "13px",
                      }}
                    >
                      👤 Customer/User ID:{" "}
                      <strong>{order.userId}</strong>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    {!adminView && (
                      <>
                        <button
                          className="primary-button"
                          onClick={() =>
                            openTracking(order)
                          }
                          type="button"
                          style={{
                            flex: 1,
                            minWidth: "150px",
                          }}
                        >
                          📦 Track Order
                        </button>

                        <button
                          className="secondary-button"
                          onClick={() => buyAgain(order)}
                          type="button"
                          style={{
                            flex: 1,
                            minWidth: "150px",
                          }}
                        >
                          🔄 Buy Again
                        </button>
                      </>
                    )}

                    {adminView &&
                      (order.status === "DELIVERED" ? (
                        <span
                          className="completed"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "10px 14px",
                          }}
                        >
                          🎉 Completed
                        </span>
                      ) : (
                        <button
                          className={`status-update-button status-${String(
                            order.status || ""
                          ).toLowerCase()}`}
                          onClick={() =>
                            updateOrderStatus(order)
                          }
                          type="button"
                        >
                          {String(order.status || "").toUpperCase() === "PLACED" &&
    "⚙️ Process Order"}

  {String(order.status || "").toUpperCase() === "PROCESSING" &&
    "🚚 Dispatch Order"}

  {String(order.status || "").toUpperCase() === "DISPATCHED" &&
    "🎉 Mark Delivered"}
                        </button>
                      ))}
                  </div>
                </div>



              );
            })}
          </div>
        )}

        {filteredOrders.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "16px",
              marginTop: "24px",
              padding: "12px",
            }}
          >
            <button
              type="button"
              className="secondary-button"
              disabled={currentOrderPage === 1}
              onClick={() =>
                setCurrentOrderPage((page) => page - 1)
              }
            >
              ← Previous
            </button>

            <span>
              Page {currentOrderPage} of {totalOrderPages}
            </span>

            <button
              type="button"
              className="primary-button"
              disabled={currentOrderPage >= totalOrderPages}
              onClick={() =>
                setCurrentOrderPage((page) => page + 1)
              }
            >
              Next →
            </button>
          </div>
        )}
      </section>




    );
  };

  // =========================================================
  // USER MANAGEMENT
  // =========================================================

  const UsersSection = () => {
    return (
      <section className="section">
        <div className="section-title-row">
          <h2>👥 User Management</h2>

          <button
            className="primary-button"
            onClick={loadUsers}
          type="button">
            Refresh Users
          </button>
        </div>

        {loadingUsers ? (
          <p className="center-text">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <p className="center-text">
            No users found.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>

<th
  style={{
    padding: "16px 18px",
    textAlign: "left",
    background: "#eff6ff",
    color: "#1e3a8a",
    fontSize: "13px",
    fontWeight: 750,
  }}
>
  Name
</th>
<th
  style={{
    padding: "16px 18px",
    textAlign: "left",
    background: "#eff6ff",
    color: "#1e3a8a",
    fontSize: "13px",
    fontWeight: 750,
  }}
>
  Email
</th>
<th
  style={{
    padding: "16px 18px",
    textAlign: "left",
    background: "#eff6ff",
    color: "#1e3a8a",
    fontSize: "13px",
    fontWeight: 750,
  }}
>
  Phone
</th>

                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>
                      <strong>{item.role}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  // =========================================================
  // ADMIN STATISTICS
  // =========================================================
// =========================================================
// PHARMACY STATISTICS
// =========================================================

const PharmacyStats = () => {
  const totalMedicines = medicines.length;

  const totalOrders = orders.length;

  const totalStock = medicines.reduce((sum, medicine) => {
    const stock = Number(medicine.stock);
    return sum + (Number.isFinite(stock) && stock > 0 ? stock : 0);
  }, 0);

  const lowStockMedicines = medicines.filter((medicine) => {
    const stock = Number(medicine.stock);
    return Number.isFinite(stock) && stock > 0 && stock <= 10;
  }).length;

  const pendingOrders = orders.filter((order) => {
    return order.status !== "DELIVERED";
  }).length;

  const totalOrderValue = orders.reduce((sum, order) => {
    const value = Number(order.totalPrice);
    return sum + (Number.isFinite(value) && value > 0 ? value : 0);
  }, 0);

  return (
    <section className="admin-stats-section pharmacy-stats-section">

      <div className="section-title-row">
        <div>
          <h2>📊 Pharmacy Overview</h2>
          <p className="stats-subtitle">
            Quick summary of pharmacy activity
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() => {
            loadMedicines();
            loadAllOrders();
          }}
        type="button">
          🔄 Refresh Statistics
        </button>
      </div>

      <div className="stats-grid">

        <div className="stat-card stat-medicines">
          <div className="stat-icon">💊</div>
          <div>
            <p>Total Medicines</p>
            <h3>{totalMedicines}</h3>
          </div>
        </div>

        <div
  className="stat-card stat-orders"
  onClick={() => {
    setActiveDashboardSection("orders");
  }}
  role="button"
  tabIndex={0}
  style={{ cursor: "pointer" }}
>
  <div className="stat-icon">📦</div>
  <div>
    <p>Total Orders</p>
    <h3>{totalOrders}</h3>
  </div>
</div>

        <div className="stat-card stat-low-stock">
          <div className="stat-icon">⚠️</div>
          <div>
            <p>Low Stock Items</p>
            <h3>{lowStockMedicines}</h3>
          </div>
        </div>

        <div className="stat-card stat-value">
          <div className="stat-icon">💰</div>
          <div>
            <p>Order Value</p>
            <h3>
              ₹{totalOrderValue.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

        <div className="stat-card stat-users">
          <div className="stat-icon">⏳</div>
          <div>
            <p>Pending Orders</p>
            <h3>{pendingOrders}</h3>
          </div>
        </div>

      </div>
    </section>
  );
};
 const AdminStats = ({ setActiveDashboardSection }) => {
    const totalUsers = users.length;
    const totalPatients = users.filter((item) =>
      String(item.role || "").toUpperCase() === "PATIENT"
    ).length;
    const deliveryPartners = users.filter((item) =>
      String(item.role || "").toUpperCase() === "DELIVERY_PARTNER"
    ).length;
    const activePartners = deliveryPartners;
    const totalMedicines = medicines.length;
    const totalOrders = orders.length;
    const totalStock = medicines.reduce((sum, item) => {
      const value = Number(item.stock);
      return sum + (Number.isFinite(value) && value > 0 ? value : 0);
    }, 0);
    const lowStockMedicines = medicines.filter((item) => {
      const stock = Number(item.stock);
      return Number.isFinite(stock) && stock >= 0 && stock <= 10;
    });
    const totalOrderValue = orders.reduce((sum, order) => {
      const value = Number(order.totalPrice ?? order.totalAmount ?? 0);
      return sum + (Number.isFinite(value) && value > 0 ? value : 0);
    }, 0);
    const orderStatus = (order) => String(order?.deliveryStatus || order?.status || "PLACED").toUpperCase();
    const isDelivered = (order) => orderStatus(order) === "DELIVERED";
    const isProcessing = (order) => ["PROCESSING", "PACKED"].includes(orderStatus(order));
    const isOutForDelivery = (order) => ["DISPATCHED", "OUT_FOR_DELIVERY", "IN_TRANSIT"].includes(orderStatus(order));
    const isPending = (order) => !isDelivered(order) && !isProcessing(order) && !isOutForDelivery(order);
    const pendingOrders = orders.filter(isPending).length;
    const processingOrders = orders.filter(isProcessing).length;
    const deliveryOrders = orders.filter(isOutForDelivery).length;
    const deliveredOrders = orders.filter(isDelivered).length;
    // Use fields that actually exist on the backend Order response.
    // createdAt/orderDate are kept as preferred fields in case the API adds them later.
    const getOrderTimestamp = (order) => {
      const values = [
        order?.createdAt,
        order?.orderDate,
        order?.placedAt,
        order?.updatedAt,
        order?.deliveredAt,
        order?.dispatchedAt,
        order?.packedAt,
        order?.estimatedDelivery,
      ];

      for (const value of values) {
        if (!value) continue;
        const timestamp = new Date(value).getTime();
        if (Number.isFinite(timestamp)) return timestamp;
      }

      return null;
    };

    const recentOrders = [...orders]
      .sort((a, b) => (getOrderTimestamp(b) ?? 0) - (getOrderTimestamp(a) ?? 0))
      .slice(0, 5);

    const getPatientName = (order) =>
      order?.patient?.name ||
      order?.user?.name ||
      order?.patientName ||
      order?.userName ||
      order?.customerName ||
      order?.customer?.name ||
      "Patient";

    // The backend returns deliveryPartner as a string, not an object.
    const getPartnerName = (order) =>
      order?.deliveryPartner || "Not assigned";

    const getDate = (order) => {
      const timestamp = getOrderTimestamp(order);
      if (timestamp === null) return "—";

      return new Date(timestamp).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };
    const statusLabel = (order) => {
      const status = orderStatus(order);
      if (status === "DELIVERED") return "Delivered";
      if (["DISPATCHED", "OUT_FOR_DELIVERY", "IN_TRANSIT"].includes(status)) return "Out for Delivery";
      if (["PROCESSING", "PACKED"].includes(status)) return "Processing";
      return "Pending";
    };
    const orderTotal = (order) => Number(order?.totalPrice ?? order?.totalAmount ?? 0) || 0;
    const orderItems = (order) => order?.quantity ?? order?.items?.length ?? 1;
    const weeklyOrders = (() => {
      const days = [];
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - offset);
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        const count = orders.filter((order) => {
          const time = getOrderTimestamp(order);
          if (time === null) return false;
          return time >= date.getTime() && time < next.getTime();
        }).length;
        days.push({ label: date.toLocaleDateString("en-IN", { month: "short", day: "2-digit" }), count });
      }
      return days;
    })();
    const maxDailyOrders = Math.max(1, ...weeklyOrders.map((day) => day.count));
    const statusTotal = Math.max(1, pendingOrders + processingOrders + deliveryOrders + deliveredOrders);
    const notifications = [
      ...(recentOrders[0] ? [{ icon: "🛒", title: "New order activity", detail: `Order #${recentOrders[0].id ?? "—"} placed by ${getPatientName(recentOrders[0])}`, time: getDate(recentOrders[0]), tone: "green" }] : []),
      ...(deliveryOrders > 0 ? [{ icon: "🚚", title: "Orders out for delivery", detail: `${deliveryOrders} order(s) are on the way`, time: "Current status", tone: "amber" }] : []),
      ...(lowStockMedicines.length > 0 ? [{ icon: "⚠️", title: "Low stock alert", detail: `${lowStockMedicines.length} medicine(s) have 10 or fewer units`, time: "Inventory", tone: "red" }] : []),
      ...(pendingOrders > 0 ? [{ icon: "📦", title: "Orders awaiting action", detail: `${pendingOrders} order(s) need processing`, time: "Orders", tone: "purple" }] : []),
    ];
    const activity = recentOrders.slice(0, 4);

    return (
      <section className="medilink-admin-dashboard">
        <header className="admin-dashboard-heading">
          <div>
            <p className="admin-eyebrow">MEDILINK CONTROL CENTER</p>
            <h1>Admin Dashboard</h1>
            <p>Complete overview of the MEDILINK system</p>
          </div>
          <button className="admin-refresh-button" type="button" onClick={() => { loadMedicines(); loadAllOrders(); loadUsers(); }}>
            ↻ Refresh dashboard
          </button>
        </header>

        <div className="admin-dashboard-main-grid">
          <div className="admin-dashboard-primary">
            <div className="admin-kpi-grid">

<article
  className="admin-kpi-card kpi-blue"
  role="button"
  tabIndex={0}
  onClick={() => setActiveDashboardSection("users")}
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setActiveDashboardSection("users");
    }
  }}
  style={{ cursor: "pointer" }}
>


              <div className="admin-kpi-icon">👤</div><div><strong>{totalPatients}</strong><span>Total Patients</span><small>{totalUsers} total registered users</small></div></article>

<article
  className="admin-kpi-card kpi-purple"
  role="button"
  tabIndex={0}
  onClick={() => setActiveDashboardSection("deliveryPartners")}
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setActiveDashboardSection("deliveryPartners");
    }
  }}
  style={{ cursor: "pointer" }}><div className="admin-kpi-icon">🚚</div><div><strong>{deliveryPartners}</strong><span>Delivery Partners</span><small>{activePartners} registered partner(s)</small></div></article>

<article
  className="admin-kpi-card kpi-rose"
  role="button"
  tabIndex={0}
  onClick={() => setActiveDashboardSection("medicines")}
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setActiveDashboardSection("medicines");
    }
  }}
  style={{ cursor: "pointer" }}><div className="admin-kpi-icon">💊</div><div><strong>{totalMedicines}</strong><span>Total Medicines</span><small>In stock: {totalStock.toLocaleString("en-IN")} units · Low: {lowStockMedicines.length}</small></div></article>

<article
  className="admin-kpi-card kpi-green"
  role="button"
  tabIndex={0}

onClick={() => {
  setInitialOrderFilter("OUT_FOR_DELIVERY");
  setActiveDashboardSection("orders");
}}

  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setActiveDashboardSection("orders");
    }
  }}
  style={{ cursor: "pointer" }}
>
<div className="admin-kpi-icon">📦</div><div><strong>{totalOrders}</strong><span>Total Orders</span><small>Delivered: {deliveredOrders} · Processing: {processingOrders}</small></div></article>
            </div>

            <section className="admin-panel admin-orders-overview">
              <div className="admin-panel-heading"><div className="admin-panel-icon orange">📦</div><div><h2>Orders Overview</h2><p>Order status and delivery tracking</p></div><span className="admin-period-pill">All time⌄</span></div>
              <div className="admin-order-status-grid">

<div
  className="admin-status-tile blue"
  role="button"
  tabIndex={0}


onClick={() => {
  setInitialOrderFilter("OUT_FOR_DELIVERY");
  setActiveDashboardSection("orders");
}}


  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setInitialOrderFilter("OUT_FOR_DELIVERY");
      setActiveDashboardSection("orders");
    }
  }}
  style={{ cursor: "pointer" }}
>
  <span>🧾</span>
  <div>
    <strong>{pendingOrders}</strong>
    <small>New / Pending</small>
  </div>
</div>


<div
  className="admin-status-tile amber"
  role="button"
  tabIndex={0}


onClick={() => {
  setInitialOrderFilter("PROCESSING");
  setActiveDashboardSection("orders");
}}


  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setActiveDashboardSection("orders");
    }
  }}
  style={{ cursor: "pointer" }}
>
  <span>⚙️</span>
  <div>
    <strong>{processingOrders}</strong>
    <small>Processing</small>
  </div>
</div>


<div
  className="admin-status-tile purple"
  role="button"
  tabIndex={0}
  onClick={() => {
    setInitialOrderFilter("OUT_FOR_DELIVERY");
    setActiveDashboardSection("orders");
  }}
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setInitialOrderFilter("OUT_FOR_DELIVERY");
      setActiveDashboardSection("orders");
    }
  }}
  style={{ cursor: "pointer" }}
>
<div
  className="admin-status-tile purple"
  role="button"
  tabIndex={0}

  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setInitialOrderFilter("OUT_FOR_DELIVERY");
      setActiveDashboardSection("orders");
    }
  }}
  style={{ cursor: "pointer" }}
>
  <span>🚚</span>
  <div>
    <strong>{deliveryOrders}</strong>
    <small>Out for Delivery</small>
  </div>
</div>


onClick={() => {
  setInitialOrderFilter("OUT_FOR_DELIVERY");
  setActiveDashboardSection("orders");
}}

</div>


<div
  className="admin-status-tile green"
  role="button"
  tabIndex={0}
  onClick={() => {
    setInitialOrderFilter("DELIVERED");
    setActiveDashboardSection("orders");
  }}
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setInitialOrderFilter("DELIVERED");
      setActiveDashboardSection("orders");
    }
  }}
  style={{ cursor: "pointer" }}
>
<span>✓</span><div><strong>{deliveredOrders}</strong>

<div
  className="admin-status-tile green"
  role="button"
  tabIndex={0}
  onClick={() => {
    setInitialOrderFilter("DELIVERED");
    setActiveDashboardSection("orders");
  }}
  onKeyDown={(event) => {
    if (event.key === "Enter") {
      setInitialOrderFilter("DELIVERED");
      setActiveDashboardSection("orders");
    }
  }}
  style={{ cursor: "pointer" }}
>
  <span>✓</span>
  <div>
    <strong>{deliveredOrders}</strong>
    <small>Completed</small>
  </div>
</div>

</div></div>
              </div>
            </section>

            <section className="admin-panel admin-recent-panel">
              <div className="admin-panel-heading"><div className="admin-panel-icon blue">▤</div><div><h2>Recent Orders</h2><p>Latest orders received by MEDILINK</p></div><button className="admin-text-button" type="button" onClick={() => setActiveDashboardSection("orders")}>View all →</button></div>
              {recentOrders.length === 0 ? <div className="admin-empty-state">No orders have been placed yet.</div> : (
                <div className="admin-table-scroll"><table className="admin-dashboard-table"><thead><tr><th>Order ID</th><th>Patient</th><th>Items</th><th>Amount</th><th>Status</th><th>Delivery Partner</th><th>Date</th><th>Action</th></tr></thead><tbody>
                  {recentOrders.map((order, index) => <tr key={order.id ?? index}><td>#{order.id ?? "—"}</td><td>{getPatientName(order)}</td><td>{orderItems(order)}</td><td>₹{orderTotal(order).toLocaleString("en-IN")}</td><td><span className={`admin-status-chip ${statusLabel(order).toLowerCase().replaceAll(" ", "-")}`}>{statusLabel(order)}</span></td><td>{getPartnerName(order)}</td><td>{getDate(order)}</td><td>

                <button
  className="admin-view-button"
  type="button"
  onClick={() => setActiveDashboardSection("orders")}
>
  View
</button>

                    </td></tr>)}
                </tbody></table></div>
              )}
            </section>
          </div>

          <aside className="admin-dashboard-rail">
            <section className="admin-panel admin-notifications-panel"><div className="admin-panel-heading"><div className="admin-panel-icon navy">♟</div><div><h2>Notifications</h2><p>Important system updates</p></div><span className="admin-notification-count">{notifications.length}</span></div>
              {notifications.length === 0 ? <p className="admin-rail-empty">You're all caught up.</p> : notifications.map((item, index) => <div className="admin-notification-row" key={`${item.title}-${index}`}><span className={`admin-notification-icon ${item.tone}`}>{item.icon}</span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div><i /></div>)}
              <button className="admin-rail-link" type="button" onClick={() => setActiveDashboardSection("orders")}>Review orders →</button>
            </section>
            <section className="admin-panel admin-activity-panel"><div className="admin-panel-heading"><div className="admin-panel-icon green">◷</div><div><h2>Today's Activity</h2><p>Latest order updates</p></div></div>
              {activity.length === 0 ? <p className="admin-rail-empty">Activity will appear when orders arrive.</p> : activity.map((order, index) => <div className="admin-activity-row" key={order.id ?? index}><span className={`admin-activity-dot dot-${statusLabel(order).toLowerCase().replaceAll(" ", "-")}`} /><span className="admin-activity-symbol">{isDelivered(order) ? "✓" : isOutForDelivery(order) ? "🚚" : "🛒"}</span><div><strong>Order #{order.id ?? "—"} {statusLabel(order).toLowerCase()}</strong><p>{getPatientName(order)} · ₹{orderTotal(order).toLocaleString("en-IN")}</p></div></div>)}
            </section>
          </aside>
        </div>

        <div className="admin-dashboard-bottom-grid">
          <section className="admin-panel admin-distribution-panel"><div className="admin-panel-heading"><div className="admin-panel-icon navy">◉</div><div><h2>Order Status Distribution</h2><p>Breakdown of all current orders</p></div></div>
            <div className="admin-distribution-content"><div className="admin-donut" style={{ background: `conic-gradient(#16b978 0 ${(deliveredOrders / statusTotal) * 100}%, #2879f6 ${(deliveredOrders / statusTotal) * 100}% ${((deliveredOrders + pendingOrders) / statusTotal) * 100}%, #f5a623 ${((deliveredOrders + pendingOrders) / statusTotal) * 100}% ${((deliveredOrders + pendingOrders + processingOrders) / statusTotal) * 100}%, #8957ef ${((deliveredOrders + pendingOrders + processingOrders) / statusTotal) * 100}% 100%)` }}><div><strong>{totalOrders}</strong><span>Total Orders</span></div></div>
              <div className="admin-legend"><div><i className="legend-green"/>Delivered <strong>{deliveredOrders}</strong></div><div><i className="legend-blue"/>New / Pending <strong>{pendingOrders}</strong></div><div><i className="legend-amber"/>Processing <strong>{processingOrders}</strong></div><div><i className="legend-purple"/>Out for Delivery <strong>{deliveryOrders}</strong></div></div></div>
          </section>
          <section className="admin-panel admin-weekly-panel"><div className="admin-panel-heading"><div className="admin-panel-icon blue">▥</div><div><h2>Order Activity</h2><p>Orders received over the last 7 days</p></div><span className="admin-period-pill">7 days</span></div>
            <div className="admin-weekly-chart">{weeklyOrders.map((day) => <div className="admin-chart-column" key={day.label}><strong>{day.count}</strong><div className="admin-chart-track"><span style={{ height: `${Math.max(day.count > 0 ? 8 : 3, (day.count / maxDailyOrders) * 100)}%` }} /></div><small>{day.label}</small></div>)}</div>
          </section>
          <section className="admin-panel admin-low-stock-panel"><div className="admin-panel-heading"><div className="admin-panel-icon red">⚠</div><div><h2>Low Stock Medicines</h2><p>Medicines requiring attention</p></div><button className="admin-text-button" type="button" onClick={() => setActiveDashboardSection("medicines")}>View all →</button></div>
            {lowStockMedicines.length === 0 ? <p className="admin-rail-empty">All medicines have sufficient stock.</p> : <div className="admin-low-stock-list">{lowStockMedicines.slice(0, 5).map((medicine, index) => <div className="admin-low-stock-row" key={medicine.id ?? index}><img src={getMedicineImage(medicine.name || medicine.medicineName || "")} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /><div><strong>{medicine.name || medicine.medicineName || "Medicine"}</strong><small>{medicine.category || medicine.medicineCategory || "Medicine"}</small></div><b>{Number(medicine.stock) || 0}</b><button type="button" onClick={() => setActiveDashboardSection("medicines")}>Update</button></div>)}</div>}
          </section>
        </div>
        <div className="admin-dashboard-footer"><span>MEDILINK · Digital Healthcare Management</span><span>Dashboard values are based on currently loaded system data.</span></div>
      </section>
    );
  };

  // RESET PASSWORD PAGE
  // =========================================================

  if (resetToken) {
    return (
      <div className="app">
        <div className="login-container">
          <div className="logo">🔐</div>

          <h1>MEDILINK</h1>

          <p className="subtitle">
            Create a new password for your account
          </p>

          <div className="form-container">
            <h2>Reset Password</h2>

            <p className="reset-password-info">
              Enter your new password below. This reset link can only be used once and expires after 15 minutes.
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label>New Password</label>

                <div className="password-input-wrapper">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={resetPasswordValue}
                    onChange={(e) => setResetPasswordValue(e.target.value)}
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    aria-label={showResetPassword ? "Hide password" : "Show password"}
                  >
                    {showResetPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Confirm New Password</label>

                <input
                  type={showResetPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmResetPassword}
                  onChange={(e) => setConfirmResetPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>

              <button type="submit" className="login-button">
                🔑 Update Password
              </button>
            </form>

            <div className="switch-text">
              Remembered your password?
              <button
                className="switch-button"
                type="button"
                onClick={() => {
                  window.location.href = window.location.origin;
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  if (user) {
    return (
      <div className="app">
        <div className="dashboard-container">

          {/* HEADER */}
          <div className="dashboard-header">
            <div>
              <h1>MEDILINK</h1>
              <p>
                Digital Healthcare Management System
              </p>
            </div>

            {user.role === "PATIENT" && (
              <NotificationBell
                user={user}
                onOrderClick={openOrderFromNotification}
              />
            )}

            <button
              className="danger-button logout-button"
              onClick={logout}
            type="button">
              Logout
            </button>
          </div>

          {/* USER INFORMATION */}
          <div className="welcome-box">
            <h2>
              Welcome, {user.name} 👋
            </h2>

            <p>
              <strong>Email:</strong>{" "}
              {user.email}
            </p>

            <p>
              <strong>Role:</strong>{" "}
              {user.role}
            </p>
            </div>

    {/* Role Based Dashboard Navigation */}
    {user.role !== "DELIVERY_PARTNER" && dashboardSections[user.role] && (
      <div className="dashboard-navigation">
        {dashboardSections[user.role].map((section) => (
          <button
            key={section.id}
            type="button"
            className={
              activeDashboardSection === section.id
                ? "dashboard-nav-button active"
                : "dashboard-nav-button"
            }

            onClick={() => {
  console.log("Clicked dashboard section:", section.id);
  setActiveDashboardSection(section.id);

  if (section.id === "deliveryPartners") {
    loadDeliveryPartners();
    loadAllOrders();
  }
}}
          >
            <span className="dashboard-nav-icon">{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>
    )}

    {/* DELIVERY PARTNER */}
    {user.role === "DELIVERY_PARTNER" && (
      <DeliveryPartnerDashboard
        user={user}
        partnerId={user.deliveryPartnerId ?? 1}
      />
    )}

          {/* PATIENT */}
{user.role === "PATIENT" && (
  <>
    {activeDashboardSection === "overview" && (
      <div className="section">
        <h2>🏠 Patient Overview</h2>

        <p className="stats-subtitle">
          Welcome to your MEDILINK healthcare dashboard.
        </p>

        <div className="admin-stats-grid">

 <div
  className="stat-card"
  onClick={() => setActiveDashboardSection("orders")}
  role="button"
  tabIndex={0}
  style={{ cursor: "pointer" }}
>
  <div className="stat-icon">📦</div>
  <div>
    <h3>{orders.length}</h3>
    <p>Total Orders</p>
  </div>
</div>



<div
  className="stat-card"
  onClick={() => setActiveDashboardSection("cart")}
  role="button"
  tabIndex={0}
>
  <div className="stat-icon">🛒</div>
  <div>
    <h3>{cartItemCount}</h3>
    <p>Cart Items</p>
  </div>
</div>


<div
  className="stat-card"
  onClick={() => setActiveDashboardSection("prescriptions")}
  role="button"
  tabIndex={0}
>
  <div className="stat-icon">📋</div>
  <div>
    <h3>{prescriptions.length}</h3>
    <p>Prescriptions</p>
  </div>
</div>



<div
  className="stat-card"
  onClick={() => setActiveDashboardSection("products")}
  role="button"
  tabIndex={0}
>
  <div className="stat-icon">💊</div>
  <div>
    <h3>{medicines.length}</h3>
    <p>Medicines Available</p>
  </div>
</div>


        </div>
          {/* QUICK CART + RECENT ORDERS */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  }}
>
  {/* CART SUMMARY */}
  <div
    style={{
      padding: "22px",
      borderRadius: "16px",
      background: "#ffffff",
      border: "1px solid #dbeafe",
      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
    }}
  >
    <h3 style={{ margin: "0 0 6px" }}>
      🛒 My Cart
    </h3>

    <p style={{ color: "#64748b", marginTop: 0 }}>
      {cartItemCount} item
      {cartItemCount === 1 ? "" : "s"} in your cart
    </p>

    <h2 style={{ margin: "12px 0" }}>
      ₹{cartGrandTotal.toLocaleString("en-IN")}
    </h2>

    {cart.length === 0 ? (
      <p
        style={{
          padding: "12px",
          background: "#f8fafc",
          borderRadius: "10px",
          color: "#64748b",
        }}
      >
        Your cart is empty.
      </p>
    ) : (
      <p style={{ color: "#64748b" }}>
        Subtotal: ₹{cartTotal.toLocaleString("en-IN")}
        <br />
        Delivery:{" "}
        {deliveryCharge === 0
          ? "FREE"
          : "₹" + deliveryCharge.toLocaleString("en-IN")}
      </p>
    )}

    <button
      className="success-button"
      type="button"
      style={{ width: "100%" }}
      onClick={() =>
        setActiveDashboardSection("cart")
      }
    >
      🛒 Review Cart
    </button>
  </div>

  {/* RECENT ORDERS */}
  <div
    style={{
      padding: "22px",
      borderRadius: "16px",
      background: "#ffffff",
      border: "1px solid #dbeafe",
      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.06)",
    }}
  >
    <h3 style={{ margin: "0 0 6px" }}>
      📦 Recent Orders
    </h3>

    <p style={{ color: "#64748b", marginTop: 0 }}>
      Your latest orders
    </p>

    {orders.length === 0 ? (
      <p
        style={{
          padding: "12px",
          background: "#f8fafc",
          borderRadius: "10px",
          color: "#64748b",
        }}
      >
        You have no orders yet.
      </p>
    ) : (
      <div>
        {orders.slice(0, 3).map((order) => (
          <div
            key={order.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <strong>
                Order #{order.id}
              </strong>

              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  marginTop: "4px",
                }}
              >
                Order details
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <strong>
                ₹
                {Number(
                  order.totalPrice || 0
                ).toLocaleString("en-IN")}
              </strong>

              <div
                style={{
                  fontSize: "12px",
                  marginTop: "3px",
                  color:
                    order.status === "DELIVERED"
                      ? "#16a34a"
                      : "#64748b",
                }}
              >
                {order.status || "PLACED"}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    <button
      className="secondary-button"
      type="button"
      style={{
        width: "100%",
        marginTop: "14px",
      }}
      onClick={() =>
        setActiveDashboardSection("orders")
      }
    >
      📦 View All Orders
    </button>
  </div>
</div>

<div
  className="patient-quick-actions"
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
  }}
>


          <button
            className="success-button"
            type="button"
            onClick={() =>
              setActiveDashboardSection("products")
            }
          >
            💊 Browse Medicines
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              setActiveDashboardSection("orders")
            }
          >
            📦 View My Orders
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              setActiveDashboardSection("prescriptions")
            }
          >
            📋 My Prescriptions
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              setActiveDashboardSection("ai")
            }
          >
            🤖 AI Health Assistant
          </button>

        </div>
      </div>
    )}


{activeDashboardSection === "orders" && (
  <OrdersSection adminView={false} />
)}

{activeDashboardSection === "cart" && (
  <CartSection
    cart={cart}
    cartItemCount={cartItemCount}
    clearCart={clearCart}
    increaseCartQuantity={increaseCartQuantity}
    decreaseCartQuantity={decreaseCartQuantity}
    removeFromCart={removeFromCart}
    cartTotal={cartTotal}
    deliveryCharge={deliveryCharge}
    cartGrandTotal={cartGrandTotal}
    placeCartOrders={placeCartOrders}
  />
)}


    {activeDashboardSection === "products" && (
      <>
        <PatientCareProducts
          onAddToCart={addToCart}
          searchTerm={search}
        />

        <MedicineSection
          management={false}
        />


      </>
    )}

    {activeDashboardSection === "prescriptions" && (
      <PrescriptionSection
        management={false}
      />
    )}

    {activeDashboardSection === "profile" && (
      <PatientProfile />
    )}

    {activeDashboardSection === "ai" && (
      <AiHealthAssistant />
    )}
  </>
)}

          {/* PHARMACY */}
          {user.role === "PHARMACY" && (
  <>
    <PharmacyStats />

    <PrescriptionSection management={true} />

    <MedicineSection management={true} />


<OrdersSection
  adminView={true}
  initialFilter={initialOrderFilter}
/>

  </>
)}

{/* ADMIN */}
{user.role === "ADMIN" && (
  <>
    {activeDashboardSection === "overview" && (
  <AdminStats
    setActiveDashboardSection={setActiveDashboardSection}
  />
)}

    {activeDashboardSection === "medicines" && (
      <MedicineSection management={true} />
    )}

    {activeDashboardSection === "users" && (
      <UsersSection />
    )}

    {activeDashboardSection === "prescriptions" && (
      <PrescriptionSection management={true} />
    )}

    {activeDashboardSection === "orders" && (

<OrdersSection
  key={initialOrderFilter}
  adminView={true}
  initialFilter={initialOrderFilter}
/>

    )}

    {activeDashboardSection === "deliveryPartners" && (
      <section className="dashboard-section">
        <div className="section-title-row">
          <h2>🚚 Delivery Partners</h2>
          <p>Delivery partner accounts</p>
        </div>

<div className="admin-stats-grid">
  <div
    className="stat-card"
    style={{
      padding: "24px",
      borderRadius: "18px",
      background: "linear-gradient(135deg, #ffffff, #eff6ff)",
      border: "1px solid #bfdbfe",
      boxShadow: "0 8px 24px rgba(30, 64, 175, 0.08)",
      display: "flex",
      alignItems: "center",
      gap: "18px",
    }}
  >
    <div
      className="stat-icon"
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "16px",
        background: "#dbeafe",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
        flexShrink: 0,
      }}
    >
      🚚
    </div>
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: "30px", fontWeight: 800, color: "#1e3a8a" }}>
        {users.filter(
          (item) =>
            String(item.role || "").toUpperCase() ===
            "DELIVERY_PARTNER"
        ).length}
      </h3>
      <p style={{ margin: 0, color: "#475569", fontWeight: 600 }}>
        Total Delivery Partners
      </p>
    </div>
  </div>

  <div
    className="stat-card"
    onClick={() => setActiveDashboardSection("deliveryPartners")}
    style={{
       cursor: "pointer",
      padding: "24px",
      borderRadius: "18px",
      background: "linear-gradient(135deg, #ffffff, #f0fdf4)",
      border: "1px solid #bbf7d0",
      boxShadow: "0 8px 24px rgba(22, 101, 52, 0.08)",
      display: "flex",
      alignItems: "center",
      gap: "18px",
    }}
  >
    <div
      className="stat-icon"
      style={{
        width: "56px",
        height: "56px",
        borderRadius: "16px",
        background: "#dcfce7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "28px",
        flexShrink: 0,
      }}
    >
      📦
    </div>
    <div>
      <h3 style={{ margin: "0 0 6px", fontSize: "30px", fontWeight: 800, color: "#166534" }}>
        {orders.length}
      </h3>
      <p style={{ margin: 0, color: "#475569", fontWeight: 600 }}>
        Total Orders
      </p>
    </div>
  </div>
</div>
<div
  className="section"
  style={{
    marginTop: "24px",
    padding: "24px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 24px rgba(15, 40, 75, 0.06)",
  }}
>




<h3
  style={{
    margin: "0 0 20px",
    fontSize: "20px",
    fontWeight: 750,
    color: "#0f172a",
    letterSpacing: "-0.4px",
  }}
>
  Registered Delivery Partners
</h3>





          {loadingDeliveryPartners ? (
            <p>Loading delivery partners...</p>
          ) : deliveryPartners.length === 0 ? (
            <p>No delivery partners found yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "#ffffff",
                }}
              >
                <thead>
                  <tr>
                    {[
                      "Partner ID",
                      "Name",
                      "Email",
                      "Phone",
                      "Vehicle Number",
                      "Vehicle Type",
                      "Availability",
                      "Assigned Orders",
                      "Active Deliveries",
                      "Completed",
                      "Current Status",
                      "Tracking ID",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          background: "#eff6ff",
                          color: "#1e3a8a",
                          borderBottom: "1px solid #dbeafe",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {deliveryPartners.map((partner) => {
                    const partnerOrders = orders.filter((order) => {
                      const assignedId =
                        order.deliveryPartnerId ??
                        order.assignedPartner?.id ??
                        order.deliveryPartner?.id;

                      return (
                        assignedId != null &&
                        String(assignedId) === String(partner.id)
                      );
                    });

                    const getStatus = (order) =>
                      String(
                        order.deliveryStatus || order.status || "PLACED"
                      ).toUpperCase();

                    const completed = partnerOrders.filter(
                      (order) => getStatus(order) === "DELIVERED"
                    ).length;

                    const active = partnerOrders.filter((order) =>
                      [
                        "PROCESSING",
                        "PACKED",
                        "DISPATCHED",
                        "OUT_FOR_DELIVERY",
                        "IN_TRANSIT",
                      ].includes(getStatus(order))
                    ).length;

                    const currentOrder = partnerOrders.find(
                      (order) => getStatus(order) !== "DELIVERED"
                    );

                    return (
                      <tr key={partner.id}>
                        <td style={{ padding: "12px" }}>
                          {partner.id ?? "—"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {partner.name || "—"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {partner.email || "—"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {partner.phone || "—"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {partner.vehicleNumber || "—"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {partner.vehicleType || "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            color: partner.available ? "#15803d" : "#b91c1c",
                            fontWeight: 700,
                          }}
                        >
                          {partner.available ? "Available" : "Unavailable"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {partnerOrders.length}
                        </td>
                        <td style={{ padding: "12px" }}>{active}</td>
                        <td style={{ padding: "12px" }}>{completed}</td>
                        <td style={{ padding: "12px" }}>
                          {currentOrder ? getStatus(currentOrder) : "No active order"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          {currentOrder?.trackingId ??
                            currentOrder?.trackingNumber ??
                            "—"}
                        </td>
                        <td style={{ padding: "12px", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                `Partner ID: ${partner.id ?? "—"}\n` +
                                  `Name: ${partner.name || "—"}\n` +
                                  `Email: ${partner.email || "—"}\n` +
                                  `Phone: ${partner.phone || "—"}\n` +
                                  `Vehicle Number: ${partner.vehicleNumber || "—"}\n` +
                                  `Vehicle Type: ${partner.vehicleType || "—"}`
                              )
                            }
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            style={{ marginLeft: "6px" }}
                            onClick={async () => {
                              const nextAvailable = !partner.available;

                              try {
                                const response = await fetch(
                                  `${API}/api/delivery-partners/${partner.id}/availability?available=${nextAvailable}`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      Authorization: "Bearer " + token,
                                    },
                                  }
                                );

                                if (response.ok) {
                                  await loadDeliveryPartners();
                                } else {
                                  alert("Could not update availability.");
                                }
                              } catch (error) {
                                console.error(error);
                                alert("Cannot connect to the backend.");
                              }
                            }}
                          >
                            Toggle Availability
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}





        </div>
      </section>
    )}




  </>
)}


        </div>

        <OrderTrackingModal />
      </div>
    );
  }

  // =========================================================
  // LOGIN / REGISTER
  // =========================================================

  return (
    <div className="app">
      <div className="login-container">

        <div className="logo">
          🏥
        </div>

        <h1>MEDILINK</h1>

        <p className="subtitle">
          Digital Healthcare Management System
        </p>

        <div className="form-container">

          <h2>
            {isForgotPassword
              ? "Forgot Password"
              : isRegister
              ? "Create Account"
              : "Welcome Back"}
          </h2>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword}>
              <div className="input-group">
                <label>Registered Email</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="login-button">
                📧 Send Reset Link
              </button>

              <div className="switch-text">
                Remembered your password?
                <button
                  type="button"
                  className="switch-button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setEmail("");
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleSubmit}>

            {isRegister && (
              <>
                <div className="input-group">
                  <label>Name</label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Age</label>

                  <input
                    type="number"
                    placeholder="Enter your age"
                    value={registrationAge}
                    onChange={(e) =>
                      setRegistrationAge(e.target.value)
                    }
                    min="18"
                    required
                  />

                  <small style={{ color: "#64748b" }}>
                    MEDILINK registration is for users aged 18 years or above.
                  </small>
                </div>
              </>
            )}

            <div className="input-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>

              <div className="password-input-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    type="button"
    className="password-toggle-button"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? "🙈" : "👁️"}
  </button>
</div>
<div className="forgot-password">
  {!isRegister && (
    <button
      type="button"
      onClick={() => {
        setIsForgotPassword(true);
        setPassword("");
      }}
    >
      Forgot Password?
    </button>
  )}
</div>
            </div>

            <button
              type="submit"
              className="login-button"
            >
              {isRegister
                ? "Register"
                : "Login"}
            </button>
          </form>
          )}

          {!isForgotPassword && (
          <div className="switch-text">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              className="switch-button"
              onClick={() =>
                setIsRegister(!isRegister)
              }
            type="button">
              {isRegister
                ? "Login"
                : "Register"}
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
