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
      throw err;
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gray-950/70 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-500/20">
              <svg className="w-10 h-10 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-3">
              Access Your Playlists
            </h2>
            <p className="text-gray-400 mb-6">Please log in to view and manage your video collections</p>
            <Link 
              to="/login"
              className="inline-block px-8 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl p-8 text-center max-w-md shadow-lg">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <p className="text-red-400 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-2">
              Your Playlists
            </h1>
            <p className="text-gray-400 text-lg">Manage and organize your video collections</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Create Playlist
          </button>
        </div>

        {/* Playlists Grid */}
        {playlists.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-12 max-w-lg w-full text-center shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text mb-2">
                No playlists yet
              </h3>
              <p className="text-gray-500 text-lg mb-8">
                Create your first playlist to start organizing your favorite videos
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
              >
                Create Your First Playlist
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist, index) => (
              <div
                key={playlist._id}
                style={{animationDelay: `${index * 100}ms`}}
                className="animate-fade-in"
              >
                <PlaylistCard
                  playlist={playlist}
                  onDelete={handleDeletePlaylist}
                  onUpdate={handleUpdatePlaylist}
                  formatTimeAgo={formatTimeAgo}
                />
              </div>
            ))}
          </div>
        )}

        {/* Playlist count badge */}
        {playlists.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-block px-6 py-3 bg-gray-950/70 backdrop-blur-sm border border-gray-800/50 rounded-full">
              <p className="text-gray-400 text-sm font-medium">
                <span className="text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text font-bold">
                  {playlists.length}
                </span>
                {' '}{playlists.length === 1 ? 'Playlist' : 'Playlists'} in your collection
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePlaylist}
        />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}