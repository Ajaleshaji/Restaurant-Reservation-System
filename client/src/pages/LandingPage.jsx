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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0F3C4C] to-[#1E607A]">
      <h1 className="text-4xl font-bold text-white mb-8 drop-shadow-md">
        🍽️ Restaurant Reservation System
      </h1>

      <p className="text-gray-200 mb-6 text-lg">
        Choose your role to continue
      </p>

      <div className="flex gap-6">
        <button
          onClick={() => handleNavigation("user")}
          className="px-6 py-3 bg-[#E53935] text-white text-lg font-semibold rounded-xl hover:bg-[#2B3B4A] transition shadow-lg"
        >
          Continue as User
        </button>

        <button
          onClick={() => handleNavigation("admin")}
          className="px-6 py-3 bg-[#E53935] text-white text-lg font-semibold rounded-xl hover:bg-[#C62828] transition shadow-lg"
        >
          Continue as Admin
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
