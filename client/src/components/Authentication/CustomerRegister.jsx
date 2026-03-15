import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function CustomerRegister({ onLoginClick, onClose }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getPasswordStrength = (password) => {
    if (password.length < 6) return { level: "Weak", color: "text-red-500" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    if (strength < 3) return { level: "Weak", color: "text-red-500" };
    if (strength < 5) return { level: "Medium", color: "text-yellow-500" };
    return { level: "Strong", color: "text-green-500" };
  };

  const strength = getPasswordStrength(form.password);
  const passwordsMatch = form.password === form.confirmPassword && form.password.length >= 6;
  const canRegister = form.email && form.full_name && form.phone && passwordsMatch;

const register = async () => {
  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const { confirmPassword, ...data } = form;

    const res = await axios.post(
      "https://suyambuoils.com/api/customer/register",
      data
    );

    // ────────────────────────────────────────────────
    //   AUTO-LOGIN: backend now returns token + customerId
    // ────────────────────────────────────────────────
    if (res.data?.token && res.data?.customerId) {
      localStorage.setItem("customerToken", res.data.token);
      localStorage.setItem("customerId", res.data.customerId);

      setSuccess("Account created & logged in successfully!");

      // Redirect or close modal after short delay
      setTimeout(() => {
        setIsClosing(true);
        setTimeout(() => {
          onClose?.();
          // Optional: better UX → redirect to home or profile
          window.location.href = "/";           // ← or "/account", "/profile", etc.
        }, 300);
      }, 1800);
    } else {
      setSuccess("Account created! Please login.");
      setTimeout(() => {
        onLoginClick?.();
      }, 1800);
    }

  } catch (err) {
    setError(err.response?.data?.message || "Registration failed. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canRegister) return;
    register();
  };

  return (
    <div
      className={`h-full flex flex-col bg-white transition-all duration-300 ease-in-out transform ${
        isClosing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button
          onClick={() => {
            setIsClosing(true);
            setTimeout(onClose, 300);
          }}
          className="p-2 rounded-full hover:bg-gray-100 mr-2"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Create Account</h2>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="full_name"
              type="text"
              required
              maxLength={100}
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-12 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-400" />
                ) : (
                  <Eye size={20} className="text-gray-400" />
                )}
              </button>
            </div>
            {form.password && (
              <p className={`text-sm mt-1 ${strength.color}`}>
                Password Strength: {strength.level}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 pr-12 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} className="text-gray-400" />
                ) : (
                  <Eye size={20} className="text-gray-400" />
                )}
              </button>
            </div>
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              name="phone"
              type="text"
              required
              value={form.phone}
              onChange={handleChange}
              placeholder="Your contact number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !canRegister}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
{success && (
  <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
    <CheckCircle size={18} />
    {success}
  </div>
)}
        </form>
      </div>

      <div className="p-4 border-t text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button
          onClick={onLoginClick}
          className="text-green-600 hover:underline font-medium"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}