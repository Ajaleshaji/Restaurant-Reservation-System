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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0F3C4C] to-[#1E607A] text-white px-6">
      {/* Main Heading */}
      <h1 className="text-4xl font-bold mb-6 drop-shadow-md text-center">
        🍽️ Restaurant Reservation System
      </h1>
<br></br>
         {/* About Section */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg max-w-3xl text-center border border-white/20">
        <h2 className="text-2xl font-semibold mb-3">🌟 About the System</h2>
        <p className="text-gray-200 leading-relaxed text-justify">
          The Restaurant Reservation System is a modern web application designed
          to simplify the process of booking tables at restaurants. Users can
          browse restaurants, view available tables in real-time, and make quick
          reservations with just a few clicks. Administrators can easily manage
          restaurants, monitor bookings, and update table availability. This
          system ensures a smooth dining experience and efficient restaurant
          management.
        </p>
      </div>
<br></br>
      <p className="text-gray-200 mb-8 text-lg text-center max-w-2xl">
        Choose your role to continue
      </p>
      {/* Role Selection Buttons */}
      <div className="flex gap-6 mb-10">
        <button
          onClick={() => handleNavigation("user")}
          className="px-6 py-3 bg-[#E53935] text-white text-lg font-semibold rounded-xl hover:bg-[#C62828] transition shadow-lg"
        >
          Continue as User
        </button>

        <button
          onClick={() => handleNavigation("admin")}
          className="px-6 py-3 bg-[#E53935] text-white text-lg font-semibold rounded-xl hover:bg-[#2B3B4A] transition shadow-lg"
        >
          Continue as Admin
        </button>
      </div>


      {/* Footer */}
      <footer className="mt-10 text-gray-300 text-sm">
        © {new Date().getFullYear()} Restaurant Reservation System. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
