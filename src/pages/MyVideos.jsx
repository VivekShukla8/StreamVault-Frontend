import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { videoAPI } from "../api/video";
import VideoCard from "../components/VideoCard";
import Loader from "../components/Loader";
import ConfirmModal from "../ConfirmModal";
import Toast from "../components/Toast";
import { AuthContext } from "../features/auth/AuthContext";

export default function MyVideos() {
  const { user } = useContext(AuthContext);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for delete
  const [modal, setModal] = useState({ show: false, videoId: null });

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (user?._id) fetchUserVideos();
    else setLoading(false);
  }, [user]);

  const fetchUserVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getAllVideos({ userId: user._id, limit: 50 });
      const userVideos = response.data?.data?.videos || response.data?.videos || [];
      setVideos(userVideos);
    } catch (err) {
      console.error("Error fetching user videos:", err);
      setError("Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Confirm delete video
  const confirmDelete = async () => {
    if (!modal.videoId) return;

    try {
      await videoAPI.deleteVideo(modal.videoId);
      setVideos((prev) => prev.filter((v) => v._id !== modal.videoId));
      setToast({ show: true, message: "Video deleted successfully", type: "success" });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || "Failed to delete video",
        type: "error",
      });
    } finally {
      setModal({ show: false, videoId: null });
    }
  };

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Please log in to view your videos
        </h2>
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="relative p-6">
      {/* Confirm Modal */}
      <ConfirmModal
        show={modal.show}
        title="Delete Video"
        message="Are you sure you want to delete this video? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setModal({ show: false, videoId: null })}
      />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          My Videos ({videos.length})
        </h2>
        <Link
          to="/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
        >
          Upload Video
        </Link>
      </div>

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div key={video._id} className="relative group">
              <VideoCard video={video} />

              {/* Delete Button */}
              <button
                onClick={() => setModal({ show: true, videoId: video._id })}
                className="
                  absolute top-3 right-3 
                  w-10 h-10 flex items-center justify-center 
                  rounded-full bg-white/20 backdrop-blur-sm text-red-500 
                  opacity-90 hover:opacity-100 hover:bg-red-50 
                  transition-all duration-300 shadow-md
                "
                title="Delete Video"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v0a1 1 0 001 1h4a1 1 0 001-1v0a1 1 0 00-1-1m-4 0V3m4 0V3"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-xl font-semibold text-white mb-2">
            No videos available
          </h3>
          <p className="text-gray-400 mb-6">
            Please upload a video to view it here.
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
          >
            Upload Your First Video
          </Link>
        </div>
      )}
    </div>
  );
}
