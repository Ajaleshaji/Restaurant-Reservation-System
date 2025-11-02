import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCircle, FaClipboardList } from "react-icons/fa";

const UserDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", time: "" });
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("userToken");

  // ✅ Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
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

  // ✅ Fetch user's bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/restaurant/mybookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [token]);

  // ✅ Table select
  const handleTableClick = (restaurantId, tableNumber) => {
    setSelectedTable({ restaurantId, tableNumber });
    setShowModal(true);
    setMessage("");
    setError("");
  };

  // ✅ Submit booking
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

      setMessage(res.data.message);
      setError("");
      setShowModal(false);
      setFormData({ name: "", phone: "", time: "" });
      setActiveRestaurant(null);

      const updatedRestaurants = await axios.get("http://localhost:5000/api/restaurant/all");
      setRestaurants(updatedRestaurants.data);
      fetchBookings();
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.response?.data?.message || "Failed to book table.");
    }
  };

  // ✅ Cancel booking
  // ✅ Cancel booking by bookingId
const handleCancelReservation = async (bookingId) => {
  try {
    const res = await axios.delete(
      `http://localhost:5000/api/restaurant/cancel/${bookingId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setMessage(res.data.message);
    fetchBookings(); // Refresh bookings
    const updatedRestaurants = await axios.get("http://localhost:5000/api/restaurant/all");
    setRestaurants(updatedRestaurants.data);
  } catch (err) {
    console.error("Cancel failed:", err);
    setError(err.response?.data?.message || "Failed to cancel reservation.");
  }
};


  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen p-8 relative" style={{ background: "linear-gradient(to right, #0F3C4C, #1E607A)" }}>
      {/* ✅ Navbar */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-white">Restaurant Reservation System 🍴</h2>

        <div className="flex items-center gap-4 relative">
          {/* ✅ My Bookings Button */}
          <button
            onClick={() => {
              setShowBookings(!showBookings);
              setShowUserPopup(false);
            }}
            className="flex items-center gap-2 bg-white text-[#1E607A] font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-gray-100"
          >
            <FaClipboardList /> My Bookings
          </button>

          {/* ✅ User Profile */}
          <button
            onClick={() => {
              setShowUserPopup(!showUserPopup);
              setShowBookings(false);
            }}
            className="flex items-center gap-2 text-white text-lg"
          >
            <FaUserCircle className="text-3xl" />
            {user ? user.name : "User"}
          </button>

          {/* ✅ Bookings Popup */}
          {showBookings && (
            <div className="absolute right-44 top-12 bg-white p-4 rounded-lg shadow-lg w-[300px] z-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-[#1E607A] text-lg">My Bookings</h3>
                <button onClick={() => setShowBookings(false)} className="text-red-500 font-bold text-lg">✕</button>
              </div>
              {bookings.length > 0 ? (
                <ul className="space-y-2 max-h-[250px] overflow-y-auto">
                  {bookings.map((b, i) => (
                    <li key={i} className="border p-2 rounded flex justify-between items-center bg-gray-50">
                      <div>
                        <p className="font-semibold text-[#0F3C4C]">{b.restaurantName}</p>
                        <p className="text-sm text-gray-700">
                          Table {b.tableNumber} — ⏰ {b.reservationTime}
                        </p>
                      </div>
                    <button
  onClick={() => handleCancelReservation(b.bookingId)}
  className="text-red-600 text-sm hover:underline"
>
  Cancel
</button>

                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center">No active bookings yet.</p>
              )}
            </div>
          )}

          {/* ✅ User Popup (shows Gmail) */}
          {showUserPopup && (
            <div className="absolute right-0 top-12 bg-white p-5 rounded-lg shadow-lg w-[250px] z-50">
              <div className="flex flex-col items-center text-center">
                <FaUserCircle className="text-5xl text-[#1E607A] mb-2" />
                <h3 className="text-lg font-semibold text-[#0F3C4C]">{user?.name}</h3>
                <p className="text-gray-700 text-sm">{user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Messages */}
      {message && <div className="bg-green-100 text-green-700 p-3 rounded text-center mb-6 shadow">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded text-center mb-6 shadow">{error}</div>}

      {/* ✅ Restaurants */}
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Explore Restaurants 🍽️</h2>
      {loading ? (
        <p className="text-center text-white">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
              <h3 className="text-xl font-semibold mb-2 text-[#1E607A]">{r.restaurantName}</h3>
              <p className="text-gray-700">📍 {r.location}</p>
              <p className="text-gray-700">🕒 {r.openTime} - {r.closeTime}</p>
              <p className="text-gray-700">🪑 {r.availableTables} tables</p>

              <button
                onClick={() => setActiveRestaurant(activeRestaurant === r._id ? null : r._id)}
                className="mt-3 px-3 py-2 bg-[#E53935] text-white rounded-md w-full"
              >
                {activeRestaurant === r._id ? "Close" : "Reserve Table"}
              </button>

              {activeRestaurant === r._id && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {r.tables.map((t) => (
                    <div key={t.number} className="flex flex-col items-center">
                      <button
                        disabled={t.isBooked && t.userId !== user?._id}
                        onClick={() => handleTableClick(r._id, t.number)}
                        className={`rounded-lg py-2 w-full font-semibold ${
                          t.isBooked
                            ? t.userId === user?._id
                              ? "bg-yellow-400 hover:bg-yellow-500 text-white"
                              : "bg-red-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        {t.isBooked
                          ? t.userId === user?._id
                            ? "Your Booking"
                            : "Booked"
                          : `Table ${t.number}`}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ✅ Reservation Modal */}
              {showModal && selectedTable?.restaurantId === r._id && (
                <div className="absolute inset-0 bg-white bg-opacity-95 flex justify-center items-center">
                  <div className="bg-white border border-gray-300 rounded-lg shadow-md p-5 w-[90%]">
                    <h3 className="text-lg font-semibold text-[#1E607A] mb-4">Reservation Details</h3>
                    <form onSubmit={handleReservationSubmit} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="tel"
                        placeholder="Phone (10 digits)"
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) => e.target.value.length <= 10 ? setFormData({ ...formData, phone: e.target.value }) : null}
                        required
                        className="w-full p-2 border rounded"
                      />
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
