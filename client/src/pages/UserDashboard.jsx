import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";

const UserDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", time: "" });
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("userToken");

  // ✅ Fetch user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    if (token) fetchUser();
  }, [token]);

  // ✅ Fetch all restaurants
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

  // ✅ Handle table click (open modal)
  const handleTableClick = (restaurantId, tableNumber) => {
    setSelectedTable({ restaurantId, tableNumber });
    setShowModal(true);
    setMessage("");
    setError("");
  };

  // ✅ Submit reservation
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Please log in first.");
      return;
    }

    try {
      const { restaurantId, tableNumber } = selectedTable;
      const res = await axios.post(
        `http://localhost:5000/api/restaurant/reserve/${restaurantId}`,
        {
          tableNumber,
          userName: formData.name,
          userPhone: formData.phone,
          reservationTime: formData.time,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(res.data.message || "Reservation successful!");
      setError("");
      setTimeout(() => {
        setShowModal(false);
        setFormData({ name: "", phone: "", time: "" });
        setActiveRestaurant(null);
      }, 1500);

      // Refresh restaurant data
      const updatedRestaurants = await axios.get(
        "http://localhost:5000/api/restaurant/all"
      );
      setRestaurants(updatedRestaurants.data);
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.response?.data?.message || "Failed to book table.");
      setMessage("");
    }
  };

  // ✅ Logout user
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.location.href = "/login";
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: "linear-gradient(to right, #0F3C4C, #1E607A)" }}
    >
      {/* ✅ Navbar */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-white">
          Restaurant Reservation System 🍴
        </h2>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-white text-lg"
          >
            <FaUserCircle className="text-3xl" />
            {user ? user.name : "User"}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-md w-40">
              <div className="p-3 border-b text-gray-700">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white rounded-b-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Explore Restaurants */}
      <h2 className="text-2xl font-bold text-center mb-6 text-white">
        Explore Restaurants 🍽️
      </h2>

      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden"
            >
              <h3 className="text-xl font-semibold mb-2 text-[#1E607A]">
                {r.restaurantName}
              </h3>
              <p className="text-gray-700">📍 {r.location}</p>
              <p className="text-gray-700">
                🕒 {r.openTime} - {r.closeTime}
              </p>
              <p className="text-gray-700">🪑 {r.availableTables} tables</p>

              <button
                onClick={() =>
                  setActiveRestaurant(activeRestaurant === r._id ? null : r._id)
                }
                className="mt-3 px-3 py-2 bg-[#E53935] text-white rounded-md w-full"
              >
                {activeRestaurant === r._id ? "Close" : "Reserve Table"}
              </button>

              {activeRestaurant === r._id && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {r.tables.map((t) => (
                    <button
                      key={t.number}
                      disabled={t.isBooked}
                      onClick={() => handleTableClick(r._id, t.number)}
                      className={`rounded-lg py-2 font-semibold ${
                        t.isBooked
                          ? "bg-red-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      {t.isBooked ? "Booked" : `Table ${t.number}`}
                    </button>
                  ))}
                </div>
              )}

              {/* ✅ Reservation Modal */}
              {showModal && selectedTable?.restaurantId === r._id && (
                <div className="absolute inset-0 bg-white bg-opacity-95 flex justify-center items-center">
                  <div className="bg-white border border-gray-300 rounded-lg shadow-md p-5 w-[90%]">
                    <h3 className="text-lg font-semibold text-[#1E607A] mb-4">
                      Reservation Details
                    </h3>

                    {/* ✅ Feedback Messages */}
                    {message && (
                      <p className="text-green-600 text-sm mb-2 text-center">
                        {message}
                      </p>
                    )}
                    {error && (
                      <p className="text-red-600 text-sm mb-2 text-center">
                        {error}
                      </p>
                    )}

                    <form onSubmit={handleReservationSubmit} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="tel"
                        placeholder="Phone (10 digits)"
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        required
                        className="w-full p-2 border rounded"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowModal(false)}
                          className="bg-gray-400 px-3 py-1 rounded text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#1E607A] px-3 py-1 rounded text-white"
                        >
                          Confirm
                        </button>
                      </div>
                    </form>
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
