import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import EditPlaylistModal from "./EditPlaylistModal";
import { playlistAPI } from "../api/playlist";

export default function PlaylistCard({ playlist, onDelete, onUpdate, formatTimeAgo }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown]);

  const handleDropdownToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(false);
    setShowEditModal(true);
  };

  const handleUpdatePlaylist = async (updatedData) => {
    try {
      const response = await playlistAPI.updatePlaylist(playlist._id, updatedData);
      if (onUpdate) {
        onUpdate(playlist._id, response.data.data);
      }
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating playlist:', err);
      throw err; // Re-throw to let modal handle error display
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(playlist._id);
    setShowDropdown(false);
  };

  const getFirstVideoThumbnail = () => {
    if (playlist.videos && playlist.videos.length > 0) {
      return playlist.videos[0].thumbnail;
    }
    return null;
  };

  const getVideoCount = () => {
    return playlist.videos ? playlist.videos.length : 0;
  };

  return (
    <>
      <div className="relative">
        <Link to={`/playlist/${playlist._id}`} className="group block">
          <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-800">
              {getFirstVideoThumbnail() ? (
                <img
                  src={getFirstVideoThumbnail()}
                  alt={playlist.name}
                  className="w-full h-full object-contain bg-gray-900"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                  </svg>
                </div>
              )}
              
              {/* Video count overlay */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                {getVideoCount()} videos
              </div>

              {/* Playlist icon overlay */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                PLAYLIST
              </div>
            </div>

            {/* Playlist Info */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors mb-1">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {playlist.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500">
                    Created {formatTimeAgo(playlist.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Options dropdown - Outside Link */}
        <div className="absolute top-4 right-4 z-10" ref={dropdownRef}>
          <button
            onClick={handleDropdownToggle}
            className="p-2 text-gray-400 hover:text-white transition-colors bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full"
            title="More options"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 min-w-[160px] py-1">
              <button
                onClick={handleEdit}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Edit playlist
              </button>
              <div className="border-t border-gray-700"></div>
              <button
                onClick={handleDelete}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete playlist
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Playlist Modal */}
      {showEditModal && (
        <EditPlaylistModal
          playlist={playlist}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdatePlaylist}
        />
      )}
    </>
  );
}