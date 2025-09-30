import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../features/auth/AuthContext";
import { 
  Home,
  TrendingUp,
  MessageSquare,
  Tv,
  Library,
  Clock,
  Heart,
  LayoutDashboard,
  Upload,
  Video,
  ListVideo,
  User,
  Mail,
  Info,
  X,
  LogOut
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const sidebarItems = [
    { path: "/", icon: Home, label: "Home", color: "from-blue-500 to-cyan-500" },
    { path: "/trending", icon: TrendingUp, label: "Trending", color: "from-orange-500 to-red-500" },
    { path: "/tweets", icon: MessageSquare, label: "Tweets", color: "from-sky-400 to-blue-500" },
    { path: "/subscriptions", icon: Tv, label: "Subscriptions", color: "from-purple-500 to-pink-500" },
    { path: "/library", icon: Library, label: "Library", color: "from-emerald-500 to-teal-500" },
    { path: "/history", icon: Clock, label: "History", color: "from-amber-500 to-orange-500" },
    { path: "/liked", icon: Heart, label: "Liked videos", color: "from-pink-500 to-rose-500" },
  ];

  const userItems = user ? [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "from-violet-500 to-purple-500" },
    { path: "/upload", icon: Upload, label: "Upload", color: "from-green-500 to-emerald-500" },
    { path: "/my-videos", icon: Video, label: "My videos", color: "from-red-500 to-pink-500" },
    { path: "/playlists", icon: ListVideo, label: "Playlists", color: "from-indigo-500 to-blue-500" },
    { path: "/profile/videos", icon: User, label: "Profile", color: "from-cyan-500 to-teal-500" },
    { path: "/messages/conversations", icon: Mail, label: "Messages", color: "from-fuchsia-500 to-pink-500" },
    { path: "/about", icon: Info, label: "About", color: "from-slate-400 to-gray-500" },
  ] : [];

  return (
    <>
      {/* Mobile/Tablet Overlay - Higher z-index, better click handling */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 cursor-pointer"
          onClick={onClose}
          role="button"
          aria-label="Close sidebar"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
              onClose();
            }
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed
        top-0 lg:top-20 
        left-0 
        h-screen
        w-64 sm:w-72 lg:w-60
        bg-slate-950/95 lg:bg-slate-950/80 
        backdrop-blur-xl
        border-r border-slate-800/50
        overflow-y-auto
        scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900
        z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#334155 #0f172a'
      }}>
        {/* Mobile Header with Close Button */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800/50 sticky top-0 bg-slate-950/95 backdrop-blur-xl z-10">
          <span className="text-slate-200 font-semibold text-base">Menu</span>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-800/60 rounded-xl transition-all duration-300 text-slate-300 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Main Navigation */}
          <ul className="space-y-1 sm:space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => onClose()}
                    className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive(item.path) 
                        ? "bg-slate-800/60 text-white" 
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    {/* Gradient border on hover */}
                    <span className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></span>
                    
                    {/* Animated bottom border line */}
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></span>
                    
                    <Icon className={`w-5 h-5 group-hover:scale-110 transition-transform duration-300 relative z-10 ${
                      isActive(item.path) ? 'text-white' : ''
                    }`} />
                    
                    <span className="text-sm font-medium relative z-10">{item.label}</span>
                    
                    {/* Active indicator */}
                    {isActive(item.path) && (
                      <span className={`absolute right-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`}></span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User Section */}
          {user && (
            <>
              <hr className="my-4 border-slate-800" />
              <ul className="space-y-1">
                {userItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => onClose()}
                        className={`flex items-center gap-3 sm:gap-4 px-3 py-2 rounded-lg transition-colors group relative overflow-hidden ${
                          isActive(item.path) ? "bg-slate-800/60 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        {/* Gradient glow on hover */}
                        <span className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-15 transition-opacity duration-300`}></span>
                        
                        {/* Animated bottom border line */}
                        <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center`}></span>
                        
                        <Icon className={`w-5 h-5 group-hover:scale-105 transition-transform duration-200 relative z-10 ${
                          isActive(item.path) ? 'text-white' : ''
                        }`} />
                        
                        <span className="text-sm font-medium relative z-10">{item.label}</span>
                        
                        {/* Active indicator */}
                        {isActive(item.path) && (
                          <span className={`absolute right-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${item.color}`}></span>
                        )}
                      </Link>
                    </li>
                  );
                })}
                
                {/* Logout Button - Visible on all devices in sidebar */}
                <li>
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 sm:gap-4 px-3 py-2 rounded-lg transition-colors group relative overflow-hidden text-slate-400 hover:text-white hover:bg-slate-800/60"
                  >
                    {/* Gradient glow on hover */}
                    <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-15 transition-opacity duration-300"></span>
                    
                    {/* Animated bottom border line */}
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
                    
                    <LogOut className="w-5 h-5 group-hover:scale-105 transition-transform duration-200 relative z-10" />
                    
                    <span className="text-sm font-medium relative z-10">Logout</span>
                  </button>
                </li>
              </ul>
            </>
          )}
        </div>
      </aside>
    </>
  );
}