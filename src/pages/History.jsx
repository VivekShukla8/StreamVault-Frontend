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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)} yr ago`;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950 flex items-center justify-center p-3 sm:p-4 md:p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-md w-full px-3 sm:px-4">
          <div className="relative bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/5 text-center shadow-2xl">
            <div className="relative inline-flex mb-6 sm:mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Track Your Journey
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400 mb-6 sm:mb-8 leading-relaxed">
              Sign in to keep track of your watch history and build your perfect viewing experience
            </p>
            
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl sm:rounded-2xl font-semibold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Sign In Now
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-48 h-48 sm:w-64 sm:h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] bg-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/5 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl blur-xl opacity-60"></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-1">
                  Watch History
                </h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-400">
                  {history.length} {history.length === 1 ? 'video' : 'videos'} watched
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 bg-slate-900/60 border border-white/5 rounded-xl text-white text-sm sm:text-base placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                />
              </div>

              <div className="flex gap-2 sm:gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-slate-900/60 border border-white/5 rounded-xl text-white text-xs sm:text-sm md:text-base focus:outline-none focus:border-blue-500/50 transition-all duration-300 font-medium"
                >
                  <option value="recent">Recent</option>
                  <option value="oldest">Oldest</option>
                  <option value="alphabetical">A-Z</option>
                </select>

                {/* Clear History */}
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 font-semibold text-xs sm:text-sm transform hover:scale-105 whitespace-nowrap"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <p className="text-red-400 text-sm sm:text-base font-medium mb-3">{error}</p>
            <button
              onClick={fetchWatchHistory}
              className="px-4 sm:px-5 py-2 bg-red-700/50 hover:bg-red-700/70 text-red-200 rounded-lg transition-colors font-semibold text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* History Content */}
        {filteredHistory.length === 0 ? (
          <div className="flex items-center justify-center py-12 sm:py-16 md:py-20">
            <div className="relative max-w-lg w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-white/5 text-center shadow-2xl">
                <div className="relative inline-flex mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/20 to-slate-600/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z"/>
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                  {searchQuery ? 'No videos found' : 'No history yet'}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-400 mb-6 sm:mb-8 leading-relaxed px-2">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Videos you watch will appear here'
                  }
                </p>
                
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:gap-5">
            {filteredHistory.map((video, index) => (
              <div
                key={video._id || index}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards',
                  opacity: 0
                }}
                className="group bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden hover:border-white/10 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
              >
                {/* Mobile Layout */}
                <div className="sm:hidden">
                  <Link to={`/video/${video._id}`} className="block relative group/thumb">
                    <img
                      src={video.thumbnail || '/api/placeholder/320/180'}
                      alt={video.title}
                      className="w-full aspect-video object-cover bg-slate-900"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-semibold">
                      {formatDuration(video.duration)}
                    </div>
                  </Link>
                  
                  <div className="p-3 flex gap-3">
                    <div className="flex-1 min-w-0">
                      <Link to={`/video/${video._id}`} className="block mb-2">
                        <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug">
                          {video.title}
                        </h3>
                      </Link>
                      
                      <Link
                        to={`/channel/${video.owner?._id}`}
                        className="block text-blue-400 hover:text-blue-300 text-xs font-semibold italic mb-1.5 truncate"
                      >
                        {video.owner?.username || 'Unknown'}
                      </Link>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                        <span className="font-medium">{formatViews(video.views)} views</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span className="font-medium">{formatTimeAgo(video.createdAt)}</span>
                      </div>
                      
                      {video.description && (
                        <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeFromHistory(video._id)}
                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-300 active:scale-95"
                      title="Remove from history"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex gap-4 md:gap-5 p-4 md:p-5">
                  {/* Thumbnail */}
                  <Link to={`/video/${video._id}`} className="relative flex-shrink-0 group/thumb w-40 md:w-48 lg:w-56">
                    <img
                      src={video.thumbnail || '/api/placeholder/320/180'}
                      alt={video.title}
                      className="w-full h-24 md:h-28 lg:h-32 object-cover bg-slate-900 rounded-lg group-hover/thumb:scale-105 transition-transform duration-300 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 rounded-lg transition-colors duration-300" />
                    <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm font-semibold">
                      {formatDuration(video.duration)}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/video/${video._id}`} className="block group/title">
                      <h3 className="font-bold text-white text-base md:text-lg line-clamp-2 group-hover/title:text-transparent group-hover/title:bg-gradient-to-r group-hover/title:from-blue-400 group-hover/title:to-purple-400 group-hover/title:bg-clip-text transition-all duration-300 mb-2">
                        {video.title}
                      </h3>
                    </Link>
                    
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-2">
                      <Link
                        to={`/channel/${video.owner?._id}`}
                        className="hover:text-white transition-colors duration-300 font-medium truncate max-w-[150px] sm:max-w-none"
                      >
                        {video.owner?.username || 'Unknown'}
                      </Link>
                      <span>•</span>
                      <span className="whitespace-nowrap">{formatViews(video.views)} views</span>
                      <span>•</span>
                      <span className="whitespace-nowrap">{formatTimeAgo(video.createdAt)}</span>
                    </div>

                    {video.description && (
                      <p className="text-slate-500 text-sm line-clamp-2 hidden md:block">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-start">
                    <button
                      onClick={() => removeFromHistory(video._id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-300"
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}