import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { subscriptionAPI } from "../api/subscription";
import { videoAPI } from "../api/video";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";

export default function Subscriptions() {
  const { user } = useContext(AuthContext);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchSubscribedChannels();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscribedChannels = async () => {
    try {
      const response = await subscriptionAPI.getSubscribedChannels(user._id);
      const channels = response.data.data || [];
      setSubscribedChannels(channels);
      
      // After getting channels, fetch their recent videos
      if (channels.length > 0) {
        await fetchRecentVideosFromSubscriptions(channels);
      } else {
        setRecentVideos([]);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching subscribed channels:", err);
      setSubscribedChannels([]);
      setRecentVideos([]);
      setLoading(false);
    }
  };

  const fetchRecentVideosFromSubscriptions = async (channels = subscribedChannels) => {
    try {
      // Fetch all videos and filter by subscribed channels
      const response = await videoAPI.getAllVideos({ 
        limit: 20, 
        sortBy: 'createdAt', 
        sortType: 'desc' 
      });
      
      const allVideos = response.data?.data?.videos || response.data?.videos || [];
      
      // Filter videos by subscribed channels
      if (channels.length > 0) {
        const subscribedChannelIds = channels.map(channel => channel.channelId);
        const filteredVideos = allVideos.filter(video => 
          video.owner && subscribedChannelIds.includes(video.owner._id)
        );
        setRecentVideos(filteredVideos);
      } else {
        setRecentVideos([]);
      }
    } catch (err) {
      console.error("Error fetching videos from subscriptions:", err);
      setRecentVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const formatSubscribeDate = (date) => {
    if (!date) return 'recently';
    
    const subscribeDate = new Date(date);
    if (isNaN(subscribeDate.getTime())) return 'recently';
    
    const now = new Date();
    const diffInDays = Math.floor((now - subscribeDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-300 to-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <svg className="w-12 h-12 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-light text-slate-100 mb-4">Sign in to view your subscriptions</h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
            Create an account or sign in to subscribe to channels and see their latest videos here.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/login"
              className="px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-white transition-all duration-300 font-medium shadow-lg hover:shadow-xl active:scale-95"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="px-8 py-4 bg-slate-800/60 text-slate-300 rounded-2xl hover:bg-slate-700/60 hover:text-white transition-all duration-300 font-medium border border-slate-700/30"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950">
      {/* Hero Section */}
      <div className="px-8 pt-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Background decorations */}
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
            
            {/* Main header container */}
            <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-3xl p-8 border border-slate-800/30 shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-6 mb-4">
                {/* Subscription icon */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18,13c0,3.31-2.69,6-6,6s-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6M20,19.59V8.41C20,6.01,17.99,4,15.59,4H8.41 C6.01,4,4,6.01,4,8.41v11.17C4,21.99,6.01,24,8.41,24h7.17C17.99,24,20,21.99,20,19.59z"/>
                    </svg>
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-75 blur animate-pulse"></div>
                </div>
                
                {/* Title section */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-light text-slate-100 mb-2 tracking-tight">
                    Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-normal">Subscriptions</span>
                  </h1>
                  <p className="text-xl text-slate-400 font-light leading-relaxed">
                    📺 Latest videos from channels you follow • {subscribedChannels.length} subscriptions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribed Channels Section */}
      {subscribedChannels.length > 0 && (
        <div className="px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-light text-slate-100">Your Channels</h2>
              <div className="px-4 py-2 bg-slate-800/60 rounded-2xl border border-slate-700/30">
                <span className="text-slate-300 text-sm font-medium">{subscribedChannels.length} subscriptions</span>
              </div>
            </div>
            
            {/* Premium Channels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
              {subscribedChannels.map((channel, index) => (
                <Link 
                  key={channel.channelId} 
                  to={`/channel/${channel.channelId}`}
                  className="group block"
                >
                  <div className="relative">
                    {/* Channel Avatar */}
                    <div className="relative mx-auto mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl group-hover:rotate-3 border-2 border-slate-700/20">
                        {channel.avatar ? (
                          <img
                            src={channel.avatar}
                            alt={channel.username}
                            className="w-full h-full rounded-3xl object-contain bg-gray-800"
                          />
                        ) : (
                          <span className="text-slate-900 font-bold text-2xl">
                            {channel.username?.charAt(0)?.toUpperCase() || 'C'}
                          </span>
                        )}
                      </div>
                      
                      {/* Online/Active indicator */}
                      <div className="absolute -bottom-1 -right-1">
                        <div className="w-6 h-6 bg-green-500 rounded-full border-3 border-slate-900 flex items-center justify-center shadow-lg">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      
                      {/* Hover glow effect */}
                      <div className="absolute -inset-3 bg-gradient-to-r from-slate-400/20 via-slate-300/30 to-slate-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 blur-xl"></div>
                    </div>
                    
                    {/* Channel Info */}
                    <div className="text-center space-y-1">
                      <h3 className="text-slate-200 font-medium text-sm group-hover:text-white transition-colors duration-300 truncate">
                        {channel.username || channel.fullname}
                      </h3>
                      <p className="text-slate-500 text-xs">
                        Subscribed {formatSubscribeDate(channel.subscribedAt)}
                      </p>
                      
                      {/* Premium badge for early subscribers */}
                      {index < 3 && (
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className="text-yellow-400 text-xs font-medium">Early Fan</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Floating number indicator */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Videos Section */}
      <div className="px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {subscribedChannels.length === 0 ? (
            /* No Subscriptions Empty State */
            <div className="text-center py-16">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto border border-slate-800/30">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 9l-9-5v10l9-5z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-slate-100 mb-4">No subscriptions yet</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Start following your favorite creators to see their latest videos here.
                </p>
                <Link 
                  to="/"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-white transition-all duration-300 font-medium shadow-lg hover:shadow-xl active:scale-95"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                  Explore Videos
                </Link>
              </div>
            </div>
          ) : recentVideos.length > 0 ? (
            /* Videos from Subscriptions */
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-light text-slate-100">Latest Videos</h2>
                <div className="px-4 py-2 bg-slate-800/60 rounded-2xl border border-slate-700/30">
                  <span className="text-slate-300 text-sm font-medium">{recentVideos.length} new videos</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentVideos.map((video) => (
                  <div key={video._id} className="group">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-800/30 hover:border-slate-700/50 transition-all duration-500 hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)]">
                      <VideoCard video={video} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* No Recent Videos from Subscriptions */
            <div className="text-center py-16">
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-12 max-w-lg mx-auto border border-slate-800/30">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-light text-slate-100 mb-4">No recent videos</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Your subscribed channels haven't posted any new content recently.
                </p>
                <Link 
                  to="/trending"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/60 text-slate-300 rounded-2xl hover:bg-slate-700/60 hover:text-white transition-all duration-300 font-medium border border-slate-700/30"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                  Check Trending
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}