import React, { useEffect, useState } from "react";
import axios from "axios";

const UserDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRestaurant, setActiveRestaurant] = useState(null); // For expanded view (reservation container)
  const token = localStorage.getItem("userToken");

  // Fetch all restaurants
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

  // Reserve a table
  const handleReserve = async (restaurantId, tableNumber) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/restaurant/reserve/${restaurantId}`,
        { tableNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("✅ Table booked successfully!");
      // Refresh restaurants after booking
      const updated = await axios.get("http://localhost:5000/api/restaurant/all");
      setRestaurants(updated.data);
      setActiveRestaurant(null); // Close reservation view
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div
      className="min-h-screen p-10"
      style={{ background: "linear-gradient(to right, #0F3C4C, #1E607A)" }}
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-white">
        Explore Restaurants 🍽️
      </h2>

      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : restaurants.length === 0 ? (
        <p className="text-center text-white">No restaurants available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition relative"
            >
              <h3 className="text-xl font-semibold mb-2 text-[#1E607A]">
                {r.restaurantName}
              </h3>
              <p className="text-gray-700 mb-1">
                <strong>📍 Location:</strong> {r.location}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>🕒 Timings:</strong> {r.openTime} - {r.closeTime}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>🪑 Total Tables:</strong> {r.availableTables}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() =>
                    setActiveRestaurant(activeRestaurant === r._id ? null : r._id)
                  }
                  className="px-3 py-2 bg-[#E53935] text-white rounded-md hover:bg-[#C62828] transition w-full"
                >
                  {activeRestaurant === r._id ? "Close" : "Reserve Table"}
                </button>
              </div>

              {/* Reservation container */}
              {activeRestaurant === r._id && (
                <div className="mt-6 bg-[#F5F8FA] rounded-xl p-4 border border-[#1E607A]/20">
                  <h4 className="text-lg font-semibold text-[#1E607A] mb-3">
                    Select a Table:
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {r.tables?.length > 0 ? (
                      r.tables.map((t) => (
                        <button
                          key={t.number}
                          disabled={t.isBooked}
                          onClick={() => handleReserve(r._id, t.number)}
                          className={`rounded-lg py-2 font-semibold transition-all ${
                            t.isBooked
                              ? "bg-red-400 text-white cursor-not-allowed"
                              : "bg-green-400 hover:bg-green-500 text-white"
                          }`}
                        >
                          {t.isBooked ? "Booked" : `Table ${t.number}`}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 col-span-4 text-center">
                        No tables available yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
