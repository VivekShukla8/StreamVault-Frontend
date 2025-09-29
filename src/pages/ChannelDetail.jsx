import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { channelAPI } from "../api/channel";
import { subscriptionAPI } from "../api/subscription";
import { getUserTweets, toggleTweetLike } from "../api/tweet";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";
import ShareButton from "../components/ShareButton";
import Toast from "../components/Toast";
import { useShare } from "../hooks/useShare";
import MessageButton from "../components/MessageButton";

export default function ChannelDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { shareChannel, showToast, closeToast } = useShare();
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
  const [tweetToast, setTweetToast] = useState(false);
  const [replyToast, setReplyToast] = useState(false);
  const [loginToast, setLoginToast] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChannelData();
    }
  }, [id]);

  // Listen for profile updates (for real-time updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profileUpdated') {
        // Refresh channel data when updates are made
        fetchChannelData();
        localStorage.removeItem('profileUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events within the same tab
    const handleProfileUpdate = () => {
      fetchChannelData();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Fetch subscription status separately when user is available
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
      
      // Backend returns: { channel: {...}, stats: {...} }
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
      
      // Fetch tweets for this channel (public endpoint)
      try {
        const tweetsResponse = await getUserTweets(id);
        
        // The response structure should be: { data: { tweets: [...], totalTweets: N, ... } }
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
      // Use the actual state returned from backend
      setIsSubscribed(response.data.data.isSubscribed);
      
      // Fetch updated channel data to get accurate stats
      const channelResponse = await channelAPI.getChannel(id);
      if (channelResponse.data?.data?.stats) {
        setStats(channelResponse.data.data.stats);
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
    }
  };

  const handleTweetLike = async (tweetId) => {
    if (!user) {
      setLoginToast(true);
      setTimeout(() => setLoginToast(false), 2000);
      return;
    }
    // Prevent multiple simultaneous likes on the same tweet
    if (likingTweets.has(tweetId)) return;

    try {
      setLikingTweets(prev => new Set(prev).add(tweetId));
      const response = await toggleTweetLike(tweetId);
      
      // Use the backend response to ensure consistency
      const { isLiked, likeCount } = response.data?.data || {};
      
      // Update tweets state to reflect like change
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
      alert('Failed to like tweet');
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
    
    // Check if date is valid
    if (isNaN(videoDate.getTime())) {
      return 'Unknown time';
    }
    
    const diffInSeconds = Math.floor((now - videoDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const copyTweetUrl = (tweetId) => {
    const tweetUrl = `${window.location.origin}/tweet/${tweetId}`;
    
    navigator.clipboard.writeText(tweetUrl)
      .then(() => {
        setTweetToast(true);
        setTimeout(() => setTweetToast(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy tweet URL:', err);
      });
  };

  if (loading) return <Loader />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-black flex items-center justify-center">
      <div className="text-center p-8 bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
        <div className="text-red-400 text-lg font-medium">{error}</div>
      </div>
    </div>
  );
  if (!channel) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-black flex items-center justify-center">
      <div className="text-center p-8 bg-gradient-to-br from-gray-800/40 to-gray-700/20 border border-gray-600/20 rounded-2xl backdrop-blur-sm">
        <div className="text-gray-300 text-lg">Channel not found</div>
      </div>
    </div>
  );

  const isOwnChannel = user && user._id === id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-black">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-gradient-to-br from-pink-600/10 to-purple-600/10 rounded-full blur-3xl transform translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 lg:p-8">
        {/* Channel Header */}
        <div className="mb-12">
          {/* Cover Image */}
          {channel.coverImage && !coverImageError ? (
            <div className="h-30 md:h-35 lg:h-35 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl mb-8 overflow-hidden relative shadow-2xl border border-gray-700/50">
              <img
                src={channel.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
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
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              
              {/* Loading overlay for cover image */}
              {coverImageLoading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-medium">Loading cover image...</p>
                  </div>
                </div>
              )}
            </div>
          ) : channel.coverImage && coverImageError ? (
            <div className="h-48 md:h-64 lg:h-72 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl mb-8 overflow-hidden flex items-center justify-center border border-gray-700/50 backdrop-blur-sm">
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
                  </svg>
                </div>
                <p className="text-gray-300 text-lg mb-4">Cover image failed to load</p>
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
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}

          {/* Channel Info */}
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 relative shadow-2xl border-4 border-white/10 backdrop-blur-sm">
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
                  <span className="text-4xl lg:text-5xl font-bold text-white">
                    {channel.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 -z-10"></div>
            </div>
            
            <div className="flex-1 space-y-6">
              {/* Channel Name & Verification */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-2">
                  {channel.username}
                </h1>
                {channel.fullname && (
                  <p className="text-xl text-gray-300 font-medium">{channel.fullname}</p>
                )}
              </div>
              
              {/* Channel Stats */}
              <div className="flex flex-wrap items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/30 to-blue-900/30 px-4 py-2 rounded-full border border-purple-500/20 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">{formatViews(stats?.totalSubscribers || 0)} subscribers</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 px-4 py-2 rounded-full border border-blue-500/20 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                  <span className="text-gray-200 font-medium">{stats?.totalVideos || 0} videos</span>
                </div>
                {isOwnChannel && stats?.totalViews && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 px-4 py-2 rounded-full border border-green-500/20 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></div>
                    <span className="text-gray-200 font-medium">{formatViews(stats.totalViews)} total views</span>
                  </div>
                )}
                {isOwnChannel && stats?.totalLikes && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-pink-900/30 to-rose-900/30 px-4 py-2 rounded-full border border-pink-500/20 backdrop-blur-sm">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"></div>
                    <span className="text-gray-200 font-medium">{formatViews(stats.totalLikes)} total likes</span>
                  </div>
                )}
              </div>
              
              {/* Bio */}
              {channel.bio && (
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6">
                  <p className="text-gray-200 leading-relaxed text-lg whitespace-pre-wrap">
                    {channel.bio}
                  </p>
                </div>
              )}

              {/* Join Date */}
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  Joined {channel.createdAt || channel.joinedAt || channel.registeredAt ? 
                    formatTimeAgo(channel.createdAt || channel.joinedAt || channel.registeredAt) : 
                    'Unknown time'
                  }
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => {
                    console.log('Force refreshing channel...');
                    fetchChannelData();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-gray-600/60 hover:to-gray-500/60 text-white rounded-xl transition-all duration-300 transform hover:scale-105 border border-gray-500/30 backdrop-blur-sm"
                  title="Refresh Channel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                
                {/* Share Channel Button */}
                <ShareButton
                  onClick={() => shareChannel(id)}
                  size="medium"
                  variant="default"
                  title="Share Channel"
                />
                
                {user && !isOwnChannel && (
                  <div className="flex gap-4">
                    <button
                      onClick={handleSubscribe}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        isSubscribed
                          ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white border border-gray-500/30'
                          : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-red-500/25'
                      }`}
                    >
                      {isSubscribed ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          Subscribed
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Subscribe
                        </>
                      )}
                    </button>

                    <MessageButton receiverId={id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex border-b border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-700/20 rounded-t-2xl backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-8 py-4 font-semibold transition-all duration-300 relative ${
                activeTab === 'videos'
                  ? 'text-white bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Videos ({videos.length})
            </button>
            <button
              onClick={() => setActiveTab('tweets')}
              className={`flex items-center gap-2 px-8 py-4 font-semibold transition-all duration-300 relative ${
                activeTab === 'tweets'
                  ? 'text-white bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Tweets ({tweets.length})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-8 py-4 font-semibold transition-all duration-300 relative ${
                activeTab === 'about'
                  ? 'text-white bg-gradient-to-r from-green-600/20 to-cyan-600/20 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'videos' && (
          <div className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {videos.map((video) => (
                  <div key={video._id} className="transform hover:scale-105 transition-all duration-300">
                    <VideoCard video={video} channelData={channel} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-3">No videos uploaded yet</h3>
                <p className="text-gray-500 text-lg">This channel hasn't uploaded any videos.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tweets' && (
          <div className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
            {tweets.length > 0 ? (
              <div className="space-y-6">
                {tweets.map((tweet) => (
                  <div key={tweet._id} className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/60 transition-all duration-300 backdrop-blur-sm transform hover:scale-[1.02]">
                   <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-500/20">
                        {tweet.owner?.avatar ? (
                          <img
                            src={tweet.owner.avatar}
                            alt={tweet.owner.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {tweet.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tweet Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-semibold text-white text-base">{tweet.owner?.username}</span>
                          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                          <span className="text-sm text-gray-400">
                            {formatTimeAgo(tweet.createdAt)}
                          </span>
                        </div>
                        
                        {/* Tweet Text */}
                        <p className="text-gray-200 text-base leading-relaxed mb-6 whitespace-pre-wrap">
                          {tweet.content}
                        </p>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-6">
                          {/* Like Button */}
                          <button
                            onClick={() => handleTweetLike(tweet._id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                              tweet.isLiked 
                                ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20' 
                                : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-gray-700/50 hover:border-red-500/30'
                            }`}
                          >
                            <svg className="w-5 h-5" fill={tweet.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-sm font-medium">{tweet.likesCount || 0}</span>
                          </button>
                          
                          {/* Reply Button */}
                          <button 
                           onClick={() => setReplyToast(true)}
                           className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 transform hover:scale-105">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-sm font-medium">Reply</span>
                          </button>
                          
                          {/* Share Button */}
                          <button onClick={() => copyTweetUrl(tweet._id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-400 hover:text-green-400 hover:bg-green-500/10 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 transform hover:scale-105">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                            <span className="text-sm font-medium">Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5 5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM21 9.5h-4.17l1.83-1.83c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L14.5 9.5h-5L6.75 6.75c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L7.17 9.5H3c-.55 0-1 .45-1 1s.45 1 1 1h4.17l-1.83 1.83c-.39.39-.39 1.02 0 1.41.2.2.45.29.71.29s.51-.1.71-.29L9.5 12.5h5l2.75 2.75c.2.2.45.29.71.29s.51-.1.71-.29c.39-.39.39-1.02 0-1.41L16.83 11.5H21c.55 0 1-.45 1-1s-.45-1-1-1z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-3">No tweets yet</h3>
                <p className="text-gray-500 text-lg">This user hasn't shared any thoughts yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Channel Information</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Stats Section */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 text-center backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      {formatViews(stats?.totalSubscribers || 0)}
                    </div>
                    <div className="text-blue-300 font-medium">Subscribers</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-2xl p-6 text-center backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                      {stats?.totalVideos || 0}
                    </div>
                    <div className="text-green-300 font-medium">Videos</div>
                  </div>
                </div>
                
                {/* Channel Details */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                      {channel.bio || 'No description available.'}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-700/20 border border-gray-600/30 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Statistics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-700/30 to-gray-600/20 rounded-xl">
                        <span className="text-gray-400 font-medium">Joined</span>
                        <span className="text-white font-semibold">
                          {channel.createdAt ? formatTimeAgo(channel.createdAt) : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-700/30 to-gray-600/20 rounded-xl">
                        <span className="text-gray-400 font-medium">Total views</span>
                        <span className="text-white font-semibold">{formatViews(stats?.totalViews || 0)}</span>
                      </div>
                      {isOwnChannel && stats?.totalLikes && (
                        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-700/30 to-gray-600/20 rounded-xl">
                          <span className="text-gray-400 font-medium">Total likes</span>
                          <span className="text-white font-semibold">{formatViews(stats.totalLikes)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Channel Avatar Section */}
              <div className="space-y-8">
                <div className="text-center">
                  <div className="relative group mb-6">
                    <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gradient-to-r from-purple-500/50 to-pink-500/50 shadow-2xl">
                      {channel.avatar ? (
                        <img
                          src={channel.avatar}
                          alt={channel.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <span className="text-6xl font-bold text-white">
                            {channel.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500 -z-10"></div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-600/40 rounded-2xl p-6 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                      {channel.fullname || channel.username}
                    </h3>
                    <p className="text-gray-400 text-lg mb-4">@{channel.username}</p>
                    
                    {/* Additional Info */}
                    <div className="grid grid-cols-1 gap-4">
                      {stats?.totalSubscribers > 0 && (
                        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl p-4">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {formatViews(stats.totalSubscribers)}
                          </div>
                          <div className="text-sm text-blue-300">Subscribers</div>
                        </div>
                      )}
                      
                      {stats?.totalVideos > 0 && (
                        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/20 rounded-xl p-4">
                          <div className="text-2xl font-bold text-green-400 mb-1">
                            {stats.totalVideos}
                          </div>
                          <div className="text-sm text-green-300">Videos Published</div>
                        </div>
                      )}
                      
                      {isOwnChannel && stats?.totalViews > 0 && (
                        <div className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 border border-pink-500/20 rounded-xl p-4">
                          <div className="text-2xl font-bold text-pink-400 mb-1">
                            {formatViews(stats.totalViews)}
                          </div>
                          <div className="text-sm text-pink-300">Total Views</div>
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
      
      {/* Toast Notifications */}
      {showToast && (
        <Toast
          message="Channel URL copied to clipboard!"
          type="success"
          duration={2000}
          onClose={closeToast}
        />
      )}

      {tweetToast && (
        <Toast
          message="Tweet URL copied!"
          type="success"
          duration={2000}
          onClose={() => setTweetToast(false)}
        />
      )}

      {replyToast && (
        <Toast
          message="You are not allowed to reply on this tweet."
          type="error"
          duration={2000}
          onClose={() => setReplyToast(false)}
        />
      )}  

      {loginToast && (
        <Toast
          message="Please log in to like tweets!"
          type="error"
          duration={2000}
          onClose={() => setLoginToast(false)}
        />
      )}
    </div>
  );
}