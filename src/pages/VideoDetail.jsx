import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { videoAPI } from "../api/video";
import { likeAPI } from "../api/like";
import { subscriptionAPI } from "../api/subscription";
import { commentAPI } from "../api/comment";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";
import AddToPlaylistDropdown from "../components/AddToPlaylistDropdown";
import CustomVideoPlayer from "../components/CustomVideoPlayer";
import ShareButton from "../components/ShareButton";
import Toast from "../components/Toast";
import { useShare } from "../hooks/useShare";
import API from "../api/axios";

// Custom styles for scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(75, 85, 99, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8b5cf6, #3b82f6);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #7c3aed, #2563eb);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = scrollbarStyles;
  document.head.appendChild(styleSheet);
}

export default function VideoDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { shareVideo, showToast, closeToast } = useShare();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentLikes, setCommentLikes] = useState({});
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [viewsIncremented, setViewsIncremented] = useState(false);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Effects
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPlaylistDropdown && !event.target.closest('.playlist-dropdown-container')) {
        setShowPlaylistDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlaylistDropdown]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  useEffect(() => {
    if (id) {
      fetchVideo();
      fetchComments();
    }
  }, [id]);

  useEffect(() => {
    if (id && user) fetchLikeStatus();
  }, [id, user]);

  useEffect(() => {
    if (id) fetchLikeCount();
  }, [id]);

  useEffect(() => {
    if (video?.owner?._id && user) fetchSubscriptionStatus();
  }, [video?.owner?._id, user]);

  // API Functions
  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await videoAPI.getVideoById(id);
      if (response.data?.data) {
        setVideo(response.data.data);
        setSubscriberCount(response.data.data?.owner?.subscribersCount || 0);
      } else {
        setError("Invalid video data received");
      }
    } catch (err) {
      setError("Failed to fetch video");
      console.error("Error fetching video:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.getVideoComments(id);
      const fetchedComments = response.data.data.comments || [];
      setComments(fetchedComments);
      if (user && fetchedComments.length > 0) {
        fetchCommentsLikeStatus(fetchedComments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    }
  };

  const fetchCommentsLikeStatus = async (comments) => {
    try {
      const likeStatuses = {};
      await Promise.all(
        comments.map(async (comment) => {
          try {
            const response = await likeAPI.getCommentLikeStatus(comment._id);
            likeStatuses[comment._id] = response.data.data.isLiked;
          } catch (err) {
            likeStatuses[comment._id] = false;
          }
        })
      );
      setCommentLikes(likeStatuses);
    } catch (err) {
      console.error("Error fetching comments like status:", err);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const response = await likeAPI.getVideoLikeStatus(id);
      setIsLiked(response.data.data.isLiked);
      if (response.data.data.likeCount !== undefined) {
        setLikeCount(response.data.data.likeCount);
      }
    } catch (err) {
      setIsLiked(false);
    }
  };

  const fetchLikeCount = async () => {
    try {
      const response = await likeAPI.getVideoLikeCount(id);
      setLikeCount(response.data.data.likeCount || 0);
    } catch (err) {
      setLikeCount(0);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await subscriptionAPI.getSubscriptionStatus(video.owner._id);
      setIsSubscribed(response.data.data.isSubscribed);
      if (response.data.data.subscriberCount !== undefined) {
        setSubscriberCount(response.data.data.subscriberCount);
      }
    } catch (err) {
      setIsSubscribed(false);
    }
  };

  const incrementViews = async () => {
    if (!viewsIncremented) {
      try {
        console.log('Incrementing views for video:', id); // Debug log
        console.log('User context:', user); // Debug log
        
        const response = await videoAPI.incrementViews(id);
        console.log('Increment views response:', response); // Debug log
        setViewsIncremented(true);
        setVideo(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
      } catch (err) {
        console.error("Error incrementing views:", err);
      }
    } else {
      console.log('Views already incremented for this session'); // Debug log
    }
  };

  // Event Handlers
  const handleLike = async () => {
    if (!user) return;
    try {
      // Toggle the like for this video
      await likeAPI.toggleVideoLike(id);
      // Fetch the updated like count from the API
      const response = await likeAPI.getVideoLikeCount(id); 
       // Update the local states
      if (response.data?.data) {
        setLikeCount(response.data.data.likeCount || 0);

        // Optionally, set isLiked based on previous state toggled locally
        setIsLiked(prev => !prev);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    try {
      const response = await subscriptionAPI.toggleSubscription(video.owner._id);
      setIsSubscribed(response.data.data.isSubscribed);
      if (response.data.data.subscriberCount !== undefined) {
        setSubscriberCount(response.data.data.subscriberCount);
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    try {
      await commentAPI.addComment(id, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user) return;
    try {
      const response = await likeAPI.toggleCommentLike(commentId);
      setCommentLikes(prev => ({
        ...prev,
        [commentId]: response.data.data.isLiked
      }));
    } catch (err) {
      console.error("Error toggling comment like:", err);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Utility Functions
  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views?.toString() || '0';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    const now = new Date();
    const videoDate = new Date(date);
    if (isNaN(videoDate.getTime())) return 'Unknown time';
    
    const diffInSeconds = Math.floor((now - videoDate) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!video) return <div className="text-center p-8">Video not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Section */}
          <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        <div className="relative group">
          <div className={`bg-gradient-to-br from-slate-900 to-zinc-900 rounded-2xl overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.8)] border border-slate-800/50 transition-all duration-500 hover:shadow-[0_35px_80px_-12px_rgba(0,0,0,0.9)] hover:border-slate-700/50 ${
            isFullscreen ? 'fixed inset-4 z-50 aspect-auto' : 'aspect-video w-full'
          }`}>
            {video.videofile ? (
              <CustomVideoPlayer
                src={video.videofile}
                poster={video.thumbnail}
                onPlay={incrementViews}
                onSaveToPlaylist={() => setShowPlaylistDropdown(!showPlaylistDropdown)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center animate-pulse">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-gray-300 text-lg font-medium">Video not available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Info Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-800/30 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] hover:border-slate-700/40 transition-all duration-500">
          <h1 className="text-3xl md:text-4xl font-light text-slate-100 mb-8 leading-tight tracking-tight">
            {video.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-8 text-slate-400">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/30 group-hover:bg-slate-700/60 transition-all duration-300">
                  <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </div>
                <span className="font-medium text-slate-300">{formatViews(video.views)} views</span>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/30 group-hover:bg-slate-700/60 transition-all duration-300">
                  <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span className="font-medium text-slate-300">{formatTimeAgo(video.createdAt)}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-500 font-medium text-sm shadow-lg hover:shadow-xl active:scale-95 border ${
                  isLiked
                    ? 'bg-red-500/80 text-white hover:bg-red-500/90 border-red-400/50 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white border-slate-700/30 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]'
                }`}
              >
                <svg className={`w-4 h-4 transition-all duration-300 ${isLiked ? 'scale-110' : 'group-hover:scale-110'}`} fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {isLiked ? 'Liked' : 'Like'} ({formatViews(likeCount)})
              </button>
              
              <ShareButton
                onClick={() => shareVideo(id)}
                size="large"
                variant="default"
                className="px-5 py-3 font-medium text-sm shadow-lg hover:shadow-xl active:scale-95 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]"
              />
              
              <div className="relative playlist-dropdown-container z-50">
                <button 
                  onClick={() => {
                    if (!user) {
                      alert('Please login to save videos to playlists');
                      return;
                    }
                    setShowPlaylistDropdown(!showPlaylistDropdown);
                  }}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-800/60 text-slate-300 rounded-2xl transition-all duration-300 hover:bg-slate-700/60 hover:text-white border border-slate-700/30 font-medium text-sm shadow-lg hover:shadow-xl active:scale-95 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]"
                >
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  Save
                </button>
                
                {showPlaylistDropdown && user && (
                  <AddToPlaylistDropdown
                    videoId={id}
                    onClose={() => setShowPlaylistDropdown(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Channel Info Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-800/30 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] hover:border-slate-700/40 transition-all duration-500 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to={`/channel/${video.owner._id}`} className="group/avatar relative">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover/avatar:scale-110 group-hover/avatar:shadow-2xl border border-slate-600/30">
                  {video.owner?.avatar ? (
                    <img
                      src={video.owner.avatar}
                      alt={video.owner.username}
                      className="w-full h-full rounded-2xl object-contain bg-gray-800 transition-all duration-500 group-hover/avatar:brightness-110"
                    />
                  ) : (
                    <span className="text-xl font-light text-slate-200 transition-all duration-500 group-hover/avatar:scale-110">
                      {video.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-slate-600/20 to-slate-700/20 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 -z-10 blur"></div>
              </Link>
              
              <div className="space-y-2">
                <Link to={`/channel/${video.owner._id}`} className="text-xl font-light text-slate-100 hover:text-slate-300 transition-all duration-300 hover:translate-x-1 inline-block">
                  {video.owner?.username || 'Unknown'}
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-800/60 rounded-lg border border-slate-700/30">
                    <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h2v2h2v2H4zM13 7h2v2h-2V7zm-2 0h2v2h-2V7zm-2 0h2v2H9V7zM7 7h2v2H7V7zM5 7h2v2H5V7z"/>
                    </svg>
                  </div>
                  <p className="text-slate-400 font-medium hover:text-slate-300 transition-colors duration-300 text-sm">
                    {formatViews(subscriberCount)} subscribers
                  </p>
                </div>
              </div>
            </div>
            
            {user && user._id !== video.owner._id && (
              <button
                onClick={handleSubscribe}
                className={`px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-500 shadow-lg hover:shadow-xl active:scale-95 border relative overflow-hidden group ${isSubscribed
                    ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 border-slate-700/40 hover:border-slate-600/50'
                    : 'bg-slate-100 text-slate-900 hover:bg-white border-slate-200 hover:border-slate-100'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative flex items-center gap-2">
                  {isSubscribed ? (
                    <>
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      Subscribed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      Subscribe
                    </>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 group">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3 group-hover:text-blue-400 transition-colors duration-300">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors duration-300">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
              </svg>
            </div>
            Description
          </h3>
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap hover:text-gray-200 transition-colors duration-300">
            {video.description || 'No description available for this video.'}
          </p>
        </div>

        {/* Comments */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21,6H3A1,1 0 0,0 2,7V17A1,1 0 0,0 3,18H21A1,1 0 0,0 22,17V7A1,1 0 0,0 21,6M20,16H4V8H20V16M6,10V12H18V10H6Z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              Comments 
              <span className="text-purple-400 font-normal">({Array.isArray(comments) ? comments.length : 0})</span>
            </h2>
          </div>
          
          {/* Add Comment */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-300 hover:bg-gray-800/70"
                    rows="3"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:scale-105 group"
                    >
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                        </svg>
                        Post Comment
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {Array.isArray(comments) && comments.map((comment) => (
              <div key={comment._id} className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 hover:bg-gray-800/50 group">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xs font-bold text-white">
                      {comment.ownerDetails?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-white text-sm hover:text-blue-400 transition-colors duration-200 cursor-pointer">
                        {comment.ownerDetails?.username || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-3 group-hover:text-gray-200 transition-colors duration-300">
                      {comment.content}
                    </p>
                    
                    {/* Comment Actions */}
                    {user && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCommentLike(comment._id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all duration-300 hover:scale-105 ${commentLikes[comment._id] 
                              ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
                              : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                            }`}
                        >
                          <svg className={`w-3 h-3 transition-transform duration-300 ${commentLikes[comment._id] ? 'scale-110' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.77,11h-4.23l1.52-4.94C16.38,5.03,15.54,4,14.38,4c-0.58,0-1.14,0.24-1.52,0.65L7,11H3v10h4h1h9.43 c1.06,0,1.98-0.67,2.19-1.61l1.34-6C21.23,12.15,20.18,11,18.77,11z"/>
                          </svg>
                          {commentLikes[comment._id] ? 'Liked' : 'Like'}
                        </button>
                        
                        <button className="text-gray-400 hover:text-white transition-all duration-300 px-3 py-1 rounded-full text-xs hover:bg-gray-600/50 hover:scale-105">
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(!Array.isArray(comments) || comments.length === 0) && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21,6H3A1,1 0 0,0 2,7V17A1,1 0 0,0 3,18H21A1,1 0 0,0 22,17V7A1,1 0 0,0 21,6M20,16H4V8H20V16M6,10V12H18V10H6Z"/>
                  </svg>
                </div>
                <p className="text-gray-400 font-medium text-lg mb-2">No comments yet</p>
                <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Related Videos or Additional Content */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/30">
              <h3 className="text-lg font-medium text-slate-100 mb-4">Related Videos</h3>
              <p className="text-slate-400 text-sm">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="Video URL copied to clipboard!"
          type="success"
          duration={2000}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
