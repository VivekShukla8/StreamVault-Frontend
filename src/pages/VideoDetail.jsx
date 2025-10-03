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
import Toast from "../components/Toast";
import MessageButton from "../components/MessageButton";

// Custom styles for scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.3);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #f59e0b, #d97706);
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #d97706, #b45309);
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
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  
  // Toast states
  const [showShareSuccessToast, setShowShareSuccessToast] = useState(false);
  const [showShareErrorToast, setShowShareErrorToast] = useState(false);

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
      fetchRelatedVideos();
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

  const fetchRelatedVideos = async () => {
    try {
      setLoadingRelated(true);
      const response = await videoAPI.getAllVideos({ page: 1, limit: 10 });
      if (response.data?.data?.videos) {
        // Filter out current video and get up to 8 related videos
        const filtered = response.data.data.videos.filter(v => v._id !== id).slice(0, 8);
        setRelatedVideos(filtered);
      }
    } catch (err) {
      console.error("Error fetching related videos:", err);
      setRelatedVideos([]);
    } finally {
      setLoadingRelated(false);
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
        await videoAPI.incrementViews(id);
        setViewsIncremented(true);
        setVideo(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
      } catch (err) {
        console.error("Error incrementing views:", err);
      }
    }
  };

  // Event Handlers
  const handleLike = async () => {
    if (!user) return;
    try {
      await likeAPI.toggleVideoLike(id);
      const response = await likeAPI.getVideoLikeCount(id);
      if (response.data?.data) {
        setLikeCount(response.data.data.likeCount || 0);
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

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!video) return <div className="text-center p-8">Video not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Video Section - 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video Player */}
            <div className="relative group">
              <div className={`bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50 transition-all duration-500 ${
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
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <p className="text-gray-300 text-lg font-medium">Video not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video Title & Actions */}
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 shadow-xl">
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-4">
                {video.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 text-gray-400 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    <span className="font-medium text-gray-300">{formatViews(video.views)} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="font-medium text-gray-300">{formatTimeAgo(video.createdAt)}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl active:scale-95 ${
                      isLiked
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700'
                        : 'bg-gray-900/40 text-gray-300 hover:bg-gray-800/60 hover:text-white border border-gray-800/50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    {formatViews(likeCount)}
                  </button>
                  
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${window.location.origin}/#/video/${id}`);
                        setShowShareSuccessToast(true);
                        setTimeout(() => setShowShareSuccessToast(false), 3000);
                      } catch (err) {
                        console.error('Share failed:', err);
                        setShowShareErrorToast(true);
                        setTimeout(() => setShowShareErrorToast(false), 3000);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900/40 text-gray-300 rounded-xl transition-all duration-300 hover:bg-gray-800/60 hover:text-white border border-gray-800/50 font-medium text-sm shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                  
                  <div className="relative playlist-dropdown-container">
                    <button 
                      onClick={() => {
                        if (!user) {
                          alert('Please login to save videos to playlists');
                          return;
                        }
                        setShowPlaylistDropdown(!showPlaylistDropdown);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900/40 text-gray-300 rounded-xl transition-all duration-300 hover:bg-gray-800/60 hover:text-white border border-gray-800/50 font-medium text-sm shadow-lg hover:shadow-xl active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
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

            {/* Channel Info */}
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Link to={`/channel/${video.owner._id}`} className="relative group">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
                      {video.owner?.avatar ? (
                        <img
                          src={video.owner.avatar}
                          alt={video.owner.username}
                          className="w-full h-full rounded-full object-contain"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {video.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  <div>
                    <Link to={`/channel/${video.owner._id}`} className="text-lg font-semibold text-slate-100 hover:text-amber-400 transition-colors duration-300">
                      {video.owner?.username || 'Unknown'}
                    </Link>
                    <p className="text-gray-400 text-sm">{formatViews(subscriberCount)} subscribers</p>
                  </div>
                </div>
                
                {user && user._id !== video.owner._id && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubscribe}
                      className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 ${
                        isSubscribed
                          ? 'bg-gray-900/40 text-gray-300 hover:bg-gray-800/60 border border-gray-800/50'
                          : 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-gray-900'
                      }`}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                    <MessageButton receiverId={video.owner._id} />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-100 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z"/>
                </svg>
                Description
              </h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {video.description || 'No description available.'}
              </p>
            </div>

            {/* Comments */}
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <svg className="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21,6H3A1,1 0 0,0 2,7V17A1,1 0 0,0 3,18H21A1,1 0 0,0 22,17V7A1,1 0 0,0 21,6M20,16H4V8H20V16M6,10V12H18V10H6Z"/>
                </svg>
                <h2 className="text-xl font-semibold text-slate-100">
                  {Array.isArray(comments) ? comments.length : 0} Comments
                </h2>
              </div>
              
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-gray-900">
                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-gray-900/40 border border-gray-800/50 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none transition-all duration-300 hover:bg-gray-900/60"
                        rows="3"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="px-6 py-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-gray-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:scale-105"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {Array.isArray(comments) && comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-900/30 rounded-xl p-4 border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {comment.ownerDetails?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white text-sm">
                            {comment.ownerDetails?.username || 'Unknown'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">
                          {comment.content}
                        </p>
                        
                        {user && (
                          <button
                            onClick={() => handleCommentLike(comment._id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all duration-300 ${
                              commentLikes[comment._id] 
                                ? 'text-red-400 bg-red-500/20' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.77,11h-4.23l1.52-4.94C16.38,5.03,15.54,4,14.38,4c-0.58,0-1.14,0.24-1.52,0.65L7,11H3v10h4h1h9.43 c1.06,0,1.98-0.67,2.19-1.61l1.34-6C21.23,12.15,20.18,11,18.77,11z"/>
                            </svg>
                            {commentLikes[comment._id] ? 'Liked' : 'Like'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {(!Array.isArray(comments) || comments.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No comments yet</p>
                    <p className="text-gray-500 text-sm mt-1">Be the first to comment!</p>
              </div>
              )}
              </div>
              </div>
              </div>
              {/* Sidebar - Related Videos - 4 columns */}
      <div className="lg:col-span-4">
        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-800/50 shadow-xl sticky top-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M20,18H4V6H20V18M6,9H11V14H6V9M12,9H18V11H12V9M12,12H18V14H12V12Z"/>
            </svg>
            Related Videos
          </h3>
          
          {loadingRelated ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-800/50 rounded-xl h-24"></div>
                </div>
              ))}
            </div>
          ) : relatedVideos.length > 0 ? (
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
              {relatedVideos.map((relatedVideo) => (
                <Link
                  key={relatedVideo._id}
                  to={`/video/${relatedVideo._id}`}
                  className="group block"
                >
                  <div className="flex gap-3 p-3 bg-gray-900/30 rounded-xl border border-gray-800/30 hover:border-amber-500/30 hover:bg-gray-900/50 transition-all duration-300">
                    <div className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden">
                      <img
                        src={relatedVideo.thumbnail}
                        alt={relatedVideo.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      {relatedVideo.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
                          {formatDuration(relatedVideo.duration)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-200 text-sm line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors duration-300">
                        {relatedVideo.title}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                          {relatedVideo.owner?.username || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatViews(relatedVideo.views)} views</span>
                          <span>•</span>
                          <span>{formatTimeAgo(relatedVideo.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21,3H3C2,3 1,4 1,5V19A2,2 0 0,0 3,21H21C22,21 23,20 23,19V5C23,4 22,3 21,3M20,18H4V6H20V18M6,9H11V14H6V9M12,9H18V11H12V9M12,12H18V14H12V12Z"/>
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No related videos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  
  {/* Toast Notifications */}
  <div className="fixed top-2 right-2 left-2 sm:top-4 sm:right-4 sm:left-auto z-[9999] flex flex-col gap-2 w-auto max-w-full sm:max-w-sm pointer-events-none">
    {showShareSuccessToast && (
      <div className="w-full animate-slide-down">
        <Toast 
          message="Video URL copied to clipboard!" 
          type="success" 
          duration={3000} 
          onClose={() => setShowShareSuccessToast(false)}
          className="text-xs sm:text-sm md:text-base p-2.5 sm:p-3 md:p-4 rounded-md sm:rounded-lg shadow-lg"
        />
      </div>
    )}
    {showShareErrorToast && (
      <div className="w-full animate-slide-down">
        <Toast 
          message="Failed to copy video link" 
          type="error" 
          duration={3000} 
          onClose={() => setShowShareErrorToast(false)}
          className="text-xs sm:text-sm md:text-base p-2.5 sm:p-3 md:p-4 rounded-md sm:rounded-lg shadow-lg"
        />
      </div>
    )}
  </div>
</div>
);
}