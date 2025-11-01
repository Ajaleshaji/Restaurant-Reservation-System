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

  // This useEffect will fetch existing data if the user re-visits this page
  useEffect(() => {
    const fetchExistingData = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:5000/api/restaurant/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Pre-fill the form with existing data
        if (res.data) {
          setRestaurantName(res.data.restaurantName);
          setLocation(res.data.location);
          setOpenTime(res.data.openTime);
          setCloseTime(res.data.closeTime);
          setAvailableTables(res.data.availableTables);
        }
      } catch (err) {
        // It's okay if it fails (e.g., 404), means no data yet
        console.log("No existing restaurant data found.");
      }
    };
    fetchExistingData();
  }, []);


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

    // ✅ Instead of going to dashboard, go to login page
    localStorage.removeItem("adminToken"); // optional: logout the admin
    navigate("/admin/login"); // redirect to login page

  } catch (err) {
    console.error("Error saving restaurant details:", err);
    alert(err.response?.data?.message || "Failed to save restaurant details.");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Restaurant Details
        </h2>

        <input
          type="text"
          placeholder="Restaurant Name"
          className="w-full p-2 mb-4 border rounded-lg"
          onChange={(e) => setRestaurantName(e.target.value)}
          value={restaurantName}
          required
        />
        <input
          type="text"
          placeholder="Location"
          className="w-full p-2 mb-4 border rounded-lg"
          onChange={(e) => setLocation(e.target.value)}
          value={location}
          required
        />
        <div className="flex gap-4 mb-4">
          <input
            type="time"
            placeholder="Open Time"
            className="w-1/2 p-2 border rounded-lg"
            onChange={(e) => setOpenTime(e.target.value)}
            value={openTime}
            required
          />
          <input
            type="time"
            placeholder="Close Time"
            className="w-1/2 p-2 border rounded-lg"
            onChange={(e) => setCloseTime(e.target.value)}
            value={closeTime}
            required
          />
        </div>
        <input
          type="number"
          placeholder="Available Tables"
          className="w-full p-2 mb-6 border rounded-lg"
          onChange={(e) => setAvailableTables(e.target.value)}
          value={availableTables}
          min="0"
          required
        />
        <button
          type="submit"
          className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Details
        </button>
      </form>
    </div>
  );
};

export default RestaurantDetails;