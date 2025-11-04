import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaClipboardList,
  FaUtensils,
  FaMapMarkerAlt,
  FaClock,
  FaChair,
  FaSearch,
  FaTimes, 
} from "react-icons/fa";

// --- Enhanced Color Palette ---
// Primary Dark: #0F3C4C
// Primary Light: #1E607A (Used for main actions/accents)
const PRIMARY_DARK = "#0F3C4C";
const PRIMARY_LIGHT = "#1E607A";
const DANGER = "#E53935"; 

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
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("userToken");
    const navigate = useNavigate();

  // ✅ 1. useEffect for Auto-Dismissing Messages
  useEffect(() => {
    // If a message or error exists, set a timeout to clear them after 5000ms (5 seconds)
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);

      // Cleanup function to clear the timeout if the component unmounts
      // or if message/error changes before the timeout fires.
      return () => clearTimeout(timer);
    }
  }, [message, error]);


  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://restaurant-reservation-system-fjmv.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    if (token) fetchUser();
  }, [token]);

  // Fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await axios.get("https://restaurant-reservation-system-fjmv.onrender.com/api/restaurant/all");
        setRestaurants(res.data || []);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch user's bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        "https://restaurant-reservation-system-fjmv.onrender.com/api/restaurant/mybookings",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [token]);

  // Table select
  const handleTableClick = (restaurantId, tableNumber) => {
    setSelectedTable({ restaurantId, tableNumber });
    setShowModal(true);
    setMessage("");
    setError("");
  };

  // Submit booking
  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Please log in first.");
      return;
    }
    try {
      const { restaurantId, tableNumber } = selectedTable;
      const res = await axios.post(
        `https://restaurant-reservation-system-fjmv.onrender.com/api/restaurant/reserve/${restaurantId}`,
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
      
      const updatedRestaurants = await axios.get(
        "https://restaurant-reservation-system-fjmv.onrender.com/api/restaurant/all"
      );
      setRestaurants(updatedRestaurants.data);
      fetchBookings();
    } catch (err) {
      console.error("Booking failed:", err);
      setError(err.response?.data?.message || "Failed to book table.");
    }
  };

  // Cancel booking
  const handleCancelReservation = async (bookingId) => {
    try {
      const res = await axios.delete(
        `https://restaurant-reservation-system-fjmv.onrender.com/api/restaurant/cancel/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      fetchBookings();
      const updatedRestaurants = await axios.get(
        "https://restaurant-reservation-system-fjmv.onrender.com/api/restaurant/all"
      );
      setRestaurants(updatedRestaurants.data);
    } catch (err) {
      console.error("Cancel failed:", err);
      setError(err.response?.data?.message || "Failed to cancel reservation.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
   navigate("/user/login", { replace: true });
  };

  // Filter restaurants based on search
  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="min-h-screen p-6 sm:p-8 relative"
      // Enhanced Background
      style={{ background: `linear-gradient(to bottom right, ${PRIMARY_DARK} 0%, ${PRIMARY_LIGHT} 120%)` }}
    >
      {/* Navbar */}
      <div className="flex justify-between items-center mb-10 p-2 sm:p-0">
        <h2 className="text-3xl font-extrabold text-white flex items-center gap-2 tracking-wide">
          <FaUtensils className="text-white text-4xl" /> <span className="hidden sm:inline">ReserveEat</span>
          <span className="inline sm:hidden">RRS</span>
        </h2>

        <div className="flex items-center gap-4 relative">
          {/* My Bookings Button - Enhanced Styling */}
          <button
            onClick={() => {
              setShowBookings(true);
              setShowUserPopup(false);
            }}
            className="flex items-center gap-2 bg-white text-gray-800 font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105 border border-gray-200"
          >
            <FaClipboardList className="text-xl text-yellow-600" /> <span className="hidden sm:inline">My Bookings</span>
          </button>

          {/* User Profile - Enhanced Styling */}
          <button
            onClick={() => {
              setShowUserPopup(!showUserPopup);
              setShowBookings(false);
            }}
            className="flex items-center gap-2 text-white font-semibold text-lg hover:text-gray-200 transition"
          >
            <FaUserCircle className="text-4xl text-white hover:text-yellow-400 transition" />
            <span className="hidden md:inline">{user ? user.name.split(' ')[0] : "User"}</span>
          </button>

          {/* Bookings Popup - Enhanced Modal/Popup UI */}
          {showBookings && (
            <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50">
              <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 sm:w-[600px] max-h-[90vh] overflow-y-auto transform scale-100 transition-all duration-300">
                <div className="flex justify-between items-center mb-4 border-b-2 pb-3 border-gray-100">
                  <h3 className="font-bold text-2xl text-yellow-600 flex items-center gap-2">
                    <FaClipboardList /> My Bookings
                  </h3>
                  <button
                    onClick={() => setShowBookings(false)}
                    className="text-gray-500 font-bold text-2xl hover:text-red-600 transition p-1 rounded-full hover:bg-red-50"
                  >
                    <FaTimes />
                  </button>
                </div>

                {bookings.length > 0 ? (
                  <ul className="space-y-4">
                    {bookings.map((b, i) => (
                      <li
                        key={i}
                        className="border border-gray-200 p-4 rounded-lg flex justify-between items-center bg-white shadow-sm hover:shadow-md transition duration-300"
                      >
                        <div>
                          <p className="font-extrabold text-lg text-gray-800">
                            {b.restaurantName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <FaChair className="inline mr-1 text-gray-400" />
                            **Table {b.tableNumber}**
                          </p>
                          <p className="text-sm text-gray-600">
                            <FaClock className="inline mr-1 text-gray-400" />
                            **{b.reservationTime}**
                          </p>
                        </div>
                        <button
                          onClick={() => handleCancelReservation(b.bookingId)}
                          className="bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full hover:bg-red-600 transition transform hover:scale-105"
                        >
                          Cancel
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-lg">
                    🍽️ No active bookings yet. Time to reserve a table!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* User Popup - Enhanced Styling */}
          {showUserPopup && (
            <div className="absolute right-0 top-14 bg-white p-5 rounded-xl shadow-xl w-[250px] z-50 transform origin-top-right animate-fade-in">
              <div className="flex flex-col items-center text-center">
                <FaUserCircle className="text-6xl text-yellow-600 mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {user?.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 border-b pb-3 w-full truncate">{user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold w-full hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages - Enhanced alerts */}
      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 shadow-md" role="alert">
          <p className="font-semibold">Success:</p>
          <p className="flex items-center gap-2">
             <FaTimes className="text-green-500 transform rotate-45" /> {message}
          </p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-md" role="alert">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Restaurants Section with Search */}
      <h2 className="text-4xl font-extrabold text-center mb-8 text-white tracking-wider">
        <FaUtensils className="inline mr-3 text-yellow-400" /> Explore Restaurants
      </h2>

      {/* Search Bar - Enhanced Styling */}
      <div className="flex justify-center mb-12">
        <div className="relative w-full sm:w-[500px]">
          <FaSearch className="absolute left-4 top-3 text-gray-500 text-lg" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 bg-white text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-yellow-400/50 text-lg transition duration-300"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-white text-xl">Loading delicious restaurants...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 place-items-start justify-center px-4 sm:px-0">
          {filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((r) => (
              <div
                key={r._id}
                className={`bg-white rounded-2xl shadow-2xl p-6 relative overflow-hidden transition-all duration-500 hover:shadow-yellow-500/30 w-full max-w-sm 
                ${activeRestaurant === r._id ? "transform scale-[1.02] border-4 border-yellow-400/70 z-10" : "transform hover:scale-[1.01]"
                }`}
              >
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  {r.restaurantName}
                </h3>
                
                <div className="space-y-2 text-gray-700 mb-4">
                    <p className="flex items-center gap-2 font-medium">
                        <FaMapMarkerAlt className="text-lg text-yellow-600" /> {r.location}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                        <FaClock className="text-lg text-yellow-600" /> **Hours:** {r.openTime} - {r.closeTime}
                    </p>
                    <p className="flex items-center gap-2 text-sm">
                        <FaChair className="text-lg text-yellow-600" /> **Available:** <span className="font-bold text-green-600">{r.availableTables}</span> tables
                    </p>
                </div>


                {/* Toggle Button - Using Primary Light color */}
                <button
                  onClick={() =>
                    setActiveRestaurant(
                      activeRestaurant === r._id ? null : r._id
                    )
                  }
                  className={`mt-4 px-6 py-3 bg-${PRIMARY_LIGHT} text-white font-bold rounded-full w-full transition duration-300 hover:bg-yellow-600 shadow-md hover:shadow-lg`}
                  style={{ backgroundColor: activeRestaurant === r._id ? DANGER : PRIMARY_LIGHT }}
                >
                  {activeRestaurant === r._id ? "Hide Tables" : "View Tables & Reserve"}
                </button>

                {activeRestaurant === r._id && (
                  <div className="mt-6 border-t pt-4 border-gray-200">
                    <h4 className="text-lg font-bold mb-3 text-gray-800">Select a Table:</h4>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                      {r.tables.map((t) => (
                        <div key={t.number} className="flex flex-col items-center">
                          <button
                            disabled={t.isBooked && t.userId !== user?._id}
                            onClick={() =>
                              handleTableClick(r._id, t.number)
                            }
                            // Enhanced Table Button Colors
                            className={`rounded-xl py-3 w-full font-bold text-sm shadow-md transition-all duration-200 transform hover:scale-105 ${
                              t.isBooked
                                ? t.userId === user?._id
                                  ? "bg-yellow-500 text-gray-900 shadow-yellow-500/50" // Your Booking
                                  : "bg-red-500 text-white cursor-not-allowed opacity-80 shadow-red-500/50" // Booked by others
                                : "bg-green-600 hover:bg-green-700 text-white shadow-green-600/50" // Available
                            }`}
                          >
                            {t.isBooked
                              ? t.userId === user?._id
                                ? "YOU"
                                : "X"
                              : `${t.number}`}
                          </button>
                          <span className="text-xs mt-1 text-gray-500 font-medium">
                            Table {t.number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reservation Modal - Enhanced Modal UI */}
                {showModal && selectedTable?.restaurantId === r._id && (
                  <div className="absolute inset-0 bg-white bg-opacity-95 flex justify-center items-center p-4">
                    <div className="bg-white border-4 border-yellow-400 rounded-xl shadow-2xl p-6 w-full max-w-md transform scale-100 transition-all duration-300">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3">
                        <FaClipboardList className="text-yellow-600" /> Reserve Table {selectedTable.tableNumber}
                      </h3>
                      <form
                        onSubmit={handleReservationSubmit}
                        className="space-y-4"
                      >
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                        />
                        <input
                          type="tel"
                          placeholder="Phone (10 digits)"
                          pattern="[0-9]{10}"
                          value={formData.phone}
                          onChange={(e) =>
                            e.target.value.length <= 10
                              ? setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              : null
                          }
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                        />
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                          required
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
                        />
                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="bg-gray-400 px-4 py-2 rounded-full text-white font-semibold hover:bg-gray-500 transition shadow-md"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            // Using Primary Light color for confirmation
                            style={{ backgroundColor: PRIMARY_LIGHT }}
                            className="px-4 py-2 rounded-full text-white font-semibold hover:bg-yellow-600 transition shadow-md transform hover:scale-105"
                          >
                            Confirm Booking
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-white text-center text-xl p-8 col-span-full">
              😔 No restaurants found matching your search. Try a different name or location.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;