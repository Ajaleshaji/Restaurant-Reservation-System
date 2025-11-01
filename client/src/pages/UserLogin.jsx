import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/user/login", {
        email,
        password,
      });

      alert(res.data.message || "Login successful");
      localStorage.setItem("userToken", res.data.token);
     navigate("/user/dashboard");
 // redirect to user home or dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
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
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-96"
      >
        <h2
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: "#1E607A" }}
        >
          User Login
        </h2>

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
          className="w-full py-2 rounded-lg font-semibold text-white transition duration-200"
          style={{
            backgroundColor: "#E53935",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#C62828")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#E53935")}
        >
          Login
        </button>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <span
            className="cursor-pointer font-medium"
            style={{ color: "#1E607A" }}
            onClick={() => navigate("/user/signup")}
          >
            Signup
          </span>
        </p>
      </form>
    </div>
  );
};

export default UserLogin;
