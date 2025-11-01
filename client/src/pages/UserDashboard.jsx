// src/pages/UserDashboard.jsx (or wherever your component lives)
import React, { useEffect, useState } from "react";
import axios from "axios";

const UserDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/restaurant/all");
        setRestaurants(res.data || []);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div
      className="min-h-screen p-10"
      style={{ background: "linear-gradient(to right, #0F3C4C, #1E607A)" }}
    >
      <h2 className="text-3xl font-bold text-center mb-8" style={{ color: "white" }}>
        Explore Restaurants 🍽️
      </h2>

      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : restaurants.length === 0 ? (
        <p className="text-center text-white">No restaurants available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
              <h3 className="text-xl font-semibold mb-2" style={{ color: "#1E607A" }}>
                {r.restaurantName}
              </h3>

              <p className="text-gray-700 mb-1">
                <strong>Location:</strong> {r.location}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Timings:</strong> {r.openTime} - {r.closeTime}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Tables:</strong> {r.availableTables}
              </p>

              {/* optional actions */}
              <div className="mt-4 flex gap-3">
                <button className="px-3 py-2 bg-[#E53935] text-white rounded-md hover:bg-[#C62828] transition">
                  Reserve
                </button>
                <button className="px-3 py-2 border border-[#1E607A] text-[#1E607A] rounded-md hover:bg-[#e6f7fa] transition">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
