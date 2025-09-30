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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast}
          type={toastType}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-xl mx-auto relative z-10">
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20 transform group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-3xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text group-hover:from-blue-200 group-hover:via-indigo-100 group-hover:to-blue-300 transition-all duration-300">
              StreamVault
            </span>
            <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300 tracking-widest uppercase mt-1">
              Premium Media
            </span>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-400">Join StreamVault and start sharing</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Fullname */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-amber-400 transition-colors duration-300">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.fullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 pl-11 bg-gray-900/40 border border-gray-800/50 hover:border-amber-500/30 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 focus:shadow-xl focus:shadow-amber-500/20 hover:bg-gray-900/60"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 group-hover:text-amber-400/70 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-amber-400 transition-colors duration-300">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 pl-11 bg-gray-900/40 border border-gray-800/50 hover:border-amber-500/30 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 focus:shadow-xl focus:shadow-amber-500/20 hover:bg-gray-900/60"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 group-hover:text-amber-400/70 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-amber-400 transition-colors duration-300">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email"
                  className="w-full px-4 py-3 pl-11 bg-gray-900/40 border border-gray-800/50 hover:border-amber-500/30 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 focus:shadow-xl focus:shadow-amber-500/20 hover:bg-gray-900/60"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 group-hover:text-amber-400/70 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-amber-400 transition-colors duration-300">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pl-11 bg-gray-900/40 border border-gray-800/50 hover:border-amber-500/30 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 focus:shadow-xl focus:shadow-amber-500/20 hover:bg-gray-900/60"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 group-hover:text-amber-400/70 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-green-400 transition-colors duration-300">
                Avatar
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => handleFileChange("avatar", e.target.files[0])}
                className="w-full px-4 py-3 bg-gray-900/40 border border-gray-800/50 hover:border-green-500/30 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-600/50 file:to-emerald-600/50 file:text-green-200 hover:file:from-green-600/70 hover:file:to-emerald-600/70 file:transition-all file:duration-300 file:shadow-md hover:file:shadow-lg hover:file:shadow-green-500/30 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 focus:shadow-xl focus:shadow-green-500/20 cursor-pointer"
              />
            </div>

            {/* Cover Image */}
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-purple-400 transition-colors duration-300">
                Cover Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange("coverImage", e.target.files[0])}
                className="w-full px-4 py-3 bg-gray-900/40 border border-gray-800/50 hover:border-purple-500/30 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600/50 file:to-indigo-600/50 file:text-purple-200 hover:file:from-purple-600/70 hover:file:to-indigo-600/70 file:transition-all file:duration-300 file:shadow-md hover:file:shadow-lg hover:file:shadow-purple-500/30 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 focus:shadow-xl focus:shadow-purple-500/20 cursor-pointer"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl p-4 animate-shake">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-gray-900 py-4 px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-amber-600/30 hover:shadow-amber-500/50 hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/0 via-yellow-300/30 to-yellow-300/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="relative z-10">
                {loading ? "Creating account..." : "Create Account"}
              </span>
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-950/70 text-gray-400">
                  Already have an account?
                </span>
              </div>
            </div>
            <Link 
              to="/login" 
              className="inline-block mt-4 text-amber-400 hover:text-amber-300 font-semibold transition-colors duration-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}