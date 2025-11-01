import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    if (role === "user") {
      navigate("/user/login");
    } else {
      navigate("/admin/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-300 via-blue-200 to-purple-200">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        🍽️ Restaurant Reservation System
      </h1>

      <p className="text-gray-700 mb-6 text-lg">
        Choose your role to continue
      </p>

      <div className="flex gap-6">
        <button
          onClick={() => handleNavigation("user")}
          className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg"
        >
          Continue as User
        </button>

        <button
          onClick={() => handleNavigation("admin")}
          className="px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition shadow-lg"
        >
          Continue as Admin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
