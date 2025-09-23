import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-60">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
