import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    alert("Logged out successfully.");
    navigate("/admin/login");
  };

  // Fetch restaurant details
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
    fetchRestaurant();
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      {/* LEFT PANEL — RESTAURANT INFO */}
      <div className="w-1/4 bg-gradient-to-b from-[#153b50] to-[#1b5977] text-white p-8 rounded-r-3xl shadow-2xl flex flex-col items-center">
        {loading ? (
          <p className="mt-20 animate-pulse text-gray-300">Loading...</p>
        ) : restaurant ? (
          <div className="text-center w-full">
            <div className="w-24 h-24 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-5xl">
              🍽️
            </div>
            <h2 className="text-2xl font-semibold mb-4 truncate">{restaurant.restaurantName}</h2>

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

      {/* RIGHT PANEL — DASHBOARD CONTENT */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Restaurant Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

{/* RIGHT SIDE - SHOW TABLE STATUS */}
<div className="flex-1 p-10">
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold text-gray-800">Restaurant Tables</h1>
  </div>

  {loading ? (
    <p>Loading tables...</p>
  ) : restaurant ? (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(restaurant.availableTables)].map((_, i) => {
        const table =
          restaurant.tables?.find((t) => t.number === i + 1) || {}; // use backend data if exists
        const isBooked = table.isBooked || false;
        const bookedBy = table.bookedBy || null;

        return (
          <div
            key={i}
            className={`p-6 rounded-2xl text-center shadow-xl transition-all duration-300 ${
              isBooked ? "bg-red-200" : "bg-green-200"
            }`}
          >
            <h3 className="text-xl font-semibold mb-2 text-gray-800">
              Table {i + 1}
            </h3>
            <p className="text-gray-700">
              {isBooked
                ? `Booked by: ${bookedBy}`
                : "Available ✅"}
            </p>
          </div>
        );
      })}
    </div>
  ) : (
    <p>No restaurant found.</p>
  )}
</div>



      </div>
    </div>
  );
};

export default AdminDashboard;
