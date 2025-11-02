import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // ✅ inline feedback message
  const [error, setError] = useState("");     // ✅ inline error message
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/user/signup", {
        name,
        email,
        password,
      });

      setMessage(res.data.message || "Signup successful! Redirecting...");
      setTimeout(() => navigate("/user/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(to right, #0F3C4C, #1E607A)",
      }}
    >
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-2xl shadow-lg w-96"
      >
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: "#1E607A" }}
        >
          User Signup
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2"
          style={{ borderColor: "#ddd", focusRingColor: "#1E607A" }}
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2"
          style={{ borderColor: "#ddd", focusRingColor: "#1E607A" }}
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2"
          style={{ borderColor: "#ddd", focusRingColor: "#1E607A" }}
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
        />

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-semibold text-white transition duration-200"
          style={{
            backgroundColor: "#E53935",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#C62828")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#E53935")}
        >
          Signup
        </button>

        {/* ✅ Inline Success & Error Messages */}
        {message && (
          <p className="text-green-600 text-center mt-4 text-sm">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-center mt-4 text-sm">{error}</p>
        )}

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <span
            className="cursor-pointer font-medium"
            style={{ color: "#1E607A" }}
            onClick={() => navigate("/user/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default UserSignup;
