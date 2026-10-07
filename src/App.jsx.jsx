import { useEffect, useState } from "react";
import PatientProfile from "./PatientProfile";
import AiHealthAssistant from "./AiHealthAssistant";
import OrderTrackingMap from "./OrderTrackingMap";
import PatientCareProducts from "./PatientCareProducts";
import "./App.css";
import NotificationBell from "./NotificationBell";
import DeliveryPartnerDashboard from "./DeliveryPartnerDashboard";

const API = "http://localhost:8080";

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
                onClick={placeCartOrders}
              type="button">
                🛒 Place All Orders
              </button>
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

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }

    return null;
  });

  const [medicines, setMedicines] = useState([]);
  const [healthcareProducts, setHealthcareProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);

  const [search, setSearch] = useState("");

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
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));

        setUser(data);
        setEmail("");
        setPassword("");

        alert(
          "Login successful!\n\nWelcome " +
            data.name +
            "\nRole: " +
            data.role
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

  const placeCartOrders = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const confirmOrder = window.confirm(
      "Place " +
        cartItemCount +
        " item(s)?\\n\\n" +
        "Items Subtotal: ₹" +
        cartTotal.toLocaleString("en-IN") +
        "\\nDelivery Charge: " +
        (deliveryCharge === 0
          ? "FREE"
          : "₹" + deliveryCharge.toLocaleString("en-IN")) +
        "\\nGrand Total: ₹" +
        cartGrandTotal.toLocaleString("en-IN") +
        "\\n\\nProceed with your order?"
    );

    if (!confirmOrder) return;

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

  const updateOrderStatus = async (order) => {
    let nextStatus = "";

    if (order.status === "PLACED") {
      nextStatus = "PROCESSING";
    } else if (order.status === "PROCESSING") {
      nextStatus = "DISPATCHED";
    } else if (order.status === "DISPATCHED") {
      nextStatus = "DELIVERED";
    } else {
      alert("This order cannot be changed.");
      return;
    }

    const confirmUpdate = window.confirm(
      "Change Order #" +
        order.id +
        " from " +
        order.status +
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

        loadAllOrders();
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMedicines([]);
    setOrders([]);
    setUsers([]);
    setPrescriptions([]);
    setCart([]);
    setTrackingOrder(null);

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

    if (
      user.role === "ADMIN" ||
      user.role === "PHARMACY"
    ) {
      loadAllOrders();
      loadAllPrescriptions();
    }

    if (user.role === "ADMIN") {
      loadUsers();
    }
  }, [user]);

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

  const OrdersSection = ({ adminView = false }) => {
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
            {orders.map((order) => {
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
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "18px",
                    boxShadow:
                      "0 5px 18px rgba(15, 23, 42, 0.07)",
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
                          {order.status === "PLACED" &&
                            "⚙️ Process Order"}
                          {order.status === "PROCESSING" &&
                            "🚚 Dispatch Order"}
                          {order.status === "DISPATCHED" &&
                            "🎉 Mark Delivered"}
                        </button>
                      ))}
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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
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

        <div className="stat-card stat-orders">
          <div className="stat-icon">📦</div>
          <div>
            <p>Total Orders</p>
            <h3>{totalOrders}</h3>
          </div>
        </div>

        <div className="stat-card stat-stock">
          <div className="stat-icon">📊</div>
          <div>
            <p>Total Stock</p>
            <h3>{totalStock}</h3>
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
  const AdminStats = () => {
    const totalUsers = users.length;
    const totalMedicines = medicines.length;
    const totalOrders = orders.length;

    const totalStock = medicines.reduce(
      (sum, medicine) => {
        const stock = Number(medicine.stock);
        return (
          sum +
          (Number.isFinite(stock) && stock > 0
            ? stock
            : 0)
        );
      },
      0
    );

    const totalOrderValue = orders.reduce(
      (sum, order) => {
        const value = Number(order.totalPrice);
        return (
          sum +
          (Number.isFinite(value) && value > 0
            ? value
            : 0)
        );
      },
      0
    );

    const lowStockMedicines = medicines.filter(
      (medicine) => {
        const stock = Number(medicine.stock);
        return (
          Number.isFinite(stock) &&
          stock > 0 &&
          stock <= 10
        );
      }
    ).length;

    return (
      <section className="admin-stats-section">
        <div className="section-title-row">
          <div>
            <h2>📊 Admin Overview</h2>
            <p className="stats-subtitle">
              Quick summary of MEDILINK system activity
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => {
              loadMedicines();
              loadAllOrders();
              loadUsers();
            }}
          type="button">
            🔄 Refresh Statistics
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card stat-users">
            <div className="stat-icon">👥</div>
            <div>
              <p>Total Users</p>
              <h3>{totalUsers}</h3>
            </div>
          </div>

          <div className="stat-card stat-medicines">
            <div className="stat-icon">💊</div>
            <div>
              <p>Total Medicines</p>
              <h3>{totalMedicines}</h3>
            </div>
          </div>

          <div className="stat-card stat-orders">
            <div className="stat-icon">🛒</div>
            <div>
              <p>Total Orders</p>
              <h3>{totalOrders}</h3>
            </div>
          </div>

          <div className="stat-card stat-stock">
            <div className="stat-icon">📦</div>
            <div>
              <p>Total Stock</p>
              <h3>{totalStock}</h3>
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

          <div className="stat-card stat-low-stock">
            <div className="stat-icon">⚠️</div>
            <div>
              <p>Low Stock Items</p>
              <h3>{lowStockMedicines}</h3>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // =========================================================
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

          {/* DELIVERY PARTNER */}
          {user.role === "DELIVERY_PARTNER" && (
            <DeliveryPartnerDashboard
              user={user}
              partnerId={1}
            />
          )}

          {/* PATIENT */}
          {user.role === "PATIENT" && (
            <>
             <PatientProfile />
             <AiHealthAssistant />

             <PatientCareProducts
  onAddToCart={addToCart}
  searchTerm={search}
/>

              <MedicineSection
                management={false}
              />

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

              <PrescriptionSection management={false} />

              <OrdersSection
                adminView={false}
              />
            </>
          )}

          {/* PHARMACY */}
          {user.role === "PHARMACY" && (
  <>
    <PharmacyStats />

    <PrescriptionSection management={true} />

    <MedicineSection management={true} />

    <OrdersSection adminView={true} />
  </>
)}
  

          {/* ADMIN */}
          {user.role === "ADMIN" && (
            <>
              <AdminStats />

              <MedicineSection
                management={true}
              />

              <UsersSection />

              <PrescriptionSection management={true} />

              <OrdersSection
                adminView={true}
              />
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
