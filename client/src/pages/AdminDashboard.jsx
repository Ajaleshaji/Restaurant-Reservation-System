import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle, FaMapMarkerAlt, FaClock, FaChair, FaUser, FaPhone, FaCalendarTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("adminToken");

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
      const res = await axios.get("http://localhost:5000/api/auth/me", {
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

      const res = await axios.get("http://localhost:5000/api/restaurant/details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurant(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setMessage("Please add your restaurant details first...");
        setTimeout(() => navigate("/admin/restaurant-details"), 1500);
      } else {
        console.error("Error fetching details:", err);
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
        `http://localhost:5000/api/restaurant/remove-booking/${restaurant._id}/${selectedTable.number}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
      fetchRestaurant();
      setPopupVisible(false);
      setSelectedTable(null);
    } catch (err) {
      console.error("Error removing booking:", err);
      setMessage(err.response?.data?.message || "Failed to remove booking");
    }
  };

  useEffect(() => {
    fetchAdmin();
    fetchRestaurant();
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans relative">
      {/* LEFT PANEL */}
      <div className="w-1/4 bg-gradient-to-b from-[#153b50] to-[#1b5977] text-white p-8 rounded-r-3xl shadow-2xl flex flex-col items-center">
        {loading ? (
          <p className="mt-20 animate-pulse text-gray-300">Loading...</p>
        ) : restaurant ? (
          <div className="text-center w-full">
            <div className="w-24 h-24 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-5xl">
              <FaChair />
            </div>
            <h2 className="text-2xl font-semibold mb-4 truncate">
              {restaurant.restaurantName}
            </h2>

            <div className="bg-white/10 p-6 rounded-2xl text-left space-y-4 shadow-lg">
              <p className="flex items-center gap-2">
                <FaMapMarkerAlt /> {restaurant.location}
              </p>
              <p className="flex items-center gap-2">
                <FaClock /> {restaurant.openTime} - {restaurant.closeTime}
              </p>
              <p className="flex items-center gap-2">
                <FaChair /> Total Tables: {restaurant.availableTables}
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/restaurant-details")}
              className="mt-6 w-full py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              Edit Details
            </button>
          </div>
        ) : (
          <p className="text-gray-300 mt-20">No restaurant found.</p>
        )}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 p-10 overflow-y-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Restaurant Dashboard
          </h1>

          {/* Admin Profile */}
          <div className="relative">
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => setShowMenu(!showMenu)}
            >
              <FaUserCircle className="text-4xl text-gray-700" />
              <span className="text-lg font-semibold text-gray-800">
                {admin ? admin.name : "Admin"}
              </span>
            </div>

            {showMenu && (
              <div className="absolute right-0 mt-3 bg-white rounded-lg shadow-md w-48 py-2 z-50">
                <p className="px-4 py-2 text-gray-700 text-sm border-b">
                  {admin ? admin.email : "admin@gmail.com"}
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-blue-100 text-blue-800 rounded-md text-center font-medium shadow-sm">
            {message}
          </div>
        )}

        {/* TABLE STATUS */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Restaurant Tables
        </h1>

        {loading ? (
          <p>Loading tables...</p>
        ) : restaurant ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {restaurant.tables?.map((table) => (
              <div
                key={table.number}
                className={`p-5 rounded-2xl text-center shadow-xl transition-all duration-300 flex flex-col justify-center ${
                  table.isBooked ? "bg-red-200" : "bg-green-200"
                }`}
                style={{
                  minHeight: table.isBooked ? "180px" : "100px",
                  maxHeight: table.isBooked ? "240px" : "130px",
                }}
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  Table {table.number}
                </h3>

                {table.isBooked ? (
                  <div className="text-gray-700 text-sm space-y-1 overflow-hidden">
                    <p className="font-semibold">Booked By:</p>
                    <p className="flex items-center gap-2">
                      <FaUser /> {table.userName}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaPhone /> {table.userPhone}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaCalendarTimes /> {table.reservationTime}
                    </p>

                    <button
                      onClick={() => openRemovePopup(table)}
                      className="mt-3 w-full py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                    >
                      Remove Booking
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-700 text-base">Available</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No restaurant found.</p>
        )}
      </div>

      {/* ✅ Popup with Blur Background */}
      {popupVisible && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Remove Booking?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove booking for{" "}
              <strong>Table {selectedTable.number}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmRemoveBooking}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Yes, Remove
              </button>
              <button
                onClick={() => setPopupVisible(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
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
