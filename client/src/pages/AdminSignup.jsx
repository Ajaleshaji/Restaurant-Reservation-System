import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const AdminSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("https://restaurant-reservation-system-fjmv.onrender.com/api/auth/admin/signup", {
        name,
        email,
        password,
      });

      localStorage.setItem("adminToken", res.data.token);
      setMessage(res.data.message || "Signup successful!");
      setError("");

      // ✅ Redirect to restaurant details after short delay
      setTimeout(() => navigate("/admin/restaurant-details"), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Signup failed");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0F3C4C] to-[#1E607A]">
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-2xl shadow-2xl w-96 border border-gray-200"
      >
        <h2 className="text-3xl font-semibold mb-6 text-center text-[#0F3C4C]">
          Admin Signup
        </h2>

        {/* ✅ Success/Error Messages */}
        {message && (
          <div className="mb-4 text-green-600 font-medium text-center bg-green-100 p-2 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 text-red-600 font-medium text-center bg-red-100 p-2 rounded-lg">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E607A]"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E607A]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E607A]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-3 bg-[#E53935] text-white rounded-lg font-semibold hover:bg-[#C62828] transition-colors shadow-md"
        >
          Signup
        </button>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{" "}
          <Link
            to="/admin/login"
            className="text-[#1E607A] hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default AdminSignup;
