import React, { useEffect, useState } from "react";

const API = "http://localhost:8080";

const LANGUAGE_OPTIONS = [
  "English",
  "Telugu",
  "Hindi"
];

export default function PatientProfile() {
  const token = localStorage.getItem("token");

  const [isOpen, setIsOpen] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    emergencyContact: "",
    languagesKnown: [],
    preferredLanguage: "",
    bloodGroup: "",
    healthConditions: "",
    allergies: "",
    currentMedications: ""
  });

  const [hasHealthProblem, setHasHealthProblem] = useState("NO");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [records, setRecords] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordType, setRecordType] =
    useState("MEDICAL_CERTIFICATE");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
    loadMedicalRecords();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `${API}/api/patient-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 204) {
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();

      const languages = data.languagesKnown
        ? data.languagesKnown
            .split(",")
            .map((language) => language.trim())
            .filter(Boolean)
        : [];

      setProfile({
        name: data.name || "",
        age: data.age || "",
        gender: data.gender || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        pinCode: data.pinCode || "",
        emergencyContact: data.emergencyContact || "",
        languagesKnown: languages,
        preferredLanguage: data.preferredLanguage || "",
        bloodGroup: data.bloodGroup || "",
        healthConditions: data.healthConditions || "",
        allergies: data.allergies || "",
        currentMedications: data.currentMedications || ""
      });

      if (
        data.healthConditions &&
        data.healthConditions.trim() !== ""
      ) {
        setHasHealthProblem("YES");
      } else {
        setHasHealthProblem("NO");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedicalRecords = async () => {
    try {
      const response = await fetch(
        `${API}/api/medical-records/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setRecords(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleLanguageChange = (language) => {
    setProfile((previous) => {
      const alreadySelected =
        previous.languagesKnown.includes(language);

      let updatedLanguages;

      if (alreadySelected) {
        updatedLanguages =
          previous.languagesKnown.filter(
            (item) => item !== language
          );
      } else {
        updatedLanguages = [
          ...previous.languagesKnown,
          language
        ];
      }

      return {
        ...previous,
        languagesKnown: updatedLanguages,
        preferredLanguage:
          updatedLanguages.includes(
            previous.preferredLanguage
          )
            ? previous.preferredLanguage
            : ""
      };
    });
  };

  const saveProfile = async () => {
    if (profile.languagesKnown.length === 0) {
      alert("Please select at least one language.");
      return;
    }

    if (!profile.preferredLanguage) {
      alert("Please select your primary language.");
      return;
    }

    if (
      !profile.languagesKnown.includes(
        profile.preferredLanguage
      )
    ) {
      alert(
        "Primary language must be one of your known languages."
      );
      return;
    }

    try {
      setSaving(true);

      const dataToSave = {
        ...profile,

        age: profile.age
          ? Number(profile.age)
          : null,

        languagesKnown:
          profile.languagesKnown.join(", "),

        healthConditions:
          hasHealthProblem === "YES"
            ? profile.healthConditions
            : ""
      };

      const response = await fetch(
        `${API}/api/patient-profile`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(dataToSave)
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Failed to save profile"
        );
      }

      alert(
        "Patient profile saved successfully."
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only PDF, JPG, JPEG and PNG files are allowed."
      );

      e.target.value = "";
      setSelectedFile(null);

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(
        "File size must be less than 10 MB."
      );

      e.target.value = "";
      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
  };

  const uploadMedicalRecord = async () => {
    if (!selectedFile) {
      alert(
        "Please select a medical record first."
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      formData.append(
        "recordType",
        recordType
      );

      const response = await fetch(
        `${API}/api/medical-records/upload`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`
          },

          body: formData
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Upload failed"
        );
      }

      alert(
        "Medical record uploaded successfully."
      );

      setSelectedFile(null);

      const fileInput =
        document.getElementById(
          "medical-record-file"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      await loadMedicalRecords();
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.card}>
        <p>Loading patient profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* PROFILE HEADER */}

      <div style={styles.profileHeader}>

        <div>
          <div style={styles.profileIcon}>
            👤
          </div>

          <div>
            <h2 style={styles.headerTitle}>
              Patient Profile
            </h2>

            <p style={styles.headerSubtitle}>
              Personal information, health details
              and medical records
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          style={styles.toggleButton}
        >
          {isOpen
            ? "▲ Hide Profile"
            : "▼ View / Edit Profile"}
        </button>

      </div>

      {isOpen && (
        <>

          {/* PERSONAL INFORMATION */}

          <div style={styles.card}>

            <h3 style={styles.sectionTitle}>
              👤 Personal Information
            </h3>

            <div style={styles.grid}>

              <Input
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

              <Input
                label="Age"
                name="age"
                type="number"
                min="18"
                value={profile.age}
                onChange={handleChange}
                placeholder="Enter age"
              />

              <Select
                label="Gender"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                options={[
                  "Male",
                  "Female",
                  "Other",
                  "Prefer not to say"
                ]}
              />

              <Input
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter email"
              />

              <Input
                label="Emergency Contact"
                name="emergencyContact"
                value={profile.emergencyContact}
                onChange={handleChange}
                placeholder="Emergency contact number"
              />

            </div>

            {/* LANGUAGES */}

            <h4 style={styles.subHeading}>
              🌐 Languages Known
            </h4>

            <p style={styles.helperText}>
              Select all languages you can understand
              and communicate in.
            </p>

            <div style={styles.languageGroup}>

              {LANGUAGE_OPTIONS.map(
                (language) => (

                  <label
                    key={language}
                    style={styles.languageOption}
                  >

                    <input
                      type="checkbox"
                      checked={profile.languagesKnown.includes(
                        language
                      )}
                      onChange={() =>
                        handleLanguageChange(
                          language
                        )
                      }
                    />

                    <span>
                      {language}
                    </span>

                  </label>

                )
              )}

            </div>

            {/* PRIMARY LANGUAGE */}

            <div style={styles.primaryLanguageBox}>

              <label style={styles.label}>
                🗣️ Primary Language for AI Assistant
              </label>

              <select
                name="preferredLanguage"
                value={
                  profile.preferredLanguage
                }
                onChange={handleChange}
                style={styles.input}
              >

                <option value="">
                  Select primary language
                </option>

                {LANGUAGE_OPTIONS
                  .filter((language) =>
                    profile.languagesKnown.includes(
                      language
                    )
                  )
                  .map((language) => (

                    <option
                      key={language}
                      value={language}
                    >
                      {language}
                    </option>

                  ))}

              </select>

            </div>

            {/* BLOOD GROUP */}

            <div style={styles.singleField}>

              <Select
                label="Blood Group"
                name="bloodGroup"
                value={profile.bloodGroup}
                onChange={handleChange}
                options={[
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-"
                ]}
              />

            </div>

          </div>

          {/* ADDRESS */}

          <div style={styles.card}>

            <h3 style={styles.sectionTitle}>
              📍 Delivery Address
            </h3>

            <div style={styles.grid}>

              <Input
                label="Address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="House / Street / Area"
              />

              <Input
                label="City"
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="Enter city"
              />

              <Input
                label="State"
                name="state"
                value={profile.state}
                onChange={handleChange}
                placeholder="Enter state"
              />

              <Input
                label="PIN Code"
                name="pinCode"
                value={profile.pinCode}
                onChange={handleChange}
                placeholder="Enter PIN code"
              />

            </div>

          </div>

          {/* HEALTH INFORMATION */}

          <div style={styles.card}>

            <h3 style={styles.sectionTitle}>
              ❤️ Health Information
            </h3>

            <div style={styles.healthQuestion}>

              <strong>
                Do you have any existing/common
                health problems?
              </strong>

              <div style={styles.radioGroup}>

                <label>
                  <input
                    type="radio"
                    name="healthProblem"
                    value="NO"
                    checked={
                      hasHealthProblem === "NO"
                    }
                    onChange={(e) =>
                      setHasHealthProblem(
                        e.target.value
                      )
                    }
                  />
                  {" "}No
                </label>

                <label>
                  <input
                    type="radio"
                    name="healthProblem"
                    value="YES"
                    checked={
                      hasHealthProblem === "YES"
                    }
                    onChange={(e) =>
                      setHasHealthProblem(
                        e.target.value
                      )
                    }
                  />
                  {" "}Yes
                </label>

              </div>

            </div>

            {hasHealthProblem === "YES" && (

              <div style={styles.healthBox}>

                <Input
                  label="Existing Health Conditions"
                  name="healthConditions"
                  value={
                    profile.healthConditions
                  }
                  onChange={handleChange}
                  placeholder="Example: Diabetes, BP, Asthma..."
                />

                <Input
                  label="Allergies"
                  name="allergies"
                  value={profile.allergies}
                  onChange={handleChange}
                  placeholder="Enter known allergies"
                />

                <Input
                  label="Current Medications"
                  name="currentMedications"
                  value={
                    profile.currentMedications
                  }
                  onChange={handleChange}
                  placeholder="Enter medicines currently taking"
                />

              </div>

            )}

            <button
              onClick={saveProfile}
              disabled={saving}
              style={styles.primaryButton}
            >
              {saving
                ? "Saving..."
                : "💾 Save Profile"}
            </button>

          </div>

          {/* MEDICAL RECORDS */}

          <div style={styles.card}>

            <h3 style={styles.sectionTitle}>
              📄 Medical Certificates & Records
            </h3>

            <p style={styles.subtitle}>
              Upload medical certificates or health
              records for use as patient context by
              the MEDILINK health assistant.
            </p>

            <div style={styles.uploadBox}>

              <label style={styles.label}>
                Record Type
              </label>

              <select
                value={recordType}
                onChange={(e) =>
                  setRecordType(
                    e.target.value
                  )
                }
                style={styles.input}
              >

                <option value="MEDICAL_CERTIFICATE">
                  Medical Certificate
                </option>

                <option value="PRESCRIPTION">
                  Prescription
                </option>

                <option value="LAB_REPORT">
                  Lab Report
                </option>

                <option value="SCAN_REPORT">
                  Scan / Imaging Report
                </option>

                <option value="OTHER">
                  Other Medical Record
                </option>

              </select>

              <label style={styles.label}>
                Select File
              </label>

              <input
                id="medical-record-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={styles.fileInput}
              />

              {selectedFile && (
                <p style={styles.selectedFile}>
                  Selected: {selectedFile.name}
                </p>
              )}

              <p style={styles.fileInfo}>
                Allowed: PDF, JPG, JPEG, PNG |
                Maximum: 10 MB
              </p>

              <button
                onClick={uploadMedicalRecord}
                disabled={
                  uploading ||
                  !selectedFile
                }
                style={styles.primaryButton}
              >
                {uploading
                  ? "Uploading..."
                  : "📤 Upload Medical Record"}
              </button>

            </div>

            <h3 style={styles.sectionTitle}>
              Uploaded Records
            </h3>

            {records.length === 0 ? (

              <p style={styles.empty}>
                No medical records uploaded yet.
              </p>

            ) : (

              <div style={styles.recordsList}>

                {records.map((record) => (

                  <div
                    key={record.id}
                    style={styles.recordItem}
                  >

                    <strong>
                      📄 {record.fileName}
                    </strong>

                    <p style={styles.recordDetails}>
                      Type:{" "}
                      {record.recordType ||
                        "Medical Record"}
                    </p>

                    <p style={styles.recordDetails}>
                      Uploaded:{" "}
                      {record.uploadedAt
                        ? new Date(
                            record.uploadedAt
                          ).toLocaleString()
                        : "Unknown"}
                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>

        </>
      )}

    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  min
}) {
  return (
    <div>

      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        style={styles.input}
      />

    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options
}) {
  return (
    <div>

      <label style={styles.label}>
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        style={styles.input}
      >

        <option value="">
          Select {label}
        </option>

        {options.map((option) => (

          <option
            key={option}
            value={option}
          >
            {option}
          </option>

        ))}

      </select>

    </div>
  );
}

const styles = {

  container: {
    display: "grid",
    gap: "15px",
    marginBottom: "25px"
  },

  profileHeader: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px 24px",
    boxShadow:
      "0 3px 15px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap"
  },

  profileIcon: {
    fontSize: "30px",
    display: "inline-block",
    marginRight: "12px",
    verticalAlign: "middle"
  },

  headerTitle: {
    display: "inline-block",
    margin: 0,
    verticalAlign: "middle"
  },

  headerSubtitle: {
    margin: "6px 0 0 44px",
    color: "#666",
    fontSize: "14px"
  },

  toggleButton: {
    border: "none",
    borderRadius: "9px",
    padding: "12px 20px",
    background: "#1976d2",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px"
  },

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "22px",
    boxShadow:
      "0 3px 15px rgba(0,0,0,0.08)"
  },

  sectionTitle: {
    marginTop: 0,
    marginBottom: "16px",
    borderBottom: "1px solid #eee",
    paddingBottom: "9px"
  },

  subHeading: {
    marginTop: "22px",
    marginBottom: "5px"
  },

  helperText: {
    color: "#666",
    fontSize: "13px",
    marginTop: "0"
  },

  subtitle: {
    color: "#666",
    marginBottom: "18px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px"
  },

  singleField: {
    marginTop: "18px",
    maxWidth: "300px"
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "6px"
  },

  input: {
    width: "100%",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "14px",
    background: "#fff"
  },

  languageGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "12px"
  },

  languageOption: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 15px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#f8fafc",
    cursor: "pointer"
  },

  primaryLanguageBox: {
    marginTop: "18px",
    maxWidth: "350px"
  },

  healthQuestion: {
    padding: "15px",
    background: "#f7f9fc",
    borderRadius: "10px"
  },

  radioGroup: {
    display: "flex",
    gap: "25px",
    marginTop: "12px"
  },

  healthBox: {
    display: "grid",
    gap: "15px",
    marginTop: "15px",
    padding: "15px",
    background: "#fafafa",
    borderRadius: "10px"
  },

  primaryButton: {
    marginTop: "18px",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#1976d2",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer"
  },

  uploadBox: {
    padding: "20px",
    background: "#f7f9fc",
    borderRadius: "10px"
  },

  fileInput: {
    width: "100%",
    marginTop: "5px"
  },

  selectedFile: {
    marginTop: "10px",
    fontWeight: "600"
  },

  fileInfo: {
    fontSize: "13px",
    color: "#666"
  },

  empty: {
    color: "#777"
  },

  recordsList: {
    display: "grid",
    gap: "10px"
  },

  recordItem: {
    padding: "14px",
    border: "1px solid #ddd",
    borderRadius: "9px",
    background: "#fafafa"
  },

  recordDetails: {
    margin: "5px 0 0",
    color: "#666",
    fontSize: "13px"
  }
};