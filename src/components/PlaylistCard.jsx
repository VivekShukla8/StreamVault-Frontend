import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import EditPlaylistModal from "./EditPlaylistModal";
import { playlistAPI } from "../api/playlist";

export default function PlaylistCard({ playlist, onDelete, onUpdate, formatTimeAgo }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [playlistData, setPlaylistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  // Fetch full playlist data with video details
  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      try {
        setLoading(true);
        // Fetch full playlist data that includes video objects with thumbnails
        const response = await playlistAPI.getPlaylistById(playlist._id);
        const fullPlaylist = response.data?.data;
        
        console.log('Full playlist with videos:', fullPlaylist);
        console.log('Actual video objects count:', fullPlaylist?.videos?.length);
        setPlaylistData(fullPlaylist);
      } catch (err) {
        console.error('Error fetching playlist details:', err);
        // Fallback to prop data if fetch fails
        setPlaylistData(playlist);
      } finally {
        setLoading(false);
      }
    };

    if (playlist._id) {
      fetchPlaylistDetails();
    }
  }, [playlist._id]);

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
      throw err;
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(playlist._id);
    setShowDropdown(false);
  };

  const getFirstVideoThumbnail = () => {
    if (!playlistData) return null;
    
    // Check if videos array has video objects (not just IDs)
    if (playlistData.videos && Array.isArray(playlistData.videos) && playlistData.videos.length > 0) {
      const firstVideo = playlistData.videos[0];
      
      // If it's a video object (not just an ID string)
      if (typeof firstVideo === 'object' && firstVideo !== null) {
        console.log('First video object:', firstVideo);
        return firstVideo.thumbnail || firstVideo.thumbnailUrl || null;
      }
    }
    
    return null;
  };

  const getVideoCount = () => {
    // Use the fetched playlistData which has the actual video objects
    if (playlistData && playlistData.videos && Array.isArray(playlistData.videos)) {
      // Count only valid video objects (not null or undefined)
      const validVideos = playlistData.videos.filter(video => 
        video && typeof video === 'object' && video._id
      );
      console.log('Valid videos count:', validVideos.length);
      return validVideos.length;
    }
    
    // Fallback: if playlistData not loaded yet, return 0
    return 0;
  };

  const thumbnailUrl = getFirstVideoThumbnail();
  const videoCount = getVideoCount();

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 animate-pulse">
        <div className="aspect-video bg-zinc-800"></div>
        <div className="p-5">
          <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <Link to={`/playlist/${playlist._id}`} className="block">
          <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 transform hover:-translate-y-1">
            {/* Thumbnail Container */}
            <div className="relative aspect-video bg-zinc-950 overflow-hidden">
              {thumbnailUrl ? (
                <>
                  <img
                    src={thumbnailUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      console.log('Image failed to load:', thumbnailUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback */}
                  <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                    <div className="text-center">
                      <svg className="w-20 h-20 text-zinc-700 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                      </svg>
                      <p className="text-zinc-600 text-sm font-medium">No Thumbnail</p>
                    </div>
                  </div>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                  <div className="text-center">
                    <svg className="w-20 h-20 text-zinc-700 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                    </svg>
                    <p className="text-zinc-600 text-sm font-medium">
                      {videoCount === 0 ? 'Empty Playlist' : 'No Thumbnail Available'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Video count badge - Bottom Right */}
              <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                </div>
              </div>

              {/* Playlist badge - Top Left */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-black text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                PLAYLIST
              </div>

              {/* Play overlay on hover - only show if there are videos */}
              {videoCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Playlist Info */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-white line-clamp-2 group-hover:text-white transition-colors mb-2 leading-snug">
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
                      {playlist.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="font-medium">Created {formatTimeAgo(playlist.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Options dropdown - Outside Link */}
        <div className="absolute top-6 right-6 z-10" ref={dropdownRef}>
          <button
            onClick={handleDropdownToggle}
            className="p-2.5 text-white hover:text-white transition-all bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full border border-white/10 hover:border-white/20 shadow-lg hover:shadow-xl transform hover:scale-110"
            title="More options"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 min-w-[180px] overflow-hidden animate-fade-in">
              <button
                onClick={handleEdit}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-zinc-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                <span className="font-medium">Edit playlist</span>
              </button>
              <div className="border-t border-zinc-800"></div>
              <button
                onClick={handleDelete}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                <span className="font-medium">Delete playlist</span>
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

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}