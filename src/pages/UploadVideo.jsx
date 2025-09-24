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
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="bg-slate-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-slate-300 mb-6">
            Please login to upload videos and share your content.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Go to Login
          </button>
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
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Upload Your Video
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-300 mb-3"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800/50 border ${
                  errors.title ? "border-red-500" : "border-slate-600/50"
                } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300`}
                placeholder="Enter an engaging title for your video"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-300 mb-3"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-4 py-3 bg-slate-800/50 border ${
                  errors.description ? "border-red-500" : "border-slate-600/50"
                } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none`}
                placeholder="Describe your video content..."
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Video File */}
            <div>
              <label
                htmlFor="videofile"
                className="block text-sm font-medium text-slate-300 mb-3"
              >
                Video File *
              </label>
              <input
                type="file"
                id="videofile"
                name="videofile"
                accept="video/*"
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800/50 border ${
                  errors.videofile ? "border-red-500" : "border-slate-600/50"
                } rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600/50 file:text-blue-200 hover:file:bg-blue-600/70 focus:outline-none focus:border-blue-500/50 transition-all duration-300`}
              />
              {errors.videofile && (
                <p className="text-red-400 text-sm mt-1">{errors.videofile}</p>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label
                htmlFor="thumbnail"
                className="block text-sm font-medium text-slate-300 mb-3"
              >
                Thumbnail *
              </label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800/50 border ${
                  errors.thumbnail ? "border-red-500" : "border-slate-600/50"
                } rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-600/50 file:text-green-200 hover:file:bg-green-600/70 focus:outline-none focus:border-blue-500/50 transition-all duration-300`}
              />
              {errors.thumbnail && (
                <p className="text-red-400 text-sm mt-1">{errors.thumbnail}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <p className="text-red-400 text-sm text-center">
                {errors.general}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
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
          </form>
        </div>
      </div>
    </div>
  );
}
