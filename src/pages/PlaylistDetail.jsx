import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { playlistAPI } from "../api/playlist";
import { videoAPI } from "../api/video";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";
import AddVideoModal from "../components/AddVideoModal";
import EditPlaylistModal from "../components/EditPlaylistModal";

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlaylist();
    }
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await playlistAPI.getPlaylistById(id);
      console.log("Playlist detail response:", response.data);
      setPlaylist(response.data.data);
    } catch (err) {
      setError("Failed to fetch playlist");
      console.error("Error fetching playlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async (videoId) => {
    try {
      const response = await playlistAPI.addVideoToPlaylist(id, videoId);
      console.log("Video added to playlist:", response.data);
      setPlaylist(response.data.data);
      setShowAddVideoModal(false);
    } catch (err) {
      console.error("Error adding video to playlist:", err);
      throw err;
    }
  };

  const handleRemoveVideo = async (videoId) => {
    if (!window.confirm("Remove this video from the playlist?")) {
      return;
    }

    try {
      const response = await playlistAPI.removeVideoFromPlaylist(id, videoId);
      console.log("Video removed from playlist:", response.data);
      setPlaylist(response.data.data);
    } catch (err) {
      console.error("Error removing video from playlist:", err);
      alert("Failed to remove video from playlist");
    }
  };

  const handleUpdatePlaylist = async (updateData) => {
    try {
      const response = await playlistAPI.updatePlaylist(id, updateData);
      console.log("Playlist updated:", response.data);
      setPlaylist(response.data.data);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating playlist:", err);
      throw err;
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) {
      return;
    }

    try {
      await playlistAPI.deletePlaylist(id);
      navigate("/playlists");
    } catch (err) {
      console.error("Error deleting playlist:", err);
      alert("Failed to delete playlist");
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

  if (loading) return <Loader />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="text-center text-red-400 bg-red-900/20 border border-red-700/30 rounded-xl sm:rounded-2xl p-6 sm:p-8">
        {error}
      </div>
    </div>
  );
  if (!playlist) return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="text-center text-slate-400 bg-slate-900/40 border border-slate-700/30 rounded-xl sm:rounded-2xl p-6 sm:p-8">
        Playlist not found
      </div>
    </div>
  );

  const isOwner = user && user._id === playlist.owner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Playlist Header */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Playlist Thumbnail - Hidden on mobile, shown on sm+ */}
          <div className="hidden sm:block lg:w-80 flex-shrink-0">
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
              {playlist.videos && playlist.videos.length > 0 ? (
                <img
                  src={playlist.videos[0].thumbnail}
                  alt={playlist.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Playlist Info */}
          <div className="flex-1 min-w-0">
            <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 break-words">
                    {playlist.name}
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base mb-3 sm:mb-4 break-words">
                    {playlist.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
                    <span className="font-medium">{playlist.videos?.length || 0} videos</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Created {formatTimeAgo(playlist.createdAt)}</span>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-3 sm:px-4 py-2 bg-slate-700 text-white text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-slate-600 transition-all duration-300 shadow-lg hover:shadow-slate-500/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeletePlaylist}
                      className="px-3 sm:px-4 py-2 bg-red-600 text-white text-sm sm:text-base rounded-lg sm:rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {playlist.videos && playlist.videos.length > 0 && (
                  <Link
                    to={`/video/${playlist.videos[0]._id}?playlist=${playlist._id}`}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-white to-slate-100 text-black rounded-lg sm:rounded-xl hover:from-slate-100 hover:to-slate-200 transition-all duration-300 font-medium text-sm sm:text-base shadow-xl hover:shadow-2xl"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Play All
                  </Link>
                )}
                
                {isOwner && (
                  <button
                    onClick={() => setShowAddVideoModal(true)}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm sm:text-base shadow-xl hover:shadow-blue-500/20"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    Add Videos
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Videos List */}
        <div className="space-y-3 sm:space-y-4">
          {playlist.videos && playlist.videos.length > 0 ? (
            playlist.videos.map((video, index) => (
              <div 
                key={video._id} 
                className="group bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4">
                  {/* Index Number - Hidden on mobile, shown on desktop */}
                  <div className="hidden sm:flex flex-shrink-0 items-center justify-center text-slate-400 font-bold text-base sm:text-lg w-8 sm:w-10">
                    {index + 1}
                  </div>
                  
                  {/* Thumbnail */}
                  <Link 
                    to={`/video/${video._id}?playlist=${playlist._id}`} 
                    className="relative flex-shrink-0 w-full sm:w-40 md:w-48 lg:w-56"
                  >
                    <div className="aspect-video bg-slate-800 rounded-lg sm:rounded-xl overflow-hidden border border-slate-700/30 group-hover:border-blue-500/30 transition-all duration-300">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                      
                      {/* Mobile Index Badge */}
                      <div className="sm:hidden absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs font-bold">
                        #{index + 1}
                      </div>
                    </div>
                  </Link>
                  
                  {/* Video Info */}
                  <Link 
                    to={`/video/${video._id}?playlist=${playlist._id}`} 
                    className="flex-1 min-w-0 space-y-1 sm:space-y-1.5"
                  >
                    {/* Title */}
                    <h3 className="font-semibold text-white text-sm sm:text-base lg:text-lg line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
                      {video.title}
                    </h3>
                    
                    {/* Username - Mobile: First line with distinct styling */}
                    <div className="text-xs sm:text-sm">
                      <span className="font-bold text-blue-400">
                        {video.uploader?.username || video.owner?.username || 'Unknown'}
                      </span>
                    </div>
                    
                    {/* Description - Only on mobile with italic styling */}
                    {video.description && (
                      <p className="sm:hidden text-xs text-slate-400 italic line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                    
                    {/* Views and Time */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-400">
                      <span>{formatViews(video.views)} views</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="sm:hidden">·</span>
                      <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>
                  </Link>

                  {/* Remove Button */}
                  {isOwner && (
                    <button
                      onClick={() => handleRemoveVideo(video._id)}
                      className="flex-shrink-0 self-start sm:self-center p-2 sm:p-2.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg sm:rounded-xl transition-all duration-300"
                      title="Remove from playlist"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
                        <div className="flex items-center justify-center py-8 sm:py-12 lg:py-16">
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 max-w-md mx-auto border border-slate-700/50 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">No videos in this playlist</h3>
                <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6">Start adding videos to build your collection</p>
                {isOwner && (
                  <button
                    onClick={() => setShowAddVideoModal(true)}
                    className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-blue-500/20"
                  >
                    Add Your First Video
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddVideoModal && (
        <AddVideoModal
          onClose={() => setShowAddVideoModal(false)}
          onAddVideo={handleAddVideo}
          playlistId={id}
        />
      )}

      {showEditModal && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdatePlaylist}
        />
      )}
    </div>
  );
}