import React, { useState, useContext } from "react";
import { videoAPI } from "../api/video";
import { AuthContext } from "../features/auth/AuthContext";
import { useNavigate } from "react-router-dom";

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
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to upload videos");
      return;
    }

    if (!formData.videofile) {
      setError("Please select a video file");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const uploadFormData = new FormData();
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("videofile", formData.videofile);
      if (formData.thumbnail) {
        uploadFormData.append("thumbnail", formData.thumbnail);
      }

      const response = await videoAPI.uploadVideo(uploadFormData);
      
      // Redirect to the uploaded video
      navigate(`/video/${response.data.data._id}`);
    } catch (err) {
      setError("Failed to upload video. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-slate-900/80 via-gray-900/80 to-zinc-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📤</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to upload</h2>
          <p className="text-slate-400 mb-6">Share your content with the world</p>
          <a
            href="/login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Upload Video</h1>
              <p className="text-slate-400">Share your content with the world</p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-3">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                placeholder="Enter an engaging title for your video"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-3">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                placeholder="Describe your video content..."
              />
            </div>

            {/* Video File */}
            <div>
              <label htmlFor="videofile" className="block text-sm font-medium text-slate-300 mb-3">
                Video File *
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="videofile"
                  name="videofile"
                  accept="video/*"
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/50 file:text-blue-200 hover:file:bg-blue-600/70 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                <span>📁</span>
                Supported formats: MP4, AVI, MOV, WebM (Max: 100MB)
              </p>
            </div>

            {/* Thumbnail */}
            <div>
              <label htmlFor="thumbnail" className="block text-sm font-medium text-slate-300 mb-3">
                Thumbnail (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600/50 file:text-green-200 hover:file:bg-green-600/70 focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                <span>🖼️</span>
                Upload a custom thumbnail or we'll generate one automatically
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !formData.title || !formData.videofile}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-red-500/25 disabled:shadow-none flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <span>📤</span>
                  Upload Video
                </>
              )}
            </button>

            {/* Upload Tips */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
              <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                <span>💡</span>
                Upload Tips
              </h4>
              <ul className="text-sm text-blue-200/80 space-y-1">
                <li>• Use descriptive titles to help viewers find your content</li>
                <li>• Add detailed descriptions with relevant keywords</li>
                <li>• Custom thumbnails get more clicks than auto-generated ones</li>
                <li>• Ensure good video quality for better viewer experience</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}