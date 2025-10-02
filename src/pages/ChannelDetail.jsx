import React, { useState, useEffect, useContext } from "react";
import { useParams} from "react-router-dom";
import { channelAPI } from "../api/channel";
import { subscriptionAPI } from "../api/subscription";
import { getUserTweets, toggleTweetLike } from "../api/tweet";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";
import MessageButton from "../components/MessageButton";
import Toast from "../components/Toast"; 

export default function ChannelDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [channel, setChannel] = useState(null);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [likingTweets, setLikingTweets] = useState(new Set());
  const [coverImageError, setCoverImageError] = useState(false);
  const [coverImageLoading, setCoverImageLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const [showLoginToast, setShowLoginToast] = useState(false);
  const [showReplyToast, setShowReplyToast] = useState(false);
  const [showLikeErrorToast, setShowLikeErrorToast] = useState(false);
  const [showSubscribeErrorToast, setShowSubscribeErrorToast] = useState(false);
  const [showShareSuccessToast, setShowShareSuccessToast] = useState(false);
  const [showShareErrorToast, setShowShareErrorToast] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChannelData();
    }
  }, [id]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profileUpdated') {
        fetchChannelData();
        localStorage.removeItem('profileUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const handleProfileUpdate = () => {
      fetchChannelData();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (id && user) {
      fetchSubscriptionStatus();
    }
  }, [id, user]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await subscriptionAPI.getSubscriptionStatus(id);
      setIsSubscribed(response.data.data.isSubscribed);
    } catch (err) {
      console.error("Error fetching subscription status:", err);
      setIsSubscribed(false);
    }
  };

  const fetchChannelData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [channelResponse, videosResponse] = await Promise.all([
        channelAPI.getChannel(id),
        channelAPI.getChannelVideos(id)
      ]);
      
      if (channelResponse.data && channelResponse.data.data) {
        setChannel(channelResponse.data.data.channel);
        setStats(channelResponse.data.data.stats);
      } else {
        throw new Error("Invalid channel response structure");
      }
      
      if (videosResponse.data && videosResponse.data.data) {
        setVideos(videosResponse.data.data || []);
      } else {
        setVideos([]);
      }
      
      try {
        const tweetsResponse = await getUserTweets(id);
        const tweetsData = tweetsResponse.data?.data;
        const tweets = tweetsData?.tweets || tweetsData?.docs || [];
        setTweets(tweets);
      } catch (tweetErr) {
        console.log("Could not fetch tweets:", tweetErr);
        setTweets([]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch channel data";
      setError(errorMessage);
      console.error("Error fetching channel data:", err);
      console.error("Error response:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    
    try {
      const response = await subscriptionAPI.toggleSubscription(id);
      setIsSubscribed(response.data.data.isSubscribed);
      
      const channelResponse = await channelAPI.getChannel(id);
      if (channelResponse.data?.data?.stats) {
        setStats(channelResponse.data.data.stats);
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
      setShowSubscribeErrorToast(true);  // ADD: Set local state
      setTimeout(() => setShowSubscribeErrorToast(false), 3000);  // Auto-dismiss
    }
  };

      const handleTweetLike = async (tweetId) => {
        if (!user) {
          setShowLoginToast(true);  // CHANGE: Set local state
          setTimeout(() => setShowLoginToast(false), 3000);  // Auto-dismiss after 3s
          return;
        }
        if (likingTweets.has(tweetId)) return;

        try {
          setLikingTweets(prev => new Set(prev).add(tweetId));
          const response = await toggleTweetLike(tweetId);
          
          const { isLiked, likeCount } = response.data?.data || {};
          
          setTweets(prevTweets => 
            prevTweets.map(tweet => {
              if (tweet._id === tweetId) {
                return {
                  ...tweet,
                  isLiked: isLiked,
                  likesCount: likeCount !== undefined ? likeCount : tweet.likesCount
                };
              }
              return tweet;
            })
          );
        } catch (err) {
          console.error('Error toggling tweet like:', err);
          setShowLikeErrorToast(true);  // CHANGE: Set local state
          setTimeout(() => setShowLikeErrorToast(false), 3000);  // Auto-dismiss
        } finally {
          setLikingTweets(prev => {
            const newSet = new Set(prev);
            newSet.delete(tweetId);
            return newSet;
          });
        }
      };
      

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views?.toString() || '0';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const videoDate = new Date(date);
    
    if (isNaN(videoDate.getTime())) {
      return 'Unknown time';
    }
    
    const diffInSeconds = Math.floor((now - videoDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)} yr ago`;
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-3 sm:p-6">
      <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-2xl max-w-md w-full mx-3">
        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/10">
          <svg className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-red-400 text-base sm:text-lg font-semibold">{error}</div>
      </div>
    </div>
  );
  if (!channel) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-3 sm:p-6">
      <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl max-w-md w-full mx-3">
        <div className="text-gray-300 text-base sm:text-lg font-medium">Channel not found</div>
      </div>
    </div>
  );

  const isOwnChannel = user && user._id === id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-3 sm:p-4 lg:p-8">
        {/* Channel Header */}
        <div className="mb-8 sm:mb-12">
          {/* Cover Image */}
          {channel.coverImage && !coverImageError ? (
            <div className="h-32 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 overflow-hidden relative shadow-2xl border border-gray-800/50">
              <img
                src={channel.coverImage}
                alt="Cover"
                className="w-full h-full object-contain"
                onError={() => {
                  console.warn('Cover image failed to load:', channel.coverImage);
                  setCoverImageError(true);
                  setCoverImageLoading(false);
                }}
                onLoad={() => {
                  setCoverImageError(false);
                  setCoverImageLoading(false);
                }}
                onLoadStart={() => {
                  setCoverImageLoading(true);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {coverImageLoading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-white font-medium text-sm">Loading...</p>
                  </div>
                </div>
              )}
            </div>
          ) : channel.coverImage && coverImageError ? (
            <div className="h-32 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 overflow-hidden flex items-center justify-center">
              <div className="text-center p-6 sm:p-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-red-600/30">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                  </svg>
                </div>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 font-medium">Cover image failed</p>
                <button 
                  onClick={() => {
                    setCoverImageError(false);
                    setCoverImageLoading(true);
                    const img = new Image();
                    img.onload = () => setCoverImageLoading(false);
                    img.onerror = () => {
                      setCoverImageError(true);
                      setCoverImageLoading(false);
                    };
                    img.src = channel.coverImage;
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-600/20 font-semibold text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}

          {/* Channel Info */}
          <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
            {/* Avatar */}
            <div className="relative group mx-auto lg:mx-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 relative shadow-2xl ring-2 sm:ring-4 ring-gray-800/50 group-hover:ring-blue-600/50 transition-all duration-300">
                {channel.avatar && !avatarError ? (
                  <img
                    src={channel.avatar}
                    alt={channel.username}
                    className="w-full h-full rounded-full object-cover"
                    onError={() => {
                      console.warn('Avatar failed to load:', channel.avatar);
                      setAvatarError(true);
                    }}
                    onLoad={() => {
                      if (channel.avatar) setAvatarError(false);
                    }}
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white">
                    {channel.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 -z-10"></div>
            </div>
            
            <div className="flex-1 space-y-4 sm:space-y-6 w-full">
              {/* Channel Name */}
              <div className="text-center lg:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-2">
                  {channel.username}
                </h1>
                {channel.fullname && (
                  <p className="text-base sm:text-lg lg:text-xl text-gray-300 font-medium">{channel.fullname}</p>
                )}
              </div>
              
              {/* Channel Stats - Centered on Mobile */}
              <div className="flex justify-center lg:justify-start">
                <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 max-w-full">
                  <div className="flex gap-3 sm:gap-4 min-w-max sm:min-w-0 sm:flex-wrap pb-2 sm:pb-0">
                    <div className="flex items-center gap-2 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-blue-800/30 px-3 sm:px-4 py-2 rounded-lg hover:border-blue-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10 flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-200 font-medium text-xs sm:text-sm whitespace-nowrap">{formatViews(stats?.totalSubscribers || 0)} subscribers</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-green-800/30 px-3 sm:px-4 py-2 rounded-lg hover:border-green-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/10 flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-200 font-medium text-xs sm:text-sm whitespace-nowrap">{stats?.totalVideos || 0} videos</span>
                    </div>
                    {isOwnChannel && stats?.totalViews && (
                      <div className="flex items-center gap-2 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-purple-800/30 px-3 sm:px-4 py-2 rounded-lg hover:border-purple-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10 flex-shrink-0">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="text-gray-200 font-medium text-xs sm:text-sm whitespace-nowrap">{formatViews(stats.totalViews)} total views</span>
                      </div>
                    )}
                    {isOwnChannel && stats?.totalLikes && (
                      <div className="flex items-center gap-2 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-pink-800/30 px-3 sm:px-4 py-2 rounded-lg hover:border-pink-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-600/10 flex-shrink-0">
                        <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                        <span className="text-gray-200 font-medium text-xs sm:text-sm whitespace-nowrap">{formatViews(stats.totalLikes)} total likes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              {channel.bio && (
                <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4 sm:p-6 hover:border-gray-700/50 transition-all duration-300">
                  <p className="text-gray-200 leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
                    {channel.bio}
                  </p>
                </div>
              )}

              {/* Join Date */}
              <div className="flex items-center gap-2 text-gray-400 justify-center lg:justify-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs sm:text-sm">
                  Joined {channel.createdAt || channel.joinedAt || channel.registeredAt ? 
                    formatTimeAgo(channel.createdAt || channel.joinedAt || channel.registeredAt) : 
                    'Unknown time'
                  }
                </span>
              </div>

              {/* Action Buttons - Centered on Mobile */}
              <div className="flex justify-center lg:justify-start">
                <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 max-w-full">
                  <div className="flex items-center gap-2 sm:gap-3 flex-nowrap sm:flex-wrap min-w-max sm:min-w-0 pb-2 sm:pb-0">
                    <button
                      onClick={() => {
                        console.log('Force refreshing channel...');
                        fetchChannelData();
                      }}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-900/40 hover:bg-gray-900/60 text-gray-300 hover:text-white rounded-lg transition-all duration-300 border border-gray-800/50 hover:border-gray-700/50 hover:shadow-lg hover:shadow-gray-600/10 text-xs sm:text-sm font-medium flex-shrink-0"
                      title="Refresh Channel"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                    
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(`${window.location.origin}/#/channel/${id}`);  // Copy full URL
                          setShowShareSuccessToast(true);  // Success toast
                          setTimeout(() => setShowShareSuccessToast(false), 3000);
                        } catch (err) {
                          console.error('Share failed:', err);
                          setShowShareErrorToast(true);  // Error toast
                          setTimeout(() => setShowShareErrorToast(false), 3000);
                        }
                      }} 
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-900/40 hover:bg-gray-900/60 text-gray-300 hover:text-white rounded-lg transition-all duration-300 border border-gray-800/50 hover:border-gray-700/50 hover:shadow-lg hover:shadow-gray-600/10 text-xs sm:text-sm font-medium flex-shrink-0"
                      title="Share Channel"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      <span className="hidden sm:inline">Share</span>
                    </button>
                    
                    {user && !isOwnChannel && (
                      <>
                        <button
                          onClick={handleSubscribe}
                          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 shadow-lg flex-shrink-0 ${
                            isSubscribed
                              ? 'bg-gray-900/40 hover:bg-gray-900/60 text-white border border-gray-700/50 hover:border-gray-600/50'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-600/20 hover:shadow-blue-600/40'
                          }`}
                        >
                          {isSubscribed ? (
                            <>
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                              <span className="hidden sm:inline">Subscribed</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              <span className="hidden sm:inline">Subscribe</span>
                            </>
                          )}
                        </button>

                        <MessageButton receiverId={id} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Scrollable */}
        <div className="mb-6 sm:mb-8 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex border-b border-gray-800/50 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-t-xl min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-300 relative text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'videos'
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Videos ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab('tweets')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-300 relative text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'tweets'
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Tweets ({tweets.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-300 relative text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'about'
                  ? 'text-white border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'videos' && (
          <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-gray-800/50">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {videos.map((video) => (
                  <div key={video._id} className="transform hover:scale-105 transition-all duration-300">
                    <VideoCard video={video} channelData={channel} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-2 sm:mb-3">No videos uploaded yet</h3>
                <p className="text-gray-400 text-sm sm:text-base">This channel hasn't uploaded any videos.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tweets' && (
          <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-gray-800/50">
            {tweets.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {tweets.map((tweet) => (
                  <div key={tweet._id} className="bg-gradient-to-br from-gray-900/40 to-gray-800/30 rounded-xl p-4 sm:p-6 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-gray-600/10">
                   <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700/50">
                        {tweet.owner?.avatar ? (
                          <img
                            src={tweet.owner.avatar}
                            alt={tweet.owner.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-base sm:text-lg">
                              {tweet.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tweet Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <span className="font-semibold text-white text-xs sm:text-sm truncate">{tweet.owner?.username}</span>
                          <div className="w-1 h-1 bg-gray-500 rounded-full flex-shrink-0"></div>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTimeAgo(tweet.createdAt)}
                          </span>
                        </div>
                        
                        {/* Tweet Text */}
                        <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 whitespace-pre-wrap break-words">
                          {tweet.content}
                        </p>
                        
                        {/* Actions - Scrollable on Mobile */}
                        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                          <div className="flex items-center gap-2 sm:gap-4 min-w-max sm:min-w-0 pb-2 sm:pb-0">
                            {/* Like Button */}
                            <button
                              onClick={() => handleTweetLike(tweet._id)}
                              disabled={likingTweets.has(tweet._id)}
                              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all duration-300 text-xs font-medium flex-shrink-0 ${
                                tweet.isLiked 
                                  ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20' 
                                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-gray-800/50 hover:border-red-500/30'
                              }`}
                            >
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill={tweet.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>{tweet.likesCount || 0}</span>
                            </button>
                            
                            {/* Reply Button */}
                            <button 
                             onClick={() => {
                                setShowReplyToast(true);  // CHANGE: Set local state
                                setTimeout(() => setShowReplyToast(false), 3000);  // Auto-dismiss
                             }} 
                             className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 text-xs font-medium flex-shrink-0">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>Reply</span>
                            </button>
                            
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-2 sm:mb-3">No tweets yet</h3>
                <p className="text-gray-400 text-sm sm:text-base">This user hasn't shared any thoughts yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4 sm:p-6 lg:p-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Channel Information</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
              {/* Stats Section */}
              <div className="space-y-6 sm:space-y-8">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-blue-800/30 rounded-xl p-4 sm:p-6 text-center hover:border-blue-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10 group">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2 group-hover:text-blue-300 transition-colors duration-300">
                      {formatViews(stats?.totalSubscribers || 0)}
                    </div>
                    <div className="text-blue-300 font-medium text-xs sm:text-sm">Subscribers</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-green-800/30 rounded-xl p-4 sm:p-6 text-center hover:border-green-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/10 group">
                    <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors duration-300">
                      {stats?.totalVideos || 0}
                    </div>
                    <div className="text-green-300 font-medium text-xs sm:text-sm">Videos</div>
                  </div>
                </div>
                
                {/* Channel Details */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4 sm:p-6 hover:border-gray-700/50 transition-all duration-300">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base break-words">
                      {channel.bio || 'No description available.'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4 sm:p-6 hover:border-gray-700/50 transition-all duration-300">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Statistics
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300">
                        <span className="text-gray-400 font-medium text-xs sm:text-sm">Joined</span>
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {channel.createdAt ? formatTimeAgo(channel.createdAt) : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300">
                        <span className="text-gray-400 font-medium text-xs sm:text-sm">Total views</span>
                        <span className="text-white font-semibold text-xs sm:text-sm">{formatViews(stats?.totalViews || 0)}</span>
                      </div>
                      {isOwnChannel && stats?.totalLikes && (
                        <div className="flex justify-between items-center p-3 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300">
                          <span className="text-gray-400 font-medium text-xs sm:text-sm">Total likes</span>
                          <span className="text-white font-semibold text-xs sm:text-sm">{formatViews(stats.totalLikes)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Channel Avatar Section */}
              <div className="space-y-6 sm:space-y-8">
                <div className="text-center">
                  <div className="relative group mb-4 sm:mb-6">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 mx-auto rounded-full overflow-hidden ring-2 sm:ring-4 ring-gray-800/50 group-hover:ring-blue-600/50 shadow-2xl transition-all duration-300">
                      {channel.avatar ? (
                        <img
                          src={channel.avatar}
                          alt={channel.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                          <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                            {channel.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 -z-10"></div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-4 sm:p-6 hover:border-gray-700/50 transition-all duration-300">
                    <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-2">
                      {channel.fullname || channel.username}
                    </h3>
                    <p className="text-gray-400 text-sm sm:text-base mb-4">@{channel.username}</p>
                    
                    {/* Additional Info */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {stats?.totalSubscribers > 0 && (
                        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 border border-blue-800/30 rounded-lg p-3 sm:p-4 hover:border-blue-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                          <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-1">
                            {formatViews(stats.totalSubscribers)}
                          </div>
                          <div className="text-xs text-blue-300">Subscribers</div>
                        </div>
                      )}
                      
                      {stats?.totalVideos > 0 && (
                        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 border border-green-800/30 rounded-lg p-3 sm:p-4 hover:border-green-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/10">
                          <div className="text-xl sm:text-2xl font-bold text-green-400 mb-1">
                            {stats.totalVideos}
                          </div>
                          <div className="text-xs text-green-300">Videos Published</div>
                        </div>
                      )}
                      
                      {isOwnChannel && stats?.totalViews > 0 && (
                        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 border border-pink-800/30 rounded-lg p-3 sm:p-4 hover:border-pink-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-600/10">
                          <div className="text-xl sm:text-2xl font-bold text-pink-400 mb-1">
                            {formatViews(stats.totalViews)}
                          </div>
                          <div className="text-xs text-pink-300">Total Views</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Notifications - Fixed top-right positioning */}
      {/* Responsive Toast Notifications - Fixed top positioning, adapts to mobile/tablet/desktop */}
      <div className="fixed top-2 right-2 left-2 sm:top-4 sm:right-4 sm:left-auto z-[9999] flex flex-col gap-2 w-auto max-w-full sm:max-w-sm pointer-events-none">
        {/* Individual toasts stack vertically with responsive sizing */}
        {showShareSuccessToast && (
          <div className="w-full animate-slide-down">
            <Toast 
              message="Channel URL copied to clipboard!" 
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
              message="Failed to copy channel link" 
              type="error" 
              duration={3000} 
              onClose={() => setShowShareErrorToast(false)}
              className="text-xs sm:text-sm md:text-base p-2.5 sm:p-3 md:p-4 rounded-md sm:rounded-lg shadow-lg"
            />
          </div>
        )}
        {showLoginToast && (
          <div className="w-full animate-slide-down">
            <Toast 
              message="Please log in to like tweets!" 
              type="error" 
              duration={3000} 
              onClose={() => setShowLoginToast(false)}
              className="text-xs sm:text-sm md:text-base p-2.5 sm:p-3 md:p-4 rounded-md sm:rounded-lg shadow-lg"
            />
          </div>
        )}
        {showReplyToast && (
          <div className="w-full animate-slide-down">
            <Toast 
              message="You are not allowed to reply on this tweet." 
              type="error" 
              duration={3000} 
              onClose={() => setShowReplyToast(false)}
              className="text-xs sm:text-sm md:text-base p-2.5 sm:p-3 md:p-4 rounded-md sm:rounded-lg shadow-lg"
            />
          </div>
        )}
        {showLikeErrorToast && (
          <div className="w-full animate-slide-down">
            <Toast 
              message="Failed to like tweet" 
              type="error" 
              duration={3000} 
              onClose={() => setShowLikeErrorToast(false)}
              className="text-xs sm:text-sm md:text-base p-2.5 sm:p-3 md:p-4 rounded-md sm:rounded-lg shadow-lg"
            />
          </div>
        )}
        {showSubscribeErrorToast && (
          <div className="w-full animate-slide-down">
            <Toast 
              message="Failed to subscribe/unsubscribe" 
              type="error" 
              duration={3000} 
              onClose={() => setShowSubscribeErrorToast(false)}
              className="text-xs sm:text-sm md:text-base p-2.5 sm:p-3 md:p-4 rounded-md sm:rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
          
      <style jsx>{`
         .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
      `}</style>
    </div>
  );
}