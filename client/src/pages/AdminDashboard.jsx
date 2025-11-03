import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle, FaMapMarkerAlt, FaClock, FaChair, FaUser, FaPhone, FaCalendarTimes, FaSignOutAlt, FaEdit, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// --- Color Constants based on existing gradient ---
// Primary Dark for main background/text
const PRIMARY_DARK = "#153b50";
// Primary Light for accents/buttons
const PRIMARY_LIGHT = "#1b5977";
// Accent for a pop of color (used sparingly for icons/highlights)
const ACCENT = "#facc15"; // Tailwind yellow-400

const AdminDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

  // ✅ Auto-Dismiss Message Logic
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setMessage("Logged out successfully. Redirecting...");
    setTimeout(() => navigate("/admin/login"), 1000);
  };

  // ✅ Fetch Admin Info
  const fetchAdmin = async () => {
    try {
      if (!token) {
        navigate("/admin/login");
        return;
      }
      const res = await axios.get("https://restaurant-reservation-system-fjmv.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmin(res.data);
    } catch (err) {
      console.error("Error fetching admin info:", err);
    }
  };

  // ✅ Fetch Restaurant Details
  const fetchRestaurant = async () => {
    try {
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const res = await axios.get("https://restaurant-reservation-system-fjmv.onrender.com/api/restaurant/details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurant(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage("Please add your restaurant details first...");
        setTimeout(() => navigate("/admin/restaurant-details"), 1500);
      } else {
        console.error("Error fetching details:", err);
        setError("Failed to load restaurant details.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open Confirmation Popup
  const openRemovePopup = (table) => {
    setSelectedTable(table);
    setPopupVisible(true);
  };

  // ✅ Confirm Remove Booking
  const confirmRemoveBooking = async () => {
    if (!selectedTable) return;
    try {
      const res = await axios.put(
        `https://restaurant-reservation-system-fjmv.onrender.com/api/restaurant/remove-booking/${restaurant._id}/${selectedTable.number}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
      setError("");
      fetchRestaurant();
      setPopupVisible(false);
      setSelectedTable(null);
    } catch (err) {
      console.error("Error removing booking:", err);
      setError(err.response?.data?.message || "Failed to remove booking");
      setMessage("");
    }
  };

  useEffect(() => {
    fetchAdmin();
    fetchRestaurant();
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans relative">
      {/* 🧭 LEFT PANEL (Sidebar) */}
      <div 
        className="w-[280px] bg-gradient-to-b from-[#153b50] to-[#1b5977] text-white p-6 shadow-xl flex flex-col sticky top-0 h-screen" 
      >
        <div className="text-center w-full mt-4 pb-8 border-b border-white/20">
            <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-yellow-300">
                <FaChair />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-white">
                ADMIN DASHBOARD
            </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto mt-6">
          {loading ? (
            <p className="mt-10 animate-pulse text-gray-300 flex items-center gap-2">
              <FaSpinner className="animate-spin" /> Loading...
            </p>
          ) : restaurant ? (
            <div className="w-full space-y-4">
              <h2 className="text-2xl font-extrabold mb-4 truncate text-white border-b pb-2 border-white/20 text-center">
                {restaurant.restaurantName}
              </h2>

              <div className="text-gray-200 space-y-3 px-2">
                <p className="flex items-center gap-3 text-sm font-medium">
                  <FaMapMarkerAlt className="text-lg text-yellow-300" /> {restaurant.location}
                </p>
                <p className="flex items-center gap-3 text-sm">
                  <FaClock className="text-lg text-yellow-300" /> **Hours:** {restaurant.openTime} - {restaurant.closeTime}
                </p>
                <p className="flex items-center gap-3 text-sm">
                  <FaChair className="text-lg text-yellow-300" /> **Total Tables:** <span className="font-bold text-base">{restaurant.availableTables}</span>
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/restaurant-details")}
                className="mt-6 w-full py-2 flex items-center justify-center gap-2 bg-yellow-400 text-gray-900 font-semibold rounded-md transition-colors duration-200 hover:bg-yellow-300"
              >
                <FaEdit /> Edit Details
              </button>
            </div>
          ) : (
            <p className="text-gray-300 mt-20 text-md">
              No restaurant found.
            </p>
          )}
        </div>
      </div>

      {/* 🚀 RIGHT PANEL (Main Content) */}
      <div className="flex-1 p-8 overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">
            Live Reservation Status
          </h1>

          {/* Admin Profile/Menu */}
          <div className="relative">
            <div
              className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="text-lg font-semibold text-gray-800 hidden sm:inline">
                {admin ? admin.name.split(' ')[0] : "Admin"}
              </span>
              <FaUserCircle className="text-4xl text-gray-700" /> 
            </div>

            {showMenu && (
              <div className="absolute right-0 mt-3 bg-white rounded-lg shadow-xl w-48 py-2 z-50 border border-gray-100">
                <p className="px-4 py-2 text-gray-600 text-sm border-b">
                  {admin ? admin.email : "admin@example.com"}
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 transition"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message and Error Alerts */}
        {(message || error) && (
          <div 
            className={`mb-8 p-4 rounded-lg font-medium transition-all duration-500 flex items-center justify-between shadow-sm ${
                message ? "bg-green-100 text-green-700 border border-green-300" : 
                        "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {message ? <FaCheckCircle className="text-xl" /> : <FaExclamationTriangle className="text-xl" />}
              <span>{message || error}</span>
            </div>
            <button onClick={() => { setMessage(""); setError(""); }} className="text-lg opacity-70 hover:opacity-100 transition">
                <FaTimes />
            </button>
          </div>
        )}

        {/* TABLE STATUS */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Table Overview
        </h2>

        {loading ? (
          <p className="text-lg text-gray-600 flex items-center gap-2">
            <FaSpinner className="animate-spin" /> Loading tables...
          </p>
        ) : restaurant && restaurant.tables?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {restaurant.tables.map((table) => (
              <div
                key={table.number}
                className={`p-5 rounded-lg border text-center shadow-sm transition-all duration-300 flex flex-col ${
                  table.isBooked 
                    ? "bg-white border-red-300 hover:shadow-md" 
                    : "bg-white border-green-300 hover:shadow-md"
                }`}
                style={{
                  minHeight: table.isBooked ? "200px" : "120px",
                }}
              >
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                    Table {table.number}
                </h3>

                {table.isBooked ? (
                  <div className="text-gray-700 text-sm space-y-1 flex-1 pt-1">
                    <p className="font-semibold text-red-600 mb-1">BOOKED</p>
                    <p className="flex items-center justify-center gap-2">
                      <FaUser className="text-red-500" /> {table.userName}
                    </p>
                    <p className="flex items-center justify-center gap-2">
                      <FaPhone className="text-red-500" /> {table.userPhone}
                    </p>
                    <p className="flex items-center justify-center gap-2 font-bold text-sm mt-1">
                      <FaClock className="text-red-500" /> {table.reservationTime}
                    </p>

                    <button
                      onClick={() => openRemovePopup(table)}
                      className="mt-4 w-full py-1.5 bg-red-500 text-white font-semibold rounded-md text-sm hover:bg-red-600 transition-colors"
                    >
                      <FaCalendarTimes className="inline mr-1" /> Remove Booking
                    </button>
                  </div>
                ) : (
                  <p className="text-green-600 text-lg font-bold flex-1 flex items-center justify-center">AVAILABLE</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-600 p-6 border border-gray-200 rounded-lg bg-white">
            No tables are currently configured for your restaurant.
          </p>
        )}
      </div>

      {/* Confirmation Popup (Minimal Modal) */}
      {popupVisible && selectedTable && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-[90%] max-w-md text-center border-t-4 border-red-500">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Confirm Removal
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to **remove the booking** for 
              <strong className="text-red-600"> Table {selectedTable.number}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmRemoveBooking}
                className="px-6 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setPopupVisible(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;