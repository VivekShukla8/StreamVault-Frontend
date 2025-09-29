import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { likeAPI } from "../api/like";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";

export default function LikedVideos() {
  const { user } = useContext(AuthContext);
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    if (user) {
      fetchLikedVideos();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await likeAPI.getLikedVideos(user._id);
      const videos = response.data?.data || [];
      setLikedVideos(videos);
    } catch (err) {
      console.error('Error fetching liked videos:', err);
      setError('Failed to load liked videos');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const likedDate = new Date(date);
    const diffInSeconds = Math.floor((now - likedDate) / 1000);
    
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

  const removeLike = async (videoId) => {
    try {
      await likeAPI.toggleVideoLike(videoId);
      setLikedVideos(prev => prev.filter(video => video._id !== videoId));
    } catch (error) {
      console.error('Error removing like:', error);
      setError('Failed to remove like');
    }
  };

  const filteredVideos = likedVideos
    .filter(video => 
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.owner?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.likedAt) - new Date(b.likedAt);
        case 'alphabetical':
          return a.title?.localeCompare(b.title) || 0;
        case 'recent':
        default:
          return new Date(b.likedAt) - new Date(a.likedAt);
      }
    });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gray-950/70 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-600/20">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-3">
              Access Liked Videos
            </h2>
            <p className="text-gray-400 mb-6">Keep track of videos you love to build your perfect collection</p>
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
            <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-600/20">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text">
                Liked Videos
              </h1>
              <p className="text-gray-400 text-lg">
                {likedVideos.length} {likedVideos.length === 1 ? 'video' : 'videos'} liked
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
                placeholder="Search liked videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/60 border border-gray-800/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
              />
            </div>

            <div className="flex gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-900/60 border border-gray-800/50 rounded-lg text-white focus:outline-none focus:border-pink-500/50 transition-all duration-300 font-medium"
              >
                <option value="recent">Recently liked</option>
                <option value="oldest">Oldest liked first</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl p-5">
            <p className="text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={fetchLikedVideos}
              className="px-5 py-2 bg-red-700/50 hover:bg-red-700/70 text-red-200 rounded-lg transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Liked Videos Content */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-12 max-w-lg mx-auto shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text mb-3">
                {searchQuery ? 'No videos found' : 'No liked videos yet'}
              </h3>
              <p className="text-gray-500 mb-8">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Start liking videos to see them here'
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
            {filteredVideos.map((video, index) => (
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
                      <span>Liked {formatTimeAgo(video.likedAt)}</span>
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
                      onClick={() => removeLike(video._id)}
                      className="p-2.5 text-pink-500 hover:text-pink-400 hover:bg-pink-900/20 rounded-lg transition-all duration-300 shadow-lg"
                      title="Remove from liked videos"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
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