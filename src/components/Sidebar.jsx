import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../features/auth/AuthContext";
import { 
  HomeIcon, 
  UserIcon, 
  MessageCircleIcon, 
  BellIcon,
  SettingsIcon 
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const sidebarItems = [
    { path: "/", icon: "🏠", label: "Home" },
    { path: "/trending", icon: "🔥", label: "Trending" },
    { path: "/tweets", icon: "🐦", label: "Tweets" },
    { path: "/subscriptions", icon: "📺", label: "Subscriptions" },
    { path: "/library", icon: "📚", label: "Library" },
    { path: "/history", icon: "🕒", label: "History" },
    { path: "/liked", icon: "❤️", label: "Liked videos" },
  ];

  const userItems = user ? [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/upload", icon: "📤", label: "Upload" },
    { path: "/my-videos", icon: "🎥", label: "My videos" },
    { path: "/playlists", icon: "📋", label: "Playlists" },
    { path: "/profile/videos", icon: "👤", label: "Profile" },
    { path: "/messages/conversations", icon: "💬", label: "Messages" },
    { path: "/about", icon: "ℹ️", label: "About" },
  ] : [];

  return (
    <aside className="w-60 bg-slate-950/80 backdrop-blur-xl h-screen fixed left-0 top-20 overflow-y-auto border-r border-slate-800/50">
      <div className="p-6">
        {/* Main Navigation */}
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-slate-800/60 transition-all duration-300 group ${
                  isActive(item.path) ? "bg-slate-800/60 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* User Section */}
        {user && (
          <>
            <hr className="my-4 border-gray-800" />
            <ul className="space-y-1">
              {userItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors ${
                      isActive(item.path) ? "bg-gray-800" : ""
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
