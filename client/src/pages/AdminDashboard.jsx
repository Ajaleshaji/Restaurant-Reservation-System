import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center w-96">
        <h2 className="text-3xl font-semibold mb-4 text-green-700">Admin Dashboard 🛠️</h2>
        <p className="text-gray-600 mb-6">
          Manage restaurant tables, time slots, and reservations.
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
