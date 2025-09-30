import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar - Fixed at top, full width */}
      <Navbar onMenuClick={handleMenuClick} />
      
      {/* Content wrapper */}
      <div className="relative">
        {/* Sidebar - Fixed position on all screen sizes */}
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
        
        {/* Main Content Area - Add left margin on desktop to account for fixed sidebar */}
        <main className="min-h-screen lg:ml-60">
          <Outlet />
        </main>
      </div>
    </div>
  );
}