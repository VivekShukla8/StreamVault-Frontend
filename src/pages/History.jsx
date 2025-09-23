import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getWatchHistory, removeFromWatchHistory } from "../api/user";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";

export default function History() {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent, oldest, alphabetical

  useEffect(() => {
    if (user) {
      fetchWatchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWatchHistory();
      console.log('Full API response:', response); // Debug log
      console.log('Response data:', response.data); // Debug log
      console.log('Response data.data:', response.data?.data); // Debug log
      console.log('Response data type:', typeof response.data?.data); // Debug log
      
      // The API returns the watchHistory array directly in response.data.data
      const historyData = response.data?.data || [];
      console.log('Final history data:', historyData); // Debug log
      console.log('History data length:', historyData?.length); // Debug log
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching watch history:', err);
      setError('Failed to load watch history');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const watchDate = new Date(date);
    const diffInSeconds = Math.floor((now - watchDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
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

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire watch history?')) {
      setHistory([]);
      // TODO: Call API to clear history on backend
    }
  };

  const removeFromHistory = async (videoId) => {
    try {
      await removeFromWatchHistory(videoId);
      setHistory(prev => prev.filter(video => video._id !== videoId));
    } catch (error) {
      console.error('Error removing video from history:', error);
      setError('Failed to remove video from history');
    }
  };

  // Filter and sort videos
  const filteredHistory = history
    .filter(video => 
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          // For oldest, reverse the natural order
          return history.indexOf(a) - history.indexOf(b);
        case 'alphabetical':
          return a.title?.localeCompare(b.title) || 0;
        case 'recent':
        default:
          // For recent, use the natural order from database (most recent first)
          return history.indexOf(b) - history.indexOf(a);
      }
    });

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-slate-900/80 via-gray-900/80 to-zinc-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🕒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view history</h2>
          <p className="text-slate-400 mb-6">Keep track of what you watch to build your perfect viewing experience</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
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
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🕒</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Watch History</h1>
              <p className="text-slate-400">
                {history.length} {history.length === 1 ? 'video' : 'videos'} watched
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gradient-to-r from-slate-900/50 via-gray-900/50 to-zinc-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>

            <div className="flex gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all duration-300"
              >
                <option value="recent">Recently watched</option>
                <option value="oldest">Oldest first</option>
                <option value="alphabetical">A-Z</option>
              </select>

              {/* Clear History */}
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-900/50 border border-red-700/50 text-red-300 rounded-xl hover:bg-red-900/70 hover:border-red-600/50 transition-all duration-300"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-2xl">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchWatchHistory}
              className="mt-2 px-4 py-2 bg-red-700/50 text-red-200 rounded-xl hover:bg-red-700/70 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* History Content */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-slate-900/50 via-gray-900/50 to-zinc-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📺</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {searchQuery ? 'No videos found' : 'No history yet'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Videos you watch will appear here'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-blue-600/50 text-blue-200 rounded-xl hover:bg-blue-600/70 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((video, index) => (
              <div
                key={video._id || index}
                className="group bg-gradient-to-r from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-900/50 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <Link to={`/video/${video._id}`} className="relative flex-shrink-0 group">
                    <img
                      src={video.thumbnail || '/api/placeholder/320/180'}
                      alt={video.title}
                      className="w-40 h-24 object-contain bg-gray-900 rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg">
                      {formatDuration(video.duration)}
                    </div>
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                        <span className="text-black text-sm">▶</span>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/video/${video._id}`} className="block group">
                      <h3 className="font-semibold text-white text-lg line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">
                        {video.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                      <Link
                        to={`/channel/${video.owner?._id}`}
                        className="hover:text-white transition-colors duration-300"
                      >
                        {video.owner?.username || 'Unknown Channel'}
                      </Link>
                      <span>•</span>
                      <span>{formatViews(video.views)} views</span>
                      <span>•</span>
                      <span>Added to history</span>
                    </div>

                    {video.description && (
                      <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-start">
                    <button
                      onClick={() => removeFromHistory(video._id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-300"
                      title="Remove from history"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}