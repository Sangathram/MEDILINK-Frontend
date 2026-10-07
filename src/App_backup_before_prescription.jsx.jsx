import { useEffect, useState } from "react";
import "./App.css";

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

// =========================================================
// APP
// =========================================================

function App() {
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
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
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

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

  const addToCart = (medicine) => {
    const stock = Number(medicine.stock);

    if (!Number.isFinite(stock) || stock <= 0) {
      alert("This medicine is out of stock.");
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === medicine.id
      );

      if (existing) {
        if (existing.quantity >= stock) {
          alert("You cannot add more than the available stock.");
          return currentCart;
        }

        return currentCart.map((item) =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...medicine,
          quantity: 1,
        },
      ];
    });
  };

  const increaseCartQuantity = (medicineId) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.id !== medicineId) return item;

        const stock = Number(item.stock);

        if (item.quantity >= stock) {
          alert("Maximum available stock reached.");
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  };

  const decreaseCartQuantity = (medicineId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === medicineId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (medicineId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== medicineId)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * item.quantity,
    0
  );

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
        "Medicine Total: ₹" +
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
            medicineId: item.id,
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
          "\\nMedicine Total: ₹" +
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

    if (user.role === "PATIENT") {
      loadMyOrders();
    }

    if (
      user.role === "ADMIN" ||
      user.role === "PHARMACY"
    ) {
      loadAllOrders();
    }

    if (user.role === "ADMIN") {
      loadUsers();
    }
  }, [user]);

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
            >
              ➕ Add Medicine
            </button>
          )}
        </div>

        <div className="search-row">
          <input
            type="text"
            placeholder="Search medicine..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />

          <button
            className="primary-button"
            onClick={handleSearch}
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
                      >
                        ✏️ Update
                      </button>

                      <button
                        className="danger-button"
                        onClick={() =>
                          deleteMedicine(medicine)
                        }
                      >
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
                    >
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
                >
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
                >
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

  const CartSection = () => {
    return (
      <section className="section cart-section">
        <div className="section-title-row">
          <div>
            <h2>🛒 My Cart ({cartItemCount})</h2>
            <p className="cart-subtitle">
              Review your selected medicines before ordering.
            </p>
          </div>

          {cart.length > 0 && (
            <button
              className="danger-button"
              onClick={clearCart}
            >
              🗑️ Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>
              Add medicines from the list above to start
              your order.
            </p>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={item.id}
                >
                  <img
                    src={getMedicineImage(item.name)}
                    alt={item.name}
                    className="cart-item-image"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/medicine-images/default.jpg";
                    }}
                  />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>

                  <div className="quantity-controls">
                    <button
                      className="quantity-button"
                      onClick={() =>
                        decreaseCartQuantity(item.id)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      className="quantity-button"
                      onClick={() =>
                        increaseCartQuantity(item.id)
                      }
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
                    className="cart-remove-button"
                    onClick={() =>
                      removeFromCart(item.id)
                    }
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
                <span>Medicine Total</span>
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
              >
                🛒 Place All Orders
              </button>
            </div>
          </>
        )}
      </section>
    );
  };

  // =========================================================
  // ORDER TRACKING HELPERS
  // =========================================================

  const trackingSteps = [
    {
      status: "PLACED",
      title: "Order Placed",
      icon: "📝",
      description: "Your order has been received.",
    },
    {
      status: "PROCESSING",
      title: "Processing",
      icon: "⚙️",
      description: "Pharmacy is preparing your order.",
    },
    {
      status: "DISPATCHED",
      title: "Dispatched",
      icon: "🚚",
      description: "Your order has been dispatched.",
    },
    {
      status: "DELIVERED",
      title: "Delivered",
      icon: "🎉",
      description: "Your order has been delivered.",
    },
  ];

  const getTrackingIndex = (status) => {
    const index = trackingSteps.findIndex(
      (step) => step.status === status
    );

    return index >= 0 ? index : 0;
  };

  // =========================================================
  // TRACKING MODAL
  // =========================================================

  const OrderTrackingModal = () => {
    if (!trackingOrder) return null;

    const currentIndex = getTrackingIndex(
      trackingOrder.status
    );

    return (
      <div
        className="tracking-modal-overlay"
        onClick={() => setTrackingOrder(null)}
      >
        <div
          className="tracking-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="tracking-modal-header">
            <div>
              <h2>
                📦 Track Order #{trackingOrder.id}
              </h2>
              <p>
                Current status:{" "}
                <strong>
                  {trackingOrder.status}
                </strong>
              </p>
            </div>

            <button
              className="tracking-close-button"
              onClick={() => setTrackingOrder(null)}
            >
              ✕
            </button>
          </div>

          <div className="tracking-summary">
            <div>
              <span>Order ID</span>
              <strong>#{trackingOrder.id}</strong>
            </div>

            <div>
              <span>Quantity</span>
              <strong>
                {trackingOrder.quantity}
              </strong>
            </div>

            <div>
              <span>Total</span>
              <strong>
                ₹{trackingOrder.totalPrice}
              </strong>
            </div>

            <div>
              <span>Status</span>
              <strong className="tracking-current-status">
                {trackingOrder.status}
              </strong>
            </div>
          </div>

          <div className="tracking-timeline">
            {trackingSteps.map((step, index) => {
              const completed = index <= currentIndex;
              const isCurrent = index === currentIndex;

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
                    {completed
                      ? "✓"
                      : step.icon}
                  </div>

                  <div className="tracking-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
         <button
           className="tracking-refresh-button"
           onClick={() => window.location.reload()}
>
  🔄 Refresh Order Status
</button>
        </div>
      </div>
    );
  };

  // =========================================================
  // ORDERS SECTION
  // =========================================================

  const OrdersSection = ({ adminView = false }) => {
    return (
      <section className="section">
        <div className="section-title-row">
          <h2>
            📦 {adminView ? "Orders" : "My Orders"}
          </h2>

          <button
            className="primary-button"
            onClick={
              adminView
                ? loadAllOrders
                : loadMyOrders
            }
          >
            Refresh Orders
          </button>
        </div>

        {loadingOrders ? (
          <p className="center-text">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <p className="center-text">
            {adminView
              ? "No orders found."
              : "You have not placed any orders yet."}
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User ID</th>
                  <th>Medicine ID</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>Status</th>

                  {!adminView && (
                    <th>Tracking</th>
                  )}

                  {adminView && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.userId}</td>
                    <td>{order.medicineId}</td>
                    <td>{order.quantity}</td>
                    <td>₹{order.totalPrice}</td>
                    <td>
                      <strong>{order.status}</strong>
                    </td>

                    {!adminView && (
                      <td>
                        <button
                          className="primary-button track-order-button"
                          onClick={() =>
                            setTrackingOrder(order)
                          }
                        >
                          📦 Track Order
                        </button>
                      </td>
                    )}

                   {adminView && (
  <td>
    {order.status === "DELIVERED" ? (
      <span className="completed">
        🎉 Completed
      </span>
    ) : (
      <button
        className={`status-update-button status-${order.status.toLowerCase()}`}
        onClick={() => updateOrderStatus(order)}
      >
        {order.status === "PLACED" && "⚙️ Process Order"}
        {order.status === "PROCESSING" && "🚚 Dispatch Order"}
        {order.status === "DISPATCHED" && "🎉 Mark Delivered"}
      </button>
    )}
  </td>
)}
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
          >
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
        >
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
          >
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

            <button
              className="danger-button logout-button"
              onClick={logout}
            >
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

          {/* PATIENT */}
          {user.role === "PATIENT" && (
            <>
              <MedicineSection
                management={false}
              />

              <CartSection />

              <OrdersSection
                adminView={false}
              />
            </>
          )}

          {/* PHARMACY */}
          {user.role === "PHARMACY" && (
  <>
    <PharmacyStats />

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
            >
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
