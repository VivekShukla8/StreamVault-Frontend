import React, { useState, useEffect, useContext, useRef } from "react";
import { playlistAPI } from "../api/playlist";
import { AuthContext } from "../features/auth/AuthContext";

export default function AddToPlaylistDropdown({ videoId, onClose }) {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAbove, setShowAbove] = useState(false);
  const dropdownRef = useRef(null);
  const [newPlaylistData, setNewPlaylistData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  // Position detection effect
  useEffect(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // If there's more space above and not enough space below, show above
      if (spaceBelow < 350 && spaceAbove > spaceBelow) {
        setShowAbove(true);
      } else {
        setShowAbove(false);
      }
    }
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const response = await playlistAPI.getUserPlaylists(user._id);
      setPlaylists(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch playlists");
      console.error("Error fetching playlists:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await playlistAPI.addVideoToPlaylist(playlistId, videoId);
      alert("Video added to playlist successfully!");
      onClose();
    } catch (err) {
      console.error("Error adding to playlist:", err);
      alert(err.response?.data?.message || "Failed to add video to playlist");
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    
    if (!newPlaylistData.name.trim()) {
      setError("Playlist name is required");
      return;
    }

    try {
      setError("");
      const response = await playlistAPI.createPlaylist(newPlaylistData);
      const newPlaylist = response.data.data;
      
      // Add video to the newly created playlist
      await playlistAPI.addVideoToPlaylist(newPlaylist._id, videoId);
      
      alert("Playlist created and video added successfully!");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create playlist");
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className={`absolute right-0 ${showAbove ? 'bottom-full mb-1' : 'top-full mt-1'} bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-[1000] min-w-[280px] max-w-[320px] backdrop-blur-xl `}
    >
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-3">Save to playlist</h3>
        
        {error && (
          <div className="mb-3 p-2 bg-red-600 bg-opacity-20 border border-red-600 rounded text-red-400 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
        ) : (
          <>
            {/* Existing playlists */}
            {playlists.length > 0 && (
              <div className="max-h-32 overflow-y-auto mb-3">
                {playlists.map((playlist) => (
                  <button
                    key={playlist._id}
                    onClick={() => handleAddToPlaylist(playlist._id)}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-gray-700/60 rounded-lg transition-all duration-300 flex items-center gap-3 group active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <span className="truncate text-white group-hover:text-blue-300 transition-colors duration-300">{playlist.name}</span>
                    <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Show message when no playlists exist - Following project specification */}
            {playlists.length === 0 && (
              <div className="mb-3 p-3 bg-gradient-to-r from-gray-700/40 to-gray-600/40 rounded-lg border border-gray-600/40 backdrop-blur-sm">
                <p className="text-sm text-gray-300 text-center mb-2 font-medium">No playlists yet</p>
                <p className="text-xs text-gray-400 text-center">Create your first playlist below to get started</p>
              </div>
            )}

            {/* Create new playlist section - Following project specification for prominence */}
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-700/60 rounded-lg transition-all duration-300 flex items-center gap-3 group active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95 ${playlists.length > 0 ? 'border-t border-gray-700/50 mt-3 pt-4' : ''}`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <span className="text-blue-400 font-semibold group-hover:text-blue-300 transition-colors duration-300">Create new playlist</span>
                <svg className="w-4 h-4 text-gray-400 ml-auto group-hover:text-blue-400 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            ) : (
              <form onSubmit={handleCreatePlaylist} className={`${playlists.length > 0 ? 'border-t border-gray-700/50 pt-4 mt-3' : ''}`}>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Playlist name"
                    value={newPlaylistData.name}
                    onChange={(e) => setNewPlaylistData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600/60 rounded-lg text-sm focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm"
                    maxLength={50}
                    required
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newPlaylistData.description}
                    onChange={(e) => setNewPlaylistData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700/60 border border-gray-600/60 rounded-lg text-sm resize-none focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm"
                    rows={2}
                    maxLength={200}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 hover:bg-gray-700/40 rounded-lg active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95 font-medium"
                  >
                    Create & Add
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}