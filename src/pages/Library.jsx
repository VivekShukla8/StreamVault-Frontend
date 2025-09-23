import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getWatchHistory } from "../api/user";
import { likeAPI } from "../api/like";
import { playlistAPI } from "../api/playlist";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";
import PlaylistCard from "../components/PlaylistCard";

export default function Library() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchLibraryData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all library data in parallel
      const [historyResponse, likedResponse, playlistsResponse] = await Promise.allSettled([
        getWatchHistory(),
        likeAPI.getLikedVideos(user._id),
        playlistAPI.getUserPlaylists(user._id)
      ]);

      // Handle watch history
      if (historyResponse.status === 'fulfilled') {
        const historyData = historyResponse.value.data?.data || [];
        setHistory(historyData.slice(0, 6)); // Show only latest 6
      }

      // Handle liked videos
      if (likedResponse.status === 'fulfilled') {
        const likedData = likedResponse.value.data?.data || [];
        setLikedVideos(likedData.slice(0, 6)); // Show only latest 6
      }

      // Handle playlists
      if (playlistsResponse.status === 'fulfilled') {
        const playlistsData = playlistsResponse.value.data?.data || [];
        setPlaylists(playlistsData.slice(0, 4)); // Show only latest 4
      }

    } catch (err) {
      console.error('Error fetching library data:', err);
      setError('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views?.toString() || '0';
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-slate-900/80 via-gray-900/80 to-zinc-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📚</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to access your library</h2>
          <p className="text-slate-400 mb-6">Keep track of your videos, playlists, and watch history all in one place</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Your Library</h1>
              <p className="text-slate-400">All your content in one place</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-2xl">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchLibraryData}
              className="mt-2 px-4 py-2 bg-red-700/50 text-red-200 rounded-xl hover:bg-red-700/70 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Link
            to="/history"
            className="group bg-gradient-to-br from-slate-900/80 to-gray-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">🕒</span>
            </div>
            <h3 className="font-semibold text-white mb-1">History</h3>
            <p className="text-slate-400 text-sm">{history.length} videos</p>
          </Link>

          <Link
            to="/liked"
            className="group bg-gradient-to-br from-slate-900/80 to-gray-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">❤️</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Liked Videos</h3>
            <p className="text-slate-400 text-sm">{likedVideos.length} videos</p>
          </Link>

          <Link
            to="/playlists"
            className="group bg-gradient-to-br from-slate-900/80 to-gray-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">📋</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Playlists</h3>
            <p className="text-slate-400 text-sm">{playlists.length} playlists</p>
          </Link>

          <Link
            to="/subscriptions"
            className="group bg-gradient-to-br from-slate-900/80 to-gray-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300 hover:scale-105 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-xl">📺</span>
            </div>
            <h3 className="font-semibold text-white mb-1">Subscriptions</h3>
            <p className="text-slate-400 text-sm">Your channels</p>
          </Link>
        </div>

        {/* Recent Watch History */}
        {history.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
              <Link
                to="/history"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((video) => (
                <div key={video._id} className="group">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Liked Videos */}
        {likedVideos.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Recently Liked</h2>
              <Link
                to="/liked"
                className="text-pink-400 hover:text-pink-300 transition-colors text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedVideos.map((video) => (
                <div key={video._id} className="group">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Playlists */}
        {playlists.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
              <Link
                to="/playlists"
                className="text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist._id}
                  playlist={playlist}
                  formatTimeAgo={formatTimeAgo}
                  onDelete={() => {}} // No delete functionality in overview
                  onUpdate={() => {}} // No update functionality in overview
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {history.length === 0 && likedVideos.length === 0 && playlists.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Your library is empty</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Start exploring content to build your personal library. Watch videos, create playlists, and like content to see them here.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
              >
                Explore Videos
              </Link>
              <Link
                to="/trending"
                className="px-6 py-3 bg-slate-800 text-white border border-slate-600 rounded-xl hover:bg-slate-700 hover:border-slate-500 transition-all duration-300 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
              >
                View Trending
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-slate-900/60 to-gray-900/60 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{history.length}</div>
            <div className="text-slate-400 text-sm">Videos Watched</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900/60 to-gray-900/60 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-pink-400">{likedVideos.length}</div>
            <div className="text-slate-400 text-sm">Videos Liked</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900/60 to-gray-900/60 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{playlists.length}</div>
            <div className="text-slate-400 text-sm">Playlists Created</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900/60 to-gray-900/60 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {playlists.reduce((total, playlist) => total + (playlist.videoCount || 0), 0)}
            </div>
            <div className="text-slate-400 text-sm">Total Playlist Videos</div>
          </div>
        </div>
      </div>
    </div>
  );
}