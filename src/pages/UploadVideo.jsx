import React, { useState, useContext } from "react";
import { videoAPI } from "../api/video";
import { AuthContext } from "../features/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

export default function UploadVideo() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videofile: null,
    thumbnail: null,
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gray-950/70 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-500/20">
              <svg className="w-10 h-10 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-3">
              Login Required
            </h2>
            <p className="text-gray-400 mb-6">
              Please login to upload videos and share your content.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="inline-block px-8 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.videofile) newErrors.videofile = "Video file is required";
    if (!formData.thumbnail) newErrors.thumbnail = "Thumbnail is required";
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setUploading(true);
    setErrors({});

    try {
      // 1️⃣ Upload thumbnail directly to Cloudinary
      const thumbnailData = await uploadToCloudinary(formData.thumbnail, "thumbnails");

      // 2️⃣ Upload video directly to Cloudinary
      const videoData = await uploadToCloudinary(formData.videofile, "videos");

      // 3️⃣ Send URLs + public IDs to backend for DB save
      await videoAPI.uploadVideo({
        title: formData.title,
        description: formData.description,
        videofile: videoData.url,
        thumbnail: thumbnailData.url,
        videoPublicId: videoData.public_id,
        thumbnailPublicId: thumbnailData.public_id,
        duration: videoData.duration || 0,
      });

      navigate("/"); // ✅ after successful upload
      console.log("Video file:", formData.videofile);
      console.log("Thumbnail file:", formData.thumbnail);

    } catch (error) {
      console.log("Video file:", formData.videofile);
      console.log("Thumbnail file:", formData.thumbnail);
      console.error(error);
      setErrors({ general: "Failed to upload video. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-2">
              Upload Your Video
            </h2>
            <p className="text-gray-400">Share your content with the world</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="group">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors duration-300"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-gray-900/40 border ${
                  errors.title ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30" : "border-gray-800/50 hover:border-blue-500/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 focus:shadow-xl focus:shadow-blue-500/20`}
                placeholder="Enter an engaging title for your video"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="group">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors duration-300"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 bg-gray-900/40 border ${
                  errors.description ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30" : "border-gray-800/50 hover:border-blue-500/30 focus:border-blue-500/50 focus:ring-blue-500/20"
                } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 resize-none hover:shadow-lg hover:shadow-blue-500/10 focus:shadow-xl focus:shadow-blue-500/20`}
                placeholder="Describe your video content..."
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Video File */}
            <div className="group">
              <label
                htmlFor="videofile"
                className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-blue-400 transition-colors duration-300"
              >
                Video File *
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="videofile"
                  name="videofile"
                  accept="video/*"
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900/40 border ${
                    errors.videofile ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30" : "border-gray-800/50 hover:border-purple-500/30 focus:border-purple-500/50 focus:ring-purple-500/20"
                  } rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600/50 file:to-blue-600/50 file:text-purple-200 hover:file:from-purple-600/70 hover:file:to-blue-600/70 file:transition-all file:duration-300 file:shadow-md hover:file:shadow-lg hover:file:shadow-purple-500/30 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 focus:shadow-xl focus:shadow-purple-500/20 cursor-pointer`}
                />
              </div>
              {errors.videofile && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.videofile}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            <div className="group">
              <label
                htmlFor="thumbnail"
                className="block text-sm font-medium text-slate-300 mb-2 group-focus-within:text-green-400 transition-colors duration-300"
              >
                Thumbnail *
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-gray-900/40 border ${
                    errors.thumbnail ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/30" : "border-gray-800/50 hover:border-green-500/30 focus:border-green-500/50 focus:ring-green-500/20"
                  } rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-green-600/50 file:to-emerald-600/50 file:text-green-200 hover:file:from-green-600/70 hover:file:to-emerald-600/70 file:transition-all file:duration-300 file:shadow-md hover:file:shadow-lg hover:file:shadow-green-500/30 focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 focus:shadow-xl focus:shadow-green-500/20 cursor-pointer`}
                />
              </div>
              {errors.thumbnail && (
                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.thumbnail}
                </p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl p-4 animate-shake">
                <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:shadow-2xl disabled:shadow-none flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="relative z-10">Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="relative z-10">Upload Video</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

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