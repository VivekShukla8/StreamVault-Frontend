import React, { useState, useEffect } from "react";
import { videoAPI } from "../api/video";

export default function AddVideoModal({ onClose, onAddVideo, playlistId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState(new Set());

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = videos.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchQuery, videos]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getAllVideos({ limit: 50 });
      console.log("Videos for playlist:", response.data);
      setVideos(response.data.data.videos || []);
      setFilteredVideos(response.data.data.videos || []);
    } catch (err) {
      setError("Failed to fetch videos");
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (videoId) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleAddSelected = async () => {
    const selectedArray = Array.from(selectedVideos);
    if (selectedArray.length === 0) {
      setError("Please select at least one video");
      return;
    }

    try {
      setError("");
      // Add videos one by one (could be optimized with batch endpoint)
      for (const videoId of selectedArray) {
        await onAddVideo(videoId);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add videos to playlist");
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views?.toString() || '0';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const videoDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(videoDate.getTime())) {
      return 'Unknown time';
    }
    
    const diffInSeconds = Math.floor((now - videoDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Add Videos to Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-700">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
            />
          </div>
        </div>

        {/* Videos List */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchQuery ? "No videos found matching your search" : "No videos available"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVideos.map((video) => (
                <div
                  key={video._id}
                  className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                    selectedVideos.has(video._id)
                      ? 'border-blue-500 bg-blue-600 bg-opacity-20'
                      : 'border-transparent bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => handleVideoSelect(video._id)}
                >
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedVideos.has(video._id)}
                      onChange={() => handleVideoSelect(video._id)}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>

                  <div className="w-24 aspect-video bg-gray-700 rounded overflow-hidden flex-shrink-0">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-contain bg-gray-900"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-1 line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="text-sm text-gray-400">
                      <div>{video.uploader?.username || 'Unknown'}</div>
                      <div>{formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {selectedVideos.size} video{selectedVideos.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedVideos.size === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add {selectedVideos.size} Video{selectedVideos.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}