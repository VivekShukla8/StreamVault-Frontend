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
  const [sortBy, setSortBy] = useState("recent");

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
      const historyData = response.data?.data || [];
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

  const filteredHistory = history
    .filter(video => 
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return history.indexOf(a) - history.indexOf(b);
        case 'alphabetical':
          return a.title?.localeCompare(b.title) || 0;
        case 'recent':
        default:
          return history.indexOf(b) - history.indexOf(a);
      }
    });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gray-950/70 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-500/20">
              <svg className="w-10 h-10 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-3">
              Access Your History
            </h2>
            <p className="text-gray-400 mb-6">Keep track of what you watch to build your perfect viewing experience</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text">
                Watch History
              </h1>
              <p className="text-gray-400 text-lg">
                {history.length} {history.length === 1 ? 'video' : 'videos'} watched
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/60 border border-gray-800/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>

            <div className="flex gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-900/60 border border-gray-800/50 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-all duration-300 font-medium"
              >
                <option value="recent">Recently watched</option>
                <option value="oldest">Oldest first</option>
                <option value="alphabetical">A-Z</option>
              </select>

              {/* Clear History */}
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-600 hover:to-red-700 border border-red-600/50 text-white rounded-lg transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl p-5">
            <p className="text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={fetchWatchHistory}
              className="px-5 py-2 bg-red-700/50 hover:bg-red-700/70 text-red-200 rounded-lg transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* History Content */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-12 max-w-lg mx-auto shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text mb-3">
                {searchQuery ? 'No videos found' : 'No history yet'}
              </h3>
              <p className="text-gray-500 mb-8">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Videos you watch will appear here'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2.5 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-lg transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
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
                style={{animationDelay: `${index * 50}ms`}}
                className="group bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-5 hover:border-gray-700/70 hover:shadow-xl transition-all duration-300 animate-fade-in"
              >
                <div className="flex gap-5">
                  {/* Thumbnail */}
                  <Link to={`/video/${video._id}`} className="relative flex-shrink-0 group/thumb">
                    <img
                      src={video.thumbnail || '/api/placeholder/320/180'}
                      alt={video.title}
                      className="w-48 h-28 object-cover bg-gray-900 rounded-lg group-hover/thumb:scale-105 transition-transform duration-300 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 rounded-lg transition-colors duration-300" />
                    <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm font-semibold">
                      {formatDuration(video.duration)}
                    </div>
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/video/${video._id}`} className="block group/title">
                      <h3 className="font-bold text-white text-lg line-clamp-2 group-hover/title:text-transparent group-hover/title:bg-gradient-to-r group-hover/title:from-slate-200 group-hover/title:to-slate-400 group-hover/title:bg-clip-text transition-all duration-300">
                        {video.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-400">
                      <Link
                        to={`/channel/${video.owner?._id}`}
                        className="hover:text-white transition-colors duration-300 font-medium"
                      >
                        {video.owner?.username || 'Unknown Channel'}
                      </Link>
                      <span>•</span>
                      <span>{formatViews(video.views)} views</span>
                      <span>•</span>
                      <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>

                    {video.description && (
                      <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-start">
                    <button
                      onClick={() => removeFromHistory(video._id)}
                      className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-300"
                      title="Remove from history"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}