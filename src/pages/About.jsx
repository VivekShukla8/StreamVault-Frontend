import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../features/auth/AuthContext";
import { getMyChannelStats, getUserChannelProfile } from "../api/user";
import { channelAPI } from "../api/channel";
import Loader from "../components/Loader";

export default function About() {
  const { user } = useContext(AuthContext);
  const { id: channelId } = useParams(); // Get channel ID from URL
  const [channelData, setChannelData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnChannel, setIsOwnChannel] = useState(false);

  useEffect(() => {
    if (channelId) {
      // If there's a channel ID in URL, fetch that channel's data
      fetchChannelData(channelId);
    } else if (user) {
      // If no channel ID but user is logged in, show user's own channel
      setIsOwnChannel(true);
      fetchOwnChannelData();
    } else {
      setLoading(false);
    }
  }, [channelId, user]);

  const fetchChannelData = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if this is the user's own channel
      if (user && user._id === id) {
        setIsOwnChannel(true);
        await fetchOwnChannelData();
        return;
      }
      
      // Fetch public channel data
      const channelResponse = await channelAPI.getChannel(id);
      const channelInfo = channelResponse.data?.data;
      
      if (channelInfo) {
        setChannelData(channelInfo.channel);
        setStats(channelInfo.stats);
      }
    } catch (err) {
      console.error('Error fetching channel data:', err);
      setError('Failed to load channel information');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnChannelData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyChannelStats();
      const userData = response.data?.data;
      setChannelData(userData);
      setStats(userData);
    } catch (err) {
      console.error('Error fetching own channel stats:', err);
      setError('Failed to load channel statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateChannelAge = (createdAt) => {
    if (!createdAt) return 'Unknown';
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMs = now - created;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 30) return `${diffInDays} days`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
    return `${Math.floor(diffInDays / 365)} years`;
  };

  const getEngagementRate = () => {
    if (!stats?.totalViews || !stats?.totalLikes) return '0';
    return ((stats.totalLikes / stats.totalViews) * 100).toFixed(1);
  };

  const getAverageViewsPerVideo = () => {
    if (!stats?.totalViews || !stats?.videosCount) return '0';
    return Math.floor(stats.totalViews / stats.videosCount);
  };

  // Use channelData if available, otherwise fall back to user data
  const displayData = channelData || user;
  const displayStats = stats || {};

  if (!channelId && !user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-slate-900/80 via-gray-900/80 to-zinc-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to view stats</h2>
          <p className="text-slate-400 mb-6">View detailed analytics about any channel's performance</p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {channelId ? `${displayData?.username || 'Channel'} Analytics` : 'Channel Analytics'}
              </h1>
              <p className="text-slate-400">
                {channelId 
                  ? `Performance insights for ${displayData?.fullname || displayData?.username || 'this channel'}` 
                  : 'Comprehensive insights about your channel performance'
                }
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-2xl">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => channelId ? fetchChannelData(channelId) : fetchOwnChannelData()}
              className="mt-2 px-4 py-2 bg-red-700/50 text-red-200 rounded-xl hover:bg-red-700/70 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Channel Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-900/40 via-blue-800/40 to-blue-900/40 backdrop-blur-xl border border-blue-700/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <div className="text-sm text-blue-300">Total Subscribers</div>
                    <div className="text-3xl font-bold text-white">{formatNumber(displayStats?.subscribersCount || 0)}</div>
                  </div>
                </div>
                <div className="text-xs text-blue-200/60">People following your channel</div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 via-green-800/40 to-green-900/40 backdrop-blur-xl border border-green-700/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div>
                    <div className="text-sm text-green-300">Total Views</div>
                    <div className="text-3xl font-bold text-white">{formatNumber(displayStats?.totalViews || 0)}</div>
                  </div>
                </div>
                <div className="text-xs text-green-200/60">Across all your content</div>
              </div>

              <div className="bg-gradient-to-br from-red-900/40 via-red-800/40 to-red-900/40 backdrop-blur-xl border border-red-700/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">❤️</span>
                  </div>
                  <div>
                    <div className="text-sm text-red-300">Total Likes</div>
                    <div className="text-3xl font-bold text-white">{formatNumber(displayStats?.totalLikes || 0)}</div>
                  </div>
                </div>
                <div className="text-xs text-red-200/60">From your videos</div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-xl border border-purple-700/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <div>
                    <div className="text-sm text-purple-300">Videos Created</div>
                    <div className="text-3xl font-bold text-white">{displayStats?.videosCount || 0}</div>
                  </div>
                </div>
                <div className="text-xs text-purple-200/60">Content published</div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Performance Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{getEngagementRate()}%</div>
                  <div className="text-sm text-slate-400">Engagement Rate</div>
                  <div className="text-xs text-slate-500 mt-1">Likes per view</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{formatNumber(getAverageViewsPerVideo())}</div>
                  <div className="text-sm text-slate-400">Avg Views/Video</div>
                  <div className="text-xs text-slate-500 mt-1">Per content piece</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🐦</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{displayStats?.tweetsCount || 0}</div>
                  <div className="text-sm text-slate-400">Tweets Posted</div>
                  <div className="text-xs text-slate-500 mt-1">Social content</div>
                </div>
              </div>
            </div>

            {/* Growth Insights */}
            <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Growth Insights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">🎯</span>
                    <span className="font-medium text-white">Subscriber Goals</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Current</span>
                      <span className="text-white">{formatNumber(displayStats?.subscribersCount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Next Milestone</span>
                      <span className="text-blue-400">
                        {displayStats?.subscribersCount < 100 ? '100' : 
                         displayStats?.subscribersCount < 1000 ? '1K' :
                         displayStats?.subscribersCount < 10000 ? '10K' :
                         displayStats?.subscribersCount < 100000 ? '100K' : '1M'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl">📅</span>
                    <span className="font-medium text-white">Channel Age</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Created</span>
                      <span className="text-white">{formatDate(displayStats?.createdAt || displayData?.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Age</span>
                      <span className="text-green-400">{calculateChannelAge(displayStats?.createdAt || displayData?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Profile */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Channel Profile</h2>
              
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <img
                    src={displayData?.avatar || '/api/placeholder/120/120'}
                    alt={displayData?.fullname || displayData?.username}
                    className="w-20 h-20 rounded-full object-contain bg-gray-700 border-2 border-slate-600"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800"></div>
                </div>
                <h3 className="text-lg font-semibold text-white">{displayData?.fullname || displayData?.username}</h3>
                <p className="text-slate-400">@{displayData?.username}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white text-sm">{isOwnChannel ? displayData?.email : 'Private'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Joined</span>
                  <span className="text-white text-sm">{formatDate(displayData?.createdAt)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Subscriptions</span>
                  <span className="text-white text-sm">{displayStats?.subscriptionsCount || 0}</span>
                </div>
              </div>

              {isOwnChannel && (
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <Link
                    to="/profile/edit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600/50 to-blue-700/50 text-blue-200 rounded-xl hover:from-blue-600/70 hover:to-blue-700/70 transition-all duration-300"
                  >
                    <span>⚙️</span>
                    Edit Profile
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/upload"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-900/30 border border-red-700/30 text-red-300 rounded-xl hover:bg-red-900/50 transition-colors"
                >
                  <span>📤</span>
                  Upload Video
                </Link>
                
                <Link
                  to="/profile/analytics"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-900/30 border border-blue-700/30 text-blue-300 rounded-xl hover:bg-blue-900/50 transition-colors"
                >
                  <span>📊</span>
                  View Analytics
                </Link>
                
                <Link
                  to="/profile/videos"
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-900/30 border border-green-700/30 text-green-300 rounded-xl hover:bg-green-900/50 transition-colors"
                >
                  <span>🎥</span>
                  Manage Videos
                </Link>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {displayStats?.subscribersCount >= 100 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-xl">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <div className="text-yellow-300 font-medium">100 Subscribers</div>
                      <div className="text-yellow-200/60 text-xs">Growing community</div>
                    </div>
                  </div>
                )}
                
                {displayStats?.videosCount >= 10 && (
                  <div className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-700/30 rounded-xl">
                    <span className="text-2xl">🎬</span>
                    <div>
                      <div className="text-purple-300 font-medium">Content Creator</div>
                      <div className="text-purple-200/60 text-xs">10+ videos uploaded</div>
                    </div>
                  </div>
                )}
                
                {displayStats?.totalViews >= 1000 && (
                  <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-700/30 rounded-xl">
                    <span className="text-2xl">👁️</span>
                    <div>
                      <div className="text-green-300 font-medium">1K Views</div>
                      <div className="text-green-200/60 text-xs">Reaching audiences</div>
                    </div>
                  </div>
                )}
                
                {(!displayStats?.subscribersCount || displayStats?.subscribersCount < 100) && 
                 (!displayStats?.videosCount || displayStats?.videosCount < 10) && 
                 (!displayStats?.totalViews || displayStats?.totalViews < 1000) && (
                  <div className="text-center py-4">
                    <span className="text-slate-400 text-sm">Keep creating to unlock achievements!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}