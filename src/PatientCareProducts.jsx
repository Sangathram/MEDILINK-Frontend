import React, { useEffect, useMemo, useRef, useState } from "react";

const API_URL = "http://localhost:8080/api/healthcare-products";

const categories = [
  { key: "ALL", label: "🛍️ All Products" },
  { key: "BANDAGE", label: "🩹 Bandages" },
  { key: "FIRST_AID", label: "🧰 First Aid" },
  { key: "FRUITS", label: "🍎 Fruits" },
  { key: "ENERGY_DRINK", label: "⚡ Energy Drinks" },
  { key: "HYDRATION", label: "💧 Hydration" },
];

/*
 * Realistic selling-unit information.
 *
 * IMPORTANT:
 * The backend can continue returning the existing product data.
 * These values are applied on the frontend so we do not need
 * to change the database just for displaying units.
 */
const PRODUCT_INFO = {
  banana: {
    price: 6,
    unit: "piece",
    unitShort: "piece",
    weight: "Approx. 100–120 g each",
    plural: "bananas",
    icon: "🍌",
  },

  bananas: {
    price: 6,
    unit: "piece",
    unitShort: "piece",
    weight: "Approx. 100–120 g each",
    plural: "bananas",
    icon: "🍌",
  },

  apple: {
    price: 25,
    unit: "piece",
    unitShort: "piece",
    weight: "Approx. 150–200 g each",
    plural: "apples",
    icon: "🍎",
  },

  apples: {
    price: 25,
    unit: "piece",
    unitShort: "piece",
    weight: "Approx. 150–200 g each",
    plural: "apples",
    icon: "🍎",
  },

  orange: {
    price: 15,
    unit: "piece",
    unitShort: "piece",
    weight: "Approx. 130–170 g each",
    plural: "oranges",
    icon: "🍊",
  },

  oranges: {
    price: 15,
    unit: "piece",
    unitShort: "piece",
    weight: "Approx. 130–170 g each",
    plural: "oranges",
    icon: "🍊",
  },

  pomegranate: {
    price: 40,
    unit: "piece",
    unitShort: "piece",
    weight: "Approx. 200–250 g each",
    plural: "pomegranates",
    icon: "❤️",
  },

  pomegranates: {
    price: 40,
    unit: "piece",
    unitShort: "piece",
    weight: "Approx. 200–250 g each",
    plural: "pomegranates",
    icon: "❤️",
  },

  "adhesive bandage": {
    unit: "pack",
    unitShort: "pack",
    weight: "10 pieces per pack",
    icon: "🩹",
  },

  "elastic bandage": {
    unit: "roll",
    unitShort: "roll",
    weight: "1 roll",
    icon: "🩹",
  },

  "sterile gauze": {
    unit: "pack",
    unitShort: "pack",
    weight: "5 sterile pads per pack",
    icon: "🧻",
  },

  "medical tape": {
    unit: "roll",
    unitShort: "roll",
    weight: "1 roll",
    icon: "🩹",
  },

  "energy drink": {
    unit: "bottle",
    unitShort: "bottle",
    weight: "250 ml bottle",
    icon: "⚡",
  },

  ors: {
    unit: "sachet",
    unitShort: "sachet",
    weight: "1 sachet",
    icon: "💧",
  },

  "coconut water": {
    unit: "pack",
    unitShort: "pack",
    weight: "200 ml pack",
    icon: "🥥",
  },
};

const getNameKey = (name) =>
  String(name || "")
    .toLowerCase()
    .trim();

const getProductInfo = (product) => {
  const name = getNameKey(product.name);

  if (PRODUCT_INFO[name]) {
    return PRODUCT_INFO[name];
  }

  // Partial matching for names such as "Fresh Bananas"
  const matchedKey = Object.keys(PRODUCT_INFO).find((key) =>
    name.includes(key)
  );

  return (
    PRODUCT_INFO[matchedKey] || {
      unit: "unit",
      unitShort: "unit",
      weight: "Standard pack/unit",
      icon: "🩺",
    }
  );
};

const getRealPrice = (product) => {
  const info = getProductInfo(product);

  if (Number.isFinite(Number(info.price))) {
    return Number(info.price);
  }

  return Number(product.price || 0);
};

function PatientCareProducts({
  onAddToCart,
  searchTerm = "",
  onProductResults,
}) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiQuantity, setAiQuantity] = useState(1);
  const [aiSelectedProduct, setAiSelectedProduct] = useState("");
  const productCardRefs = useRef({});

  /*
   * Local search inside Patient Care.
   * This also allows App.jsx / AI Assistant to pass a search term.
   */
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  /*
   * AI PRODUCT NAVIGATION
   *
   * AiHealthAssistant dispatches the "medilink-product-search"
   * event when the patient types or speaks a product name.
   *
   * Example:
   * "banana" -> search Banana -> scroll to Banana -> highlight it
   */
  useEffect(() => {
    const handleAiProductSearch = (event) => {
      const detail = event.detail || {};
      const query = String(detail.query || "").trim();

      if (!query) {
        return;
      }

      const quantity =
        Number(detail.quantity) > 0
          ? Number(detail.quantity)
          : 1;

      setLocalSearch(query);
      setAiQuantity(quantity);
      setAiSelectedProduct(query);

      /*
       * Wait for React to apply the search filter,
       * then find the matching visible card.
       */
      setTimeout(() => {
        const cards = document.querySelectorAll(
          ".patient-care-card"
        );

        let matchingCard = null;

        cards.forEach((card) => {
          const name =
            card.querySelector("h3")?.textContent?.toLowerCase() || "";

          if (
            !matchingCard &&
            name.includes(query.toLowerCase())
          ) {
            matchingCard = card;
          }
        });

        if (matchingCard) {
          matchingCard.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          matchingCard.classList.add(
            "ai-product-highlight"
          );

          setTimeout(() => {
            matchingCard.classList.remove(
              "ai-product-highlight"
            );
          }, 3500);
        }
      }, 300);
    };

    window.addEventListener(
      "medilink-product-search",
      handleAiProductSearch
    );

    return () => {
      window.removeEventListener(
        "medilink-product-search",
        handleAiProductSearch
      );
    };
  }, []);

  useEffect(() => {
    setLocalSearch(searchTerm || "");
  }, [searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load healthcare products");
      }

      const data = await response.json();

      const normalizedData = (data || []).map((product) => {
        const info = getProductInfo(product);

        return {
          ...product,

          // HEALTHCARE marker used by the existing cart logic
          productType: "HEALTHCARE",

          healthcareProductId: product.id,

          // Realistic frontend selling price
          price: getRealPrice(product),

          unit: info.unit,
          unitShort: info.unitShort,
          weight: info.weight,
          productIcon: info.icon,
        };
      });

      setProducts(normalizedData);
    } catch (err) {
      console.error(err);
      setError("Unable to load Patient Care & Wellness products.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Search matches:
   * name
   * category
   * description
   * unit
   */
  const filteredProducts = useMemo(() => {
    let result =
      selectedCategory === "ALL"
        ? products
        : products.filter(
            (product) =>
              product.category?.toUpperCase() === selectedCategory
          );

    const query = String(localSearch || "")
      .trim()
      .toLowerCase();

    if (!query) {
      return result;
    }

    /*
     * Common English words.
     */
    const aliases = {
      banana: ["banana", "bananas"],
      bananas: ["banana", "bananas"],
      apple: ["apple", "apples"],
      apples: ["apple", "apples"],
      orange: ["orange", "oranges"],
      oranges: ["orange", "oranges"],
      pomegranate: ["pomegranate", "pomegranates"],
      bandage: ["bandage", "bandages"],
      firstaid: ["first aid", "firstaid"],
      "first aid": ["first aid", "firstaid"],
      drink: ["drink", "energy"],
      "energy drink": ["energy", "drink"],
      ors: ["ors"],
      coconut: ["coconut", "coconut water"],
      water: ["water", "hydration", "coconut"],
    };

    const searchWords = query
      .split(/\s+/)
      .filter(Boolean);

    return result.filter((product) => {
      const searchableText = [
        product.name,
        product.category,
        product.description,
        product.unit,
        product.weight,
      ]
        .join(" ")
        .toLowerCase();

      return searchWords.some((word) => {
        const aliasWords = aliases[word] || [word];

        return aliasWords.some((alias) =>
          searchableText.includes(alias)
        );
      });
    });
  }, [
    products,
    selectedCategory,
    localSearch,
  ]);

  /*
   * Tell parent how many products matched.
   * This is useful later for connecting AI voice/text to the
   * Patient Care section.
   */
  useEffect(() => {
    if (onProductResults) {
      onProductResults(filteredProducts);
    }
  }, [filteredProducts, onProductResults]);

  const getCategoryLabel = (category) => {
    const found = categories.find(
      (item) => item.key === category
    );

    return found ? found.label : category;
  };

  const getProductImage = (product) => {
    if (!product.image) {
      return "/medicine-images/default.jpg";
    }

    return `/healthcare-image/${product.image}`;
  };

  const handleImageError = (event) => {
    event.currentTarget.src =
      "/medicine-images/default.jpg";
  };

  const handleAddToCart = (product) => {
    if (!product.available || product.stock <= 0) {
      alert("This product is currently out of stock.");
      return;
    }

    if (onAddToCart) {
      onAddToCart({
        ...product,
        productType: "HEALTHCARE",
        healthcareProductId: product.id,
        medicineId: null,
        price: getRealPrice(product),
        quantity: 1,
      });
    } else {
      alert(`${product.name} selected.`);
    }
  };

  const clearSearch = () => {
    setLocalSearch("");
  };

  return (
    <section className="patient-care-section">

      {/* HEADER */}
      <div className="patient-care-header">
        <div>
          <h2>🩺 Patient Care & Wellness</h2>

          <p>
            Everyday healthcare, first-aid, fruits and
            wellness essentials available through MEDILINK.
          </p>
        </div>

        <button
          type="button"
          className="patient-care-refresh"
          onClick={loadProducts}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {/* SEARCH */}
      <div className="patient-care-search-box">

        <span className="search-icon">
          🔎
        </span>

        <input
          type="text"
          value={localSearch}
          onChange={(event) =>
            setLocalSearch(event.target.value)
          }
          placeholder="Search bananas, apples, bandages, ORS..."
        />

        {localSearch && (
          <button
            type="button"
            className="clear-search-button"
            onClick={clearSearch}
          >
            ✕
          </button>
        )}
      </div>

      {/* SEARCH RESULT */}
      {localSearch.trim() && !loading && (
        <div className="care-search-result">
          🔎 Showing results for:
          <strong>
            {" "}{localSearch}
          </strong>
        </div>
      )}

      {/* CATEGORY FILTER */}
      <div className="patient-care-categories">
        {categories.map((category) => (
          <button
            type="button"
            key={category.key}
            className={
              selectedCategory === category.key
                ? "care-category active"
                : "care-category"
            }
            onClick={() =>
              setSelectedCategory(category.key)
            }
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="patient-care-message">
          <div className="care-spinner"></div>
          <p>
            Loading Patient Care products...
          </p>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="patient-care-error">
          <p>⚠️ {error}</p>

          <button
            type="button"
            onClick={loadProducts}
          >
            Try Again
          </button>
        </div>
      )}

      {/* PRODUCTS */}
      {!loading && !error && (
        <>
          <div className="patient-care-result-info">
            <span>
              Showing{" "}
              <strong>
                {filteredProducts.length}
              </strong>{" "}
              product
              {filteredProducts.length !== 1
                ? "s"
                : ""}
            </span>

            {selectedCategory !== "ALL" && (
              <span>
                Category:{" "}
                <strong>
                  {getCategoryLabel(
                    selectedCategory
                  )}
                </strong>
              </span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="patient-care-message">
              <div className="care-empty-icon">
                🔎
              </div>

              <h3>
                No matching products found
              </h3>

              <p>
                Try banana, apple, bandage,
                ORS or another product.
              </p>
            </div>
          ) : (
            <div className="patient-care-grid">

              {filteredProducts.map((product) => {

                const outOfStock =
                  !product.available ||
                  product.stock <= 0;

                const info =
                  getProductInfo(product);

                const realPrice =
                  getRealPrice(product);

                return (
                  <div
                    className="patient-care-card"
                    key={product.id}
                  >

                    {/* IMAGE */}
                    <div className="patient-care-image-wrapper">

                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="patient-care-image"
                        onError={handleImageError}
                      />

                      <span
                        className={
                          outOfStock
                            ? "care-stock-badge out"
                            : "care-stock-badge"
                        }
                      >
                        {outOfStock
                          ? "Out of Stock"
                          : `${product.stock} ${info.unitShort}${product.stock > 1 ? "s" : ""} available`}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <div className="patient-care-content">

                      <span className="care-product-category">
                        {getCategoryLabel(
                          product.category
                        )}
                      </span>

                      <h3>
                        {info.icon}{" "}
                        {product.name}
                      </h3>

                      <p className="care-product-description">
                        {product.description ||
                          "Quality patient-care and wellness product."}
                      </p>

                      {/* UNIT + WEIGHT */}
                      <div className="care-product-info">

                        <div className="care-info-row">
                          <span>
                            📦 Selling unit
                          </span>

                          <strong>
                            1 {info.unitShort}
                          </strong>
                        </div>

                        <div className="care-info-row">
                          <span>
                            ⚖️ Weight / Size
                          </span>

                          <strong>
                            {info.weight}
                          </strong>
                        </div>

                      </div>

                      {/* PRICE */}
                      <div className="care-price-area">

                        <div>
                          <div className="care-price">
                            ₹
                            {realPrice.toFixed(2)}
                          </div>

                          <div className="care-price-unit">
                            per{" "}
                            {info.unitShort}
                          </div>
                        </div>

                      </div>

                      {/* BANANA EXAMPLE */}
                      {getNameKey(
                        product.name
                      ).includes("banana") && (
                        <div className="dozen-example">
                          🍌 <strong>1 dozen = 12 bananas</strong>
                          <br />
                          ₹6 × 12 = ₹72
                        </div>
                      )}

                      {/* ADD BUTTON */}
                      <button
                        type="button"
                        className="care-add-button"
                        disabled={outOfStock}
                        onClick={() =>
                          handleAddToCart(product)
                        }
                      >
                        {outOfStock
                          ? "Out of Stock"
                          : `🛒 Add 1 ${info.unitShort}`}
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* INFORMATION */}
      <div className="patient-care-note">
        <strong>
          ℹ️ Wellness information:
        </strong>

        <span>
          Product prices and quantities are shown
          using practical selling units. Weight values
          are approximate and may vary slightly.
          These products support general patient care,
          first-aid and wellness and do not replace
          professional medical diagnosis or treatment.
        </span>
      </div>

      {/* STYLES */}
      <style>{`

        .patient-care-section {
          margin-top: 30px;
          padding: 28px;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .patient-care-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 18px;
        }

        .patient-care-header h2 {
          margin: 0 0 8px;
          font-size: 26px;
          color: #0f172a;
        }

        .patient-care-header p {
          margin: 0;
          color: #64748b;
          font-size: 14px;
        }

        .patient-care-refresh {
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          background: #0f766e;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .patient-care-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* SEARCH */

        .patient-care-search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          border: 2px solid #cbd5e1;
          border-radius: 13px;
          padding: 5px 10px;
          margin-bottom: 12px;
          transition: 0.2s;
        }

        .patient-care-search-box:focus-within {
          border-color: #0f766e;
          box-shadow: 0 0 0 3px rgba(15,118,110,0.1);
        }

        .search-icon {
          font-size: 20px;
        }

        .patient-care-search-box input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 11px 5px;
          font-size: 15px;
          color: #0f172a;
        }

        .patient-care-search-box input::placeholder {
          color: #94a3b8;
        }

        .clear-search-button {
          border: none;
          background: #f1f5f9;
          color: #475569;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-weight: bold;
        }

        .care-search-result {
          padding: 10px 14px;
          margin-bottom: 15px;
          border-radius: 10px;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 13px;
        }

        /* CATEGORIES */

        .patient-care-categories {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .care-category {
          border: 1px solid #cbd5e1;
          background: white;
          color: #334155;
          border-radius: 999px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s;
        }

        .care-category:hover {
          border-color: #0f766e;
          transform: translateY(-1px);
        }

        .care-category.active {
          background: #0f766e;
          color: white;
          border-color: #0f766e;
        }

        /* RESULT */

        .patient-care-result-info {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 18px;
          color: #64748b;
          font-size: 14px;
        }

        /* GRID */

        .patient-care-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        /* CARD */

        .patient-care-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.06);
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .patient-care-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 10px 24px
            rgba(15, 23, 42, 0.12);
        }

        /* IMAGE */

        .patient-care-image-wrapper {
          height: 210px;
          background: #f1f5f9;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .patient-care-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 14px;
          box-sizing: border-box;
        }

        .care-stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #dcfce7;
          color: #166534;
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .care-stock-badge.out {
          background: #fee2e2;
          color: #991b1b;
        }

        /* CONTENT */

        .patient-care-content {
          padding: 18px;
        }

        .care-product-category {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: #0f766e;
          background: #ccfbf1;
          border-radius: 999px;
          padding: 5px 9px;
          margin-bottom: 9px;
        }

        .patient-care-content h3 {
          margin: 0 0 8px;
          font-size: 18px;
          color: #0f172a;
        }

        .care-product-description {
          min-height: 42px;
          margin: 0 0 13px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        /* PRODUCT INFO */

        .care-product-info {
          padding: 10px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          margin-bottom: 13px;
        }

        .care-info-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin: 5px 0;
          font-size: 12px;
        }

        .care-info-row span {
          color: #64748b;
        }

        .care-info-row strong {
          color: #334155;
          text-align: right;
        }

        /* PRICE */

        .care-price-area {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .care-price {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
        }

        .care-price-unit {
          font-size: 12px;
          color: #64748b;
          margin-top: 1px;
        }

        /* DOZEN */

        .dozen-example {
          padding: 9px 10px;
          margin-bottom: 12px;
          border-radius: 9px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          font-size: 12px;
          line-height: 1.5;
        }

        /* ADD */

        .care-add-button {
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 11px 13px;
          background: #0f766e;
          color: white;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
        }

        .care-add-button:hover {
          background: #115e59;
        }

        .care-add-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        /* LOADING */

        .patient-care-message {
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #64748b;
          text-align: center;
        }

        .care-spinner {
          width: 32px;
          height: 32px;
          border: 4px solid #cbd5e1;
          border-top-color: #0f766e;
          border-radius: 50%;
          animation:
            careSpin 0.8s linear infinite;
          margin-bottom: 12px;
        }

        @keyframes careSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .care-empty-icon {
          font-size: 42px;
          margin-bottom: 8px;
        }

        /* ERROR */

        .patient-care-error {
          text-align: center;
          padding: 30px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 14px;
          color: #991b1b;
        }

        .patient-care-error button {
          margin-top: 10px;
          border: none;
          border-radius: 8px;
          padding: 9px 15px;
          background: #991b1b;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        /* NOTE */

        .patient-care-note {
          margin-top: 24px;
          padding: 14px 16px;
          border-radius: 12px;
          background: #ecfeff;
          border: 1px solid #bae6fd;
          color: #164e63;
          font-size: 12px;
          line-height: 1.5;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        /* AI PRODUCT HIGHLIGHT */

        .ai-product-highlight {
          animation: aiProductHighlight 3.5s ease;
          transform: translateY(-5px);
          box-shadow:
            0 0 0 4px rgba(13, 148, 136, 0.25),
            0 15px 35px rgba(13, 148, 136, 0.25);
        }

        @keyframes aiProductHighlight {
          0% {
            transform: scale(1.02);
            box-shadow:
              0 0 0 5px rgba(13, 148, 136, 0.35),
              0 15px 35px rgba(13, 148, 136, 0.3);
          }

          50% {
            transform: scale(1.01);
          }

          100% {
            transform: scale(1);
          }
        }

        /* RESPONSIVE */

        @media (max-width: 1000px) {
          .patient-care-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .patient-care-section {
            padding: 18px;
          }

          .patient-care-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .patient-care-grid {
            grid-template-columns: 1fr;
          }

          .patient-care-image-wrapper {
            height: 230px;
          }
        }

      `}</style>
    </section>
  );
}

export default PatientCareProducts;