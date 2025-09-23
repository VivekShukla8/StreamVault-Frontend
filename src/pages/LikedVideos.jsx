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
  const [sortBy, setSortBy] = useState("recent"); // recent, oldest, alphabetical

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
      console.log('Liked videos response:', response.data);
      
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

  // Filter and sort videos
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
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-slate-900/80 via-gray-900/80 to-zinc-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 max-w-md w-full shadow-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/25">
            <span className="text-3xl">❤️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view liked videos</h2>
          <p className="text-slate-400 mb-6">Keep track of videos you love to build your perfect collection</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white font-medium rounded-2xl hover:from-pink-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/25 hover:scale-105"
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
            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
              <span className="text-2xl">❤️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Liked Videos</h1>
              <p className="text-slate-400">
                {likedVideos.length} {likedVideos.length === 1 ? 'video' : 'videos'} liked
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gradient-to-r from-slate-900/50 via-gray-900/50 to-zinc-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-xl">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Search liked videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all duration-300"
              />
            </div>

            <div className="flex gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:border-pink-500/50 transition-all duration-300"
              >
                <option value="recent">Recently liked</option>
                <option value="oldest">Oldest liked first</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-2xl backdrop-blur-sm">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchLikedVideos}
              className="mt-2 px-4 py-2 bg-red-700/50 text-red-200 rounded-xl hover:bg-red-700/70 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Liked Videos Content */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-slate-900/50 via-gray-900/50 to-zinc-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 max-w-md mx-auto shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl">💔</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {searchQuery ? 'No videos found' : 'No liked videos yet'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Start liking videos to see them here'
                }
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-pink-600/50 text-pink-200 rounded-xl hover:bg-pink-600/70 transition-colors shadow-lg hover:shadow-pink-500/25"
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
                className="group bg-gradient-to-r from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-4 hover:border-slate-600/50 hover:shadow-xl hover:shadow-slate-900/50 transition-all duration-300"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <Link to={`/video/${video._id}`} className="relative flex-shrink-0 group">
                    <img
                      src={video.thumbnail || '/api/placeholder/320/180'}
                      alt={video.title}
                      className="w-40 h-24 object-contain bg-gray-900 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300" />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg backdrop-blur-sm">
                      {formatDuration(video.duration)}
                    </div>
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-black text-sm">▶</span>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/video/${video._id}`} className="block group">
                      <h3 className="font-semibold text-white text-lg line-clamp-2 group-hover:text-pink-400 transition-colors duration-300">
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
                      <span>Liked {formatTimeAgo(video.likedAt)}</span>
                    </div>

                    {video.description && (
                      <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-start gap-2">
                    <button
                      onClick={() => removeLike(video._id)}
                      className="p-2 text-pink-500 hover:text-pink-400 hover:bg-pink-900/20 rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
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
    </div>
  );
}