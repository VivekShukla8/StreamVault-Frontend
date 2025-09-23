import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../features/auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="w-full bg-gradient-to-r from-slate-950 via-gray-950 to-zinc-950 px-6 py-4 border-b border-slate-800/50 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            {/* Main logo container */}
            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:rotate-3">
              {/* Logo symbol - combination of play and stream */}
              <div className="relative">
                {/* Play triangle */}
                <div className="w-6 h-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-sm transform rotate-45 relative">
                  <div className="absolute inset-1 bg-slate-100 rounded-sm transform -rotate-45">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-800 rounded-sm transform rotate-45"></div>
                    </div>
                  </div>
                </div>
                {/* Stream lines */}
                <div className="absolute -right-1 top-1 space-y-0.5">
                  <div className="w-2 h-0.5 bg-slate-700 rounded-full opacity-60"></div>
                  <div className="w-3 h-0.5 bg-slate-600 rounded-full opacity-40"></div>
                  <div className="w-2 h-0.5 bg-slate-500 rounded-full opacity-30"></div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-slate-400/20 via-slate-300/30 to-slate-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 blur-md"></div>
            {/* Pulse ring */}
            <div className="absolute -inset-1 border-2 border-slate-300/30 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-light text-2xl text-slate-100 tracking-wide group-hover:text-white transition-colors duration-300 leading-tight">StreamVault</span>
            <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300 tracking-widest uppercase">Premium Media</span>
          </div>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-8">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="flex-1 bg-slate-900/50 text-slate-100 px-5 py-3 border border-slate-700/50 rounded-l-2xl focus:outline-none focus:border-slate-500/50 transition-all duration-300 placeholder-slate-400 backdrop-blur-sm"
          />
          <button
            type="submit"
            className="bg-slate-800/60 px-6 py-3 border border-l-0 border-slate-700/50 rounded-r-2xl hover:bg-slate-700/60 transition-all duration-300 text-slate-300 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/dashboard" className="p-3 hover:bg-slate-800/60 rounded-2xl transition-all duration-300 text-slate-300 hover:text-white" title="Dashboard">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Link>
            <Link to="/upload" className="p-3 hover:bg-slate-800/60 rounded-2xl transition-all duration-300 text-slate-300 hover:text-white" title="Upload Video">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
            <Link to="/playlists" className="p-3 hover:bg-slate-800/60 rounded-2xl transition-all duration-300 text-slate-300 hover:text-white" title="Playlists">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </Link>
            <Link to="/about" className="p-3 hover:bg-slate-800/60 rounded-2xl transition-all duration-300 text-slate-300 hover:text-white" title="Channel Analytics">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
            <div className="relative">
              <Link to="/profile/videos" className="flex items-center gap-2 p-2 hover:bg-slate-800/60 rounded-2xl transition-all duration-300">
                <div className="w-9 h-9 bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center">
                  <span className="text-slate-900 font-semibold text-sm">
                    {user?.username?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </Link>
            </div>
            <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 rounded-2xl hover:bg-slate-800/60 transition-all duration-300">
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2 text-slate-300 hover:text-white transition-colors duration-300">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-2xl transition-all duration-300 font-medium">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
