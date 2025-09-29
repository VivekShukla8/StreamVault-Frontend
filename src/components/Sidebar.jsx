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
  Info
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

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
    <aside className="w-60 bg-slate-950/80 backdrop-blur-xl h-screen fixed left-0 top-20 overflow-y-auto border-r border-slate-800/50">
      <div className="p-6">
        {/* Main Navigation */}
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                    isActive(item.path) 
                      ? "bg-slate-800/60 text-white" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {/* Gradient border on hover */}
                  <span className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></span>
                  
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
            <hr className="my-4 border-gray-800" />
            <ul className="space-y-1">
              {userItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-colors group relative overflow-hidden ${
                        isActive(item.path) ? "bg-gray-800" : "hover:bg-gray-800"
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
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}