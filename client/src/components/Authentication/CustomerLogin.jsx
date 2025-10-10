import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, Eye, EyeOff } from "lucide-react";
// Import the registration component
import CustomerRegister from "./CustomerRegister";

export default function CustomerLogin() {
  // State to toggle between Login and Register views
  const [showRegister, setShowRegister] = useState(false);

  // States for the login form
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await axios.post("http://suyambufoods.com/api/api/customer/login", form);
      
      if (!res.data || !res.data.token || !res.data.customerId) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }
      
      localStorage.setItem("customerToken", res.data.token);
      localStorage.setItem("customerId", res.data.customerId);
      
      // On successful login, refresh the page to update the app's state
      window.location.href = "/";

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // This function is now used to show the register component
  const handleRegisterClick = () => {
    setShowRegister(true);
  };

  // This function is passed to the register component to switch back to login
  const handleShowLogin = () => {
    setShowRegister(false);
  };

  // This function handles navigating back to the home page
  const handleGoBack = () => {
    navigate('/');
  };

  // Conditionally render the Register or Login component
  if (showRegister) {
    // The onClose prop now calls handleShowLogin to return to the login view
    return <CustomerRegister onLoginClick={handleShowLogin} onClose={handleShowLogin} />;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700 mb-1">
              Username or Email
            </label>
            <input
              id="login"
              name="login"
              type="text"
              placeholder="Username or email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={form.login}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} className="text-gray-400" />
                ) : (
                  <Eye size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <button type="button" className="text-sm text-green-600 hover:text-green-700">
              Forgot password?
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </form>

        <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
                New user?{' '}
                <button
                    type="button"
                    onClick={handleRegisterClick}
                    className="font-medium text-green-600 hover:text-green-700"
                >
                    Create an account
                </button>
            </p>
        </div>
      </div>
    </div>
  );
}