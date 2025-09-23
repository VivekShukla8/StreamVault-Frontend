import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home";
import VideoDetail from "./pages/VideoDetail";
import UploadVideo from "./pages/Dashboard"; // placeholder for upload/dashboard
import ChannelDetail from "./pages/ChannelDetail";
import SearchResults from "./pages/SearchResults";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function RoutesConfig() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/video/:id" element={<VideoDetail />} />
        <Route path="/channel/:id" element={<ChannelDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/upload" element={<UploadVideo />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
