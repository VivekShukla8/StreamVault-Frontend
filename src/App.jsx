import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./features/auth/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import Trending from "./pages/Trending";
import VideoDetail from "./pages/VideoDetail";
import Dashboard from "./pages/Dashboard";
import UploadVideo from "./pages/UploadVideo";
import ChannelDetail from "./pages/ChannelDetail";
import SearchResults from "./pages/SearchResults";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Tweets from "./pages/Tweets";
import Subscriptions from "./pages/Subscriptions";
import History from "./pages/History";
import LikedVideos from "./pages/LikedVideos";
import Library from "./pages/Library";
import About from "./pages/About";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import NotFound from "./pages/NotFound";
import MyVideos from "./pages/MyVideos";
import { ToastProvider } from "./components/ToastContext";

export default function App() {
  return (
    <ToastProvider>
    <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/video/:id" element={<VideoDetail />} />
                <Route path="/channel/:id" element={<ChannelDetail />} />
                <Route path="/channel/:id/about" element={<About />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/profile/*" element={<Profile />} />
                <Route path="/tweets" element={<Tweets />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<UploadVideo />} />
                <Route path="/about" element={<About />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/library" element={<Library />} />
                <Route path="/history" element={<History />} />
                <Route path="/liked" element={<LikedVideos />} />
                <Route path="/my-videos" element={<MyVideos />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/playlist/:id" element={<PlaylistDetail />} />
                <Route path="/category/:category" element={<Home />} />
              </Route>

              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
    </ErrorBoundary>
    </ToastProvider>
  );
}
