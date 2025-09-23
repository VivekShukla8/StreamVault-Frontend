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

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!playlist) return <div className="text-center p-8">Playlist not found</div>;

  const isOwner = user && user._id === playlist.owner;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Playlist Header */}
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        {/* Playlist Thumbnail */}
        <div className="lg:w-80">
          <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {playlist.videos && playlist.videos.length > 0 ? (
              <img
                src={playlist.videos[0].thumbnail}
                alt={playlist.name}
                className="w-full h-full object-contain bg-gray-900"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-20 h-20 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Playlist Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{playlist.name}</h1>
              <p className="text-gray-400 mb-4">{playlist.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{playlist.videos?.length || 0} videos</span>
                <span>•</span>
                <span>Created {formatTimeAgo(playlist.createdAt)}</span>
              </div>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDeletePlaylist}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {playlist.videos && playlist.videos.length > 0 && (
              <Link
                to={`/video/${playlist.videos[0]._id}?playlist=${playlist._id}`}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play All
              </Link>
            )}
            
            {isOwner && (
              <button
                onClick={() => setShowAddVideoModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Add Videos
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Videos List */}
      <div className="space-y-4">
        {playlist.videos && playlist.videos.length > 0 ? (
          playlist.videos.map((video, index) => (
            <div key={video._id} className="flex gap-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex-shrink-0 text-gray-400 font-medium w-8 text-center">
                {index + 1}
              </div>
              
              <Link to={`/video/${video._id}?playlist=${playlist._id}`} className="flex gap-4 flex-1">
                <div className="w-40 aspect-video bg-gray-800 rounded overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-contain bg-gray-900"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-white mb-1 line-clamp-2 hover:text-blue-400 transition-colors">
                    {video.title}
                  </h3>
                  <div className="text-sm text-gray-400">
                    <div className="mb-1">{video.uploader?.username || video.owner?.username || 'Unknown'}</div>
                    <div>{formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}</div>
                  </div>
                </div>
              </Link>

              {isOwner && (
                <button
                  onClick={() => handleRemoveVideo(video._id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Remove from playlist"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <h3 className="text-xl font-semibold mb-2">No videos in this playlist</h3>
              <p className="text-gray-400 mb-4">Start adding videos to build your collection</p>
              {isOwner && (
                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Video
                </button>
              )}
            </div>
          </div>
        )}
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