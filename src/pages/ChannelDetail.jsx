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
      setLoginToast(true); // show toast instead of alert
      setTimeout(() => setLoginToast(false), 2000); // auto-hide after 2 sec
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
        setTweetToast(true); // Show toast
        setTimeout(() => setTweetToast(false), 2000); // Hide after 2 sec
      })
      .catch(err => {
        console.error('Failed to copy tweet URL:', err);
      });
  };


  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!channel) return <div className="text-center p-8">Channel not found</div>;

  const isOwnChannel = user && user._id === id;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Channel Header */}
      <div className="mb-8">
        {/* Cover Image */}
        {channel.coverImage && !coverImageError ? (
          <div className="h-40 md:h-48 bg-gray-800 rounded-lg mb-6 overflow-hidden relative">
            <img
              src={channel.coverImage}
              alt="Cover"
              className="w-full h-full object-contain bg-gray-800"
              onError={() => {
                console.warn('Cover image failed to load:', channel.coverImage);
                console.log('Channel object:', channel);
                setCoverImageError(true);
                setCoverImageLoading(false);
              }}
              onLoad={() => {
                console.log('Cover image loaded successfully:', channel.coverImage);
                setCoverImageError(false);
                setCoverImageLoading(false);
              }}
              onLoadStart={() => {
                console.log('Cover image loading started:', channel.coverImage);
                setCoverImageLoading(true);
              }}
            />
            {/* Loading overlay for cover image */}
            {coverImageLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-white text-sm">Loading cover image...</p>
                </div>
              </div>
            )}
          </div>
        ) : channel.coverImage && coverImageError ? (
          <div className="h-40 md:h-48 bg-gray-800 rounded-lg mb-6 overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-white opacity-30 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
              <p className="text-white text-lg opacity-50 mb-2">Cover image failed to load</p>
              <button 
                onClick={() => {
                  setCoverImageError(false);
                  setCoverImageLoading(true);
                  // Force reload the image
                  const img = new Image();
                  img.onload = () => setCoverImageLoading(false);
                  img.onerror = () => {
                    setCoverImageError(true);
                    setCoverImageLoading(false);
                  };
                  img.src = channel.coverImage;
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {/* Channel Info */}
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 md:w-32 md:h-32 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 relative">
            {channel.avatar && !avatarError ? (
              <img
                src={channel.avatar}
                alt={channel.username}
                className="w-full h-full rounded-full object-contain bg-gray-700"
                onError={() => {
                  console.warn('Avatar failed to load:', channel.avatar);
                  setAvatarError(true);
                }}
                onLoad={() => {
                  if (channel.avatar) setAvatarError(false);
                }}
              />
            ) : (
              <span className="text-2xl md:text-4xl font-bold text-white">
                {channel.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{channel.username}</h1>
            
            {/* Channel Stats */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-4 text-sm text-gray-400">
              <span>{formatViews(stats?.totalSubscribers || 0)} subscribers</span>
              <span>{stats?.totalVideos || 0} videos</span>
              {isOwnChannel && stats?.totalViews && (
                <span>{formatViews(stats.totalViews)} total views</span>
              )}
              {isOwnChannel && stats?.totalLikes && (
                <span>{formatViews(stats.totalLikes)} total likes</span>
              )}
            </div>
            
            {channel.fullname && (
              <p className="text-gray-300 mb-2">{channel.fullname}</p>
            )}
            
            {channel.bio && (
              <p className="text-gray-300 max-w-2xl mb-4 whitespace-pre-wrap">
                {channel.bio}
              </p>
            )}

            {/* Join Date */}
            <p className="text-gray-400 text-sm mb-4">
              Joined {channel.createdAt || channel.joinedAt || channel.registeredAt ? 
                formatTimeAgo(channel.createdAt || channel.joinedAt || channel.registeredAt) : 
                'Unknown time'
              }
            </p>

            {/* Subscribe Button & Debug */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  console.log('Force refreshing channel...');
                  fetchChannelData();
                }}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm"
                title="Refresh Channel"
              >
                🔄
              </button>
              
              {/* Share Channel Button */}
              <ShareButton
                onClick={() => shareChannel(id)}
                size="medium"
                variant="default"
                title="Share Channel"
              />
              
              {user && !isOwnChannel && (
                <div className="flex gap-3">
                  <button
                    onClick={handleSubscribe}
                    className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                      isSubscribed
                        ? 'bg-gray-200 text-black hover:bg-gray-300 active:shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] active:scale-95'
                        : 'bg-red-600 text-white hover:bg-red-700 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95'
                    }`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }} // Force pointer events
                  >
                    {isSubscribed ? (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Subscribed
                      </div>
                    ) : (
                      'Subscribe'
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
      <div className="mb-6">
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 font-medium transition-all duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95 ${
              activeTab === 'videos'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Videos ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('tweets')}
            className={`px-4 py-2 font-medium transition-all duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95 ${
              activeTab === 'tweets'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tweets ({tweets.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 font-medium transition-all duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95 ${
              activeTab === 'about'
                ? 'text-white border-b-2 border-red-600'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            About
          </button>

           
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'videos' && (
        <div>
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} channelData={channel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No videos uploaded yet</div>
              <p className="text-gray-500">This channel hasn't uploaded any videos.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tweets' && (
        <div>
          {tweets.length > 0 ? (
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <div key={tweet._id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      {tweet.owner?.avatar ? (
                        <img
                          src={tweet.owner.avatar}
                          alt={tweet.owner.username}
                          className="w-full h-full object-contain bg-gray-800"
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-white text-base">{tweet.owner?.username}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-400">
                          {formatTimeAgo(tweet.createdAt)}
                        </span>
                      </div>
                      
                      {/* Tweet Text */}
                      <p className="text-gray-200 text-base leading-relaxed mb-4 whitespace-pre-wrap">
                        {tweet.content}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-6">
                        {/* Like Button */}
                        <button
                          onClick={() => handleTweetLike(tweet._id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95 ${
                            tweet.isLiked 
                              ? 'text-red-500 hover:bg-red-500/10' 
                              : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
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
                         className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm font-medium">Reply</span>
                        </button>
                        
                        {/* Share Button */}
                        <button onClick={() => copyTweetUrl(tweet._id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-500/10 transition-all duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95">
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
            <div className="text-center py-16">
              <div className="bg-gray-900 rounded-2xl p-8 max-w-md mx-auto border border-gray-800">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.5 5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM21 9.5h-4.17l1.83-1.83c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L14.5 9.5h-5L6.75 6.75c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L7.17 9.5H3c-.55 0-1 .45-1 1s.45 1 1 1h4.17l-1.83 1.83c-.39.39-.39 1.02 0 1.41.2.2.45.29.71.29s.51-.1.71-.29L9.5 12.5h5l2.75 2.75c.2.2.45.29.71.29s.51-.1.71-.29c.39-.39.39-1.02 0-1.41L16.83 11.5H21c.55 0 1-.45 1-1s-.45-1-1-1z"/>
                  </svg>
                </div>
                <div className="text-gray-400 text-lg mb-2">No tweets yet</div>
                <p className="text-gray-500">This user hasn't shared any thoughts yet.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'about' && (
        <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Channel Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Stats */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-900/30 border border-blue-700/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{formatViews(stats?.totalSubscribers || 0)}</div>
                  <div className="text-blue-300 text-sm">Subscribers</div>
                </div>
                <div className="bg-green-900/30 border border-green-700/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stats?.totalVideos || 0}</div>
                  <div className="text-green-300 text-sm">Videos</div>
                </div>
              </div>
              
              {/* Channel Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {channel.bio || 'No description available.'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Joined</span>
                      <span className="text-white">
                        {channel.createdAt ? formatTimeAgo(channel.createdAt) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total views</span>
                      <span className="text-white">{formatViews(stats?.totalViews || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Channel Avatar */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-600">
                  {channel.avatar ? (
                    <img
                      src={channel.avatar}
                      alt={channel.username}
                      className="w-full h-full object-contain bg-gray-800"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {channel.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{channel.fullname || channel.username}</h3>
                <p className="text-gray-400">@{channel.username}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
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
