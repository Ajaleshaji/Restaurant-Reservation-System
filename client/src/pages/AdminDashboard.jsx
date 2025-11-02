import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    alert("Logged out successfully.");
    navigate("/admin/login");
  };

  // ✅ Fetch admin info
  const fetchAdmin = async () => {
    try {
      const token = localStorage.getItem("adminToken");
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

  // ✅ Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem("adminToken");
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
          alert("Please add your restaurant details first.");
          navigate("/admin/restaurant-details");
        } else {
          console.error("Error fetching details:", err);
        }
      } finally {
        setLoading(false);
      }
    };

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
              🍽️
            </div>
            <h2 className="text-2xl font-semibold mb-4 truncate">
              {restaurant.restaurantName}
            </h2>

            <div className="bg-white/10 p-6 rounded-2xl text-left space-y-4 shadow-lg">
              <p>📍 {restaurant.location}</p>
              <p>🕒 {restaurant.openTime} - {restaurant.closeTime}</p>
              <p>🪑 Total Tables: {restaurant.availableTables}</p>
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
        {/* Top Header with Admin Info */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Restaurant Dashboard</h1>

          {/* Admin Profile Section */}
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

            {/* Dropdown Menu (Email + Logout) */}
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
                className={`p-6 rounded-2xl text-center shadow-xl transition-all duration-300 ${
                  table.isBooked ? "bg-red-200" : "bg-green-200"
                }`}
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  Table {table.number}
                </h3>
                {table.isBooked ? (
                  <div className="text-gray-700">
                    <p className="font-semibold mb-2">Booked By:</p>
                    <p>👤 {table.userName}</p>
                    <p>📞 {table.userPhone}</p>
                    <p>🕒 {table.reservationTime}</p>
                  </div>
                ) : (
                  <p className="text-gray-700">Available ✅</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No restaurant found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
