import React, { useState } from "react";
import useAuth from "./useAuth";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../../components/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // ✅ Toast state

  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login({ email, password });
      setToast({ message: "Logged in successfully!", type: "success" }); // ✅ Show toast
      setTimeout(() => navigate("/"), 1200); // redirect after short delay
    } catch (err) {
      console.error(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs (kept same as Register) */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500 transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo + Brand */}
        <div className="text-center mb-10">
          <Link to="/" className="flex items-center gap-3 justify-center group">
            {/* same logo code here */}
            <div className="flex flex-col">
              <span className="font-light text-3xl text-gray-100 tracking-wide group-hover:text-white transition-colors duration-300 leading-tight">
                StreamVault
              </span>
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 tracking-widest uppercase">
                Premium Media
              </span>
            </div>
          </Link>
        </div>

        {/* Form card */}
        <div className="bg-gradient-to-br from-blue-700/70 via-gray-800/70 to-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-700/50 p-10 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>

          <form onSubmit={submit} className="space-y-6 relative z-10">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-200 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-5 py-4 bg-gray-700/60 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-gray-500/50"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-200 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-5 py-4 bg-gray-700/60 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:border-gray-500/50"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 backdrop-blur-sm text-red-300">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-600 disabled:from-blue-600/50 disabled:to-indigo-700/50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 disabled:scale-100 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? "Signing in..." : "Sign In"}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  New to StreamVault?
                </span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center relative z-10">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500/50 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg cursor-pointer relative z-10"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* ✅ Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
