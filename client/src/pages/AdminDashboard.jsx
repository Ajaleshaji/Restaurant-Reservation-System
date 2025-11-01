import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const AdminDashboard = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate

  // 1. Add a logout handler
  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // Clear the token
    alert("Logged out successfully.");
    navigate("/admin/login"); // Redirect to login page
  };

  // 2. Fetch restaurant details
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          console.error("No token found. Admin not authenticated.");
          navigate("/admin/login"); // Redirect to login if no token
          return;
        }

        const res = await axios.get("http://localhost:5000/api/restaurant/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRestaurant(res.data);
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
        if (err.response?.status === 404) {
          // If no restaurant found for this admin, redirect to create one
          alert("Please add your restaurant details.");
          navigate("/admin/restaurant-details");
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          // If token is invalid or expired
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        }
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantDetails();
  }, [navigate]); // Add navigate to dependency array

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      {/* LEFT SIDE - RESTAURANT DETAILS */}
      <div className="w-1/4 bg-gradient-to-b from-[#153b50] to-[#1b5977] text-white p-8 rounded-r-3xl shadow-2xl flex flex-col items-center">
        {loading ? (
          <p className="text-gray-300 mt-20 animate-pulse">Loading...</p>
        ) : restaurant ? (
          <div className="text-center w-full">
            <div className="w-24 h-24 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-5xl text-gray-200">
              🍽️
            </div>
            <h2 className="text-2xl font-semibold mb-4 truncate">
              {restaurant.restaurantName}
            </h2>
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl text-sm text-left space-y-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <span>📍</span>
                <div>
                  <p className="font-semibold text-gray-100">Location</p>
                  <p className="text-gray-300">{restaurant.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span>🕒</span>
                <div>
                  <p className="font-semibold text-gray-100">Timings</p>
                  <p className="text-gray-300">
                    {restaurant.openTime} - {restaurant.closeTime}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span>🪑</span>
                <div>
                  <p className="font-semibold text-gray-100">Tables</p>
                  <p className="text-gray-300">{restaurant.availableTables}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/restaurant-details')}
              className="mt-6 w-full py-2 bg-gray-100/20 text-white rounded-lg hover:bg-gray-100/30 transition-colors"
            >
              Edit Details
            </button>
          </div>
        ) : (
          <div className="text-center mt-20">
            {/* This part should rarely show if logic is correct */}
            <p className="text-gray-300">No restaurant details found.</p>
          </div>
        )}
      </div>

      {/* RIGHT SIDE - DASHBOARD CONTENT */}
      <div className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Restaurant Dashboard
          </h1>
          {/* 3. Add the logout button here */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["Reservations", "Analytics", "Customer Feedback", "Settings"].map(
            (title) => (
              <div
                key={title}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300"
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  {title}
                </h3>
                <p className="text-gray-500">Coming soon...</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;