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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
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
              Welcome Back
            </h2>
            <p className="text-gray-400">Sign in to continue to your account</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-amber-400 transition-colors duration-300"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
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
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-amber-400 transition-colors duration-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pl-11 bg-gray-900/40 border border-gray-800/50 hover:border-amber-500/30 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 focus:shadow-xl focus:shadow-amber-500/20 hover:bg-gray-900/60"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-400 group-hover:text-amber-400/70 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error message */}
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-gray-900 py-4 px-6 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-amber-600/30 hover:shadow-amber-500/50 hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/0 via-yellow-300/30 to-yellow-300/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="relative z-10">
                {loading ? "Signing in..." : "Sign In"}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gray-950/70 text-gray-400">
                  New to StreamVault?
                </span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900/40 hover:bg-gray-800/60 border border-gray-800/50 hover:border-gray-700/50 text-gray-300 hover:text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-700/20 group"
            >
              <svg
                className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By signing in, you agree to our{" "}
            <span className="text-gray-400 hover:text-amber-400 transition-colors duration-300 cursor-pointer">
              Terms of Service
            </span>
            {" "}and{" "}
            <span className="text-gray-400 hover:text-amber-400 transition-colors duration-300 cursor-pointer">
              Privacy Policy
            </span>
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