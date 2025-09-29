import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../features/auth/AuthContext";
import { 
  LayoutDashboard, 
  Upload, 
  ListVideo, 
  BarChart3,
  Search,
  LogOut
} from "lucide-react";

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

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, title: "Dashboard", color: "from-violet-500 to-purple-500" },
    { path: "/upload", icon: Upload, title: "Upload Video", color: "from-green-500 to-emerald-500" },
    { path: "/playlists", icon: ListVideo, title: "Playlists", color: "from-indigo-500 to-blue-500" },
    { path: "/about", icon: BarChart3, title: "Channel Analytics", color: "from-amber-500 to-orange-500" },
  ];

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
        <form onSubmit={handleSearch} className="flex relative group">
          {/* Gradient glow on focus */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity duration-500"></div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
            className="flex-1 bg-slate-900/50 text-slate-100 px-5 py-3 border border-slate-700/50 rounded-l-2xl focus:outline-none focus:border-slate-500/50 transition-all duration-300 placeholder-slate-400 backdrop-blur-sm relative z-10"
          />
          <button
            type="submit"
            className="bg-slate-800/60 px-6 py-3 border border-l-0 border-slate-700/50 rounded-r-2xl hover:bg-slate-700/60 transition-all duration-300 text-slate-300 hover:text-white group/btn relative z-10 overflow-hidden"
          >
            {/* Gradient overlay on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
            <Search className="w-5 h-5 relative z-10 group-hover/btn:scale-110 transition-transform duration-300" />
          </button>
        </form>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path}
                  to={item.path} 
                  className="p-3 hover:bg-slate-800/60 rounded-2xl transition-all duration-300 text-slate-300 hover:text-white group/icon relative overflow-hidden" 
                  title={item.title}
                >
                  {/* Gradient glow on hover */}
                  <span className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover/icon:opacity-20 transition-opacity duration-300 rounded-2xl`}></span>
                  
                  {/* Bottom border */}
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} scale-x-0 group-hover/icon:scale-x-100 transition-transform duration-300 origin-center rounded-full`}></span>
                  
                  <Icon className="w-5 h-5 relative z-10 group-hover/icon:scale-110 transition-transform duration-300" />
                </Link>
              );
            })}
            
            <div className="relative">
              <Link to="/profile/videos" className="flex items-center gap-2 p-2 hover:bg-slate-800/60 rounded-2xl transition-all duration-300 group/profile relative overflow-hidden">
                {/* Gradient glow on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-300 rounded-2xl"></span>
                
                {/* Avatar with gradient border */}
                <div className="relative">
                  {/* Animated gradient border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover/profile:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Avatar */}
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-9 h-9 rounded-2xl object-cover relative z-10"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center relative z-10">
                      <span className="text-white font-semibold text-sm">
                        {user?.username?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
            
            <button 
              onClick={logout} 
              className="text-sm text-slate-400 hover:text-slate-200 px-4 py-2 rounded-2xl hover:bg-slate-800/60 transition-all duration-300 flex items-center gap-2 group/logout relative overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover/logout:opacity-100 transition-opacity duration-300 rounded-2xl"></span>
              
              <LogOut className="w-4 h-4 relative z-10 group-hover/logout:scale-110 transition-transform duration-300" />
              <span className="relative z-10">Logout</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-5 py-2 text-slate-300 hover:text-white transition-colors duration-300 relative group/signin overflow-hidden rounded-2xl"
            >
              {/* Gradient glow on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover/signin:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">Sign In</span>
            </Link>
            <Link 
              to="/register" 
              className="px-5 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-2xl transition-all duration-300 font-medium relative group/signup overflow-hidden"
            >
              {/* Gradient shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/signup:translate-x-full transition-transform duration-700"></span>
              <span className="relative z-10">Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}