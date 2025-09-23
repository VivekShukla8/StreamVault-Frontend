import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { playlistAPI } from "../api/playlist";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";
import CreatePlaylistModal from "../components/CreatePlaylistModal";
import PlaylistCard from "../components/PlaylistCard";

export default function Playlists() {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await playlistAPI.getUserPlaylists(user._id);
      console.log("Playlists response:", response.data);
      setPlaylists(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch playlists");
      console.error("Error fetching playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (playlistData) => {
    try {
      const response = await playlistAPI.createPlaylist(playlistData);
      console.log("Playlist created:", response.data);
      setPlaylists(prev => [response.data.data, ...prev]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating playlist:", err);
      throw err; // Re-throw to let modal handle error display
    }
  };

  const handleUpdatePlaylist = (playlistId, updatedPlaylist) => {
    setPlaylists(prev => 
      prev.map(playlist => 
        playlist._id === playlistId ? updatedPlaylist : playlist
      )
    );
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) {
      return;
    }
    
    try {
      await playlistAPI.deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(playlist => playlist._id !== playlistId));
    } catch (err) {
      console.error("Error deleting playlist:", err);
      alert("Failed to delete playlist");
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const playlistDate = new Date(date);
    
    // Check if date is valid
    if (isNaN(playlistDate.getTime())) {
      return 'Unknown time';
    }
    
    const diffInSeconds = Math.floor((now - playlistDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-gray-900 rounded-lg p-8">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <h2 className="text-xl font-semibold mb-4">Please log in to view your playlists</h2>
          <Link 
            to="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Playlists</h1>
          <p className="text-gray-400">Manage and organize your video collections</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2v20M2 12h20"/>
          </svg>
          Create Playlist
        </button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
            </svg>
            <h3 className="text-xl font-semibold mb-2">No playlists yet</h3>
            <p className="text-gray-400 mb-4">Create your first playlist to start organizing your favorite videos</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Playlist
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist._id}
              playlist={playlist}
              onDelete={handleDeletePlaylist}
              onUpdate={handleUpdatePlaylist}
              formatTimeAgo={formatTimeAgo}
            />
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePlaylist}
        />
      )}
    </div>
  );
}