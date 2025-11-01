import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RestaurantDetails = () => {
  const [restaurantName, setRestaurantName] = useState("");
  const [location, setLocation] = useState("");
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [availableTables, setAvailableTables] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch existing restaurant details (if any)
  useEffect(() => {
    const fetchExistingData = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/restaurant/details", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setRestaurantName(res.data.restaurantName);
          setLocation(res.data.location);
          setOpenTime(res.data.openTime);
          setCloseTime(res.data.closeTime);
          setAvailableTables(res.data.availableTables);
        }
      } catch (err) {
        console.log("No existing restaurant data found.");
      }
    };
    fetchExistingData();
  }, []);

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("adminToken");
    if (!token) {
      alert("You must be logged in as admin first!");
      navigate("/admin/login");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/restaurant/details",
        { restaurantName, location, openTime, closeTime, availableTables },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data?.message || "Restaurant details saved!");

      // ✅ After saving, log out and go to login
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    } catch (err) {
      console.error("Error saving restaurant details:", err);
      alert(err.response?.data?.message || "Failed to save restaurant details.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0F3C4C] to-[#1E607A]">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-gray-200"
      >
        <h2 className="text-3xl font-semibold mb-6 text-center text-[#0F3C4C]">
          Restaurant Details
        </h2>

        <input
          type="text"
          placeholder="Restaurant Name"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E607A]"
          onChange={(e) => setRestaurantName(e.target.value)}
          value={restaurantName}
          required
        />

        <input
          type="text"
          placeholder="Location"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E607A]"
          onChange={(e) => setLocation(e.target.value)}
          value={location}
          required
        />

        <div className="flex gap-4 mb-4">
          <input
            type="time"
            className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E607A]"
            onChange={(e) => setOpenTime(e.target.value)}
            value={openTime}
            required
          />
          <input
            type="time"
            className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E607A]"
            onChange={(e) => setCloseTime(e.target.value)}
            value={closeTime}
            required
          />
        </div>

        <input
          type="number"
          placeholder="Available Tables"
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E607A]"
          onChange={(e) => setAvailableTables(e.target.value)}
          value={availableTables}
          min="0"
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-[#E53935] text-white rounded-lg font-semibold hover:bg-[#C62828] transition-colors shadow-md"
        >
          Save Details
        </button>
      </form>
    </div>
  );
};

export default RestaurantDetails;
