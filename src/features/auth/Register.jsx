import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "./useAuth";
import Toast from "../../components/Toast";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    fullname: "",
    avatar: null,
    coverImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("success");

  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form);
      setToastType("success");
      setToast("Account created successfully!");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setToastType("error");
      setToast("Account creation failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setForm((prev) => ({ ...prev, [field]: file }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast}
          type={toastType}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main container */}
      <div className="w-full max-w-xl relative z-10 flex flex-col items-center">
        {/* Logo above the card */}
        <div className="text-center mb-6">
          <Link to="/" className="flex items-center gap-3 justify-center group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:rotate-3">
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-sm transform rotate-45 relative">
                    <div className="absolute inset-1 bg-gray-200 rounded-sm transform -rotate-45">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-gray-800 rounded-sm transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-light text-2xl text-gray-100 tracking-wide group-hover:text-white transition-colors duration-300 leading-tight">
                StreamVault
              </span>
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 tracking-widest uppercase">
                Premium Media
              </span>
            </div>
          </Link>
        </div>

        {/* Card only for form */}
        <div className="bg-gradient-to-br from-blue-700/70 via-gray-800/70 to-gray-900/70 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 p-8 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>

          <form onSubmit={submit} className="space-y-5 relative z-10">
            {/* Fullname */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={form.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                placeholder="Enter full name"
                className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-gray-500/50"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="Choose a username"
                className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-gray-500/50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="Enter email"
                className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-gray-500/50"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Create a password"
                className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-gray-500/50"
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => handleFileChange("avatar", e.target.files[0])}
                className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600/50 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all duration-300"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Cover Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleFileChange("coverImage", e.target.files[0])
                }
                className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600/50 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-700 transition-all duration-300"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-600 disabled:from-blue-600/50 disabled:to-indigo-700/50 text-white font-bold py-3 px-5 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? "Creating account..." : "Create Account"}
              </span>
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-5 text-center relative z-10">
            <span className="text-gray-400 mr-2">Already have an account?</span>
            <Link to="/login" className="text-white font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
