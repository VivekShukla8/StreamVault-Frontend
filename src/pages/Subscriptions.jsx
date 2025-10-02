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
  const [activeTab, setActiveTab] = useState("videos"); // 'videos' or 'channels'

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
      const response = await videoAPI.getAllVideos({
        limit: 20,
        sortBy: "createdAt",
        sortType: "desc",
      });

      const allVideos = response.data?.data?.videos || response.data?.videos || [];

      if (channels.length > 0) {
        const subscribedChannelIds = channels.map((channel) => channel.channelId);
        const filteredVideos = allVideos.filter(
          (video) => video.owner && subscribedChannelIds.includes(video.owner._id)
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
    if (!date) return "recently";

    const subscribeDate = new Date(date);
    if (isNaN(subscribeDate.getTime())) return "recently";

    const now = new Date();
    const diffInDays = Math.floor((now - subscribeDate) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950 flex items-center justify-center p-3 sm:p-4 md:p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative text-center max-w-md w-full px-3 sm:px-4">
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Join the{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Community
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mb-8 leading-relaxed">
            Sign in to follow your favorite creators and never miss their latest uploads
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/login"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Sign In Now</span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/register"
              className="px-8 py-4 bg-white/5 backdrop-blur-sm text-white rounded-2xl font-semibold border-2 border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Create Account
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
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Hero Section */}
      <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-16 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Glassmorphic Header Card */}
          <div className="relative bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-900/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-10 border border-white/5 shadow-2xl overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left section */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-60"></div>
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <svg
                        className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-1">
                      Subscriptions
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400">
                      Stay updated with your favorite creators
                    </p>
                  </div>
                </div>
              </div>

              {/* Right section - Stats */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center px-4 sm:px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {subscribedChannels.length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Channels</div>
                </div>
                <div className="text-center px-4 sm:px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {recentVideos.length}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Videos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {subscribedChannels.length > 0 && (
        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="inline-flex bg-slate-900/40 backdrop-blur-xl rounded-2xl p-1.5 border border-white/5">
              <button
                onClick={() => setActiveTab("videos")}
                className={`px-6 sm:px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === "videos"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Latest Videos
              </button>
              <button
                onClick={() => setActiveTab("channels")}
                className={`px-6 sm:px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === "channels"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                All Channels
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          {subscribedChannels.length === 0 ? (
            // Premium Empty State
            <div className="flex items-center justify-center py-12 sm:py-16 md:py-24">
              <div className="relative max-w-xl w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-white/5 text-center">
                  <div className="relative inline-flex mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 sm:w-14 sm:h-14 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Start Your Journey</h3>
                  <p className="text-slate-400 text-sm sm:text-base mb-8 leading-relaxed">
                    Discover amazing creators and subscribe to their channels to see their latest content here
                  </p>

                  <Link
                    to="/"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Explore Content
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Channels View */}
              {activeTab === "channels" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                  {subscribedChannels.map((channel, index) => (
                    <Link
                      key={channel.channelId}
                      to={`/channel/${channel.channelId}`}
                      className="group"
                    >
                      <div className="relative bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                        {/* Channel Avatar */}
                        <div className="relative mb-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="relative w-full aspect-square bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl overflow-hidden">
                            {channel.avatar ? (
                              <img
                                src={channel.avatar}
                                alt={channel.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-3xl font-bold text-slate-300">
                                  {channel.username?.charAt(0)?.toUpperCase() || "C"}
                                </span>
                              </div>
                            )}
                          </div>

                                                    {/* Online indicator */}
                          <div className="absolute -bottom-1 -right-1">
                            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        {/* Channel Info */}
                        <div className="text-center space-y-1">
                          <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                            {channel.username || channel.fullname}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {formatSubscribeDate(channel.subscribedAt)}
                          </p>
                        </div>

                        {/* Premium badge */}
                        {index < 3 && (
                          <div className="absolute top-3 left-3">
                            <div className="px-2 py-1 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm rounded-lg flex items-center gap-1">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <span className="text-xs font-bold text-white">Top</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Videos View */}
              {activeTab === "videos" && (
                <>
                  {recentVideos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                      {recentVideos.map((video, index) => (
                        <div
                          key={video._id}
                          className="group transform transition-all duration-500 hover:-translate-y-2"
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animation: "fadeInUp 0.6s ease-out forwards",
                            opacity: 0,
                          }}
                        >
                          <div className="bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20">
                            <VideoCard video={video} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // No Videos Empty State
                    <div className="flex items-center justify-center py-16">
                      <div className="relative max-w-md w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-3xl blur-3xl"></div>
                        <div className="relative bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-2xl rounded-3xl p-8 sm:p-12 border border-white/5 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                              className="w-10 h-10 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </div>

                          <h3 className="text-xl font-bold text-white mb-3">No Recent Uploads</h3>
                          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Your subscribed channels haven't posted new content yet
                          </p>

                          <Link
                            to="/trending"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/10 hover:bg-white/10 transition-all duration-300"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            </svg>
                            Explore Trending
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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
