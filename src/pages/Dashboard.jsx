import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../features/auth/AuthContext";
import { getMyChannelStats } from "../api/user";
import { videoAPI } from "../api/video";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsResponse = await getMyChannelStats();
      setStats(statsResponse.data?.data);
      
      const videosResponse = await videoAPI.getAllVideos({ 
        userId: user._id,
        limit: 6 
      });
      const videos = videosResponse.data?.data?.videos || videosResponse.data?.videos || [];
      setRecentVideos(videos);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-md w-full relative z-10">
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 text-center shadow-2xl">
            <div className="relative inline-flex mb-4 sm:mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-2 sm:mb-3">
              Access Your Dashboard
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mb-6 sm:mb-8">Manage your channel and track your content performance</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white rounded-xl sm:rounded-2xl transition-all duration-300 font-bold text-sm sm:text-base shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl sm:rounded-2xl blur-lg opacity-50"></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Channel Dashboard
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base lg:text-lg">Welcome back, {user.fullname}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Link
                to="/upload"
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transform hover:scale-105 active:scale-95 text-xs sm:text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden sm:inline">Upload Video</span>
                <span className="sm:hidden">Upload</span>
              </Link>
              <Link
                to={`/profile/videos`}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-300 shadow-xl shadow-slate-500/20 hover:shadow-slate-500/40 transform hover:scale-105 active:scale-95 text-xs sm:text-sm border border-slate-600/50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span className="hidden sm:inline">View Channel</span>
                <span className="sm:hidden">Channel</span>
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 sm:gap-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 min-w-[90px] px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 text-xs sm:text-sm md:text-base whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-xl shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 min-w-[90px] px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 text-xs sm:text-sm md:text-base whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-xl shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 min-w-[90px] px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 text-xs sm:text-sm md:text-base whitespace-nowrap ${
                activeTab === 'content'
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white shadow-xl shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Content
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl sm:rounded-2xl p-4 sm:p-5">
            <p className="text-red-400 font-medium mb-2 sm:mb-3 text-sm sm:text-base">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 sm:px-5 py-2 bg-red-700/50 hover:bg-red-700/70 text-red-200 rounded-lg transition-colors font-semibold text-xs sm:text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-cyan-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-cyan-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-600/10 group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg sm:rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <div className="text-xl sm:text-2xl font-bold text-white">{formatNumber(stats?.subscribersCount || 0)}</div>
                    <div className="text-cyan-400 text-[10px] sm:text-xs font-medium">Subscribers</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-green-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-green-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-600/10 group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <div className="text-xl sm:text-2xl font-bold text-white">{formatNumber(stats?.totalViews || 0)}</div>
                    <div className="text-green-400 text-[10px] sm:text-xs font-medium">Total Views</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-pink-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-pink-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-600/10 group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg sm:rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <div className="text-xl sm:text-2xl font-bold text-white">{formatNumber(stats?.totalLikes || 0)}</div>
                    <div className="text-pink-400 text-[10px] sm:text-xs font-medium">Total Likes</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-purple-800/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-purple-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/10 group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg sm:rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <div className="text-xl sm:text-2xl font-bold text-white">{stats?.videosCount || 0}</div>
                    <div className="text-purple-400 text-[10px] sm:text-xs font-medium">Videos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Videos */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-4 sm:mb-6">Recent Videos</h2>
              {recentVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {recentVideos.map((video, index) => (
                    <div 
                      key={video._id} 
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        opacity: 0
                      }}
                      className="transform transition-all duration-500 hover:-translate-y-2"
                    >
                      <VideoCard
                        video={video}
                        channelData={{
                          _id: user._id,
                          username: user.username,
                          avatar: user.avatar
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="relative inline-flex mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-slate-400 text-base sm:text-lg mb-4 sm:mb-6">No videos uploaded yet</p>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white rounded-xl sm:rounded-2xl transition-all duration-300 font-bold text-sm sm:text-base shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload Your First Video
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12">
            <div className="text-center">
              <div className="relative inline-flex mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-2 sm:mb-3">Detailed Analytics</h3>
              <p className="text-slate-400 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 px-4">Get comprehensive insights about your channel performance</p>
              <Link
                to="/profile/analytics"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white rounded-xl sm:rounded-2xl transition-all duration-300 font-bold text-sm sm:text-base shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Full Analytics
              </Link>
            </div>
          </div>
        )}
        
        {activeTab === 'content' && (
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Content Management</h2>
              <Link
                to="/profile/videos"
                className="w-full sm:w-auto text-center px-5 py-2.5 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-bold text-sm shadow-xl shadow-slate-500/20 hover:shadow-slate-500/40 transform hover:scale-105 active:scale-95 border border-slate-600/50"
              >
                View All Videos
              </Link>
            </div>
            
            {recentVideos.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentVideos.slice(0, 5).map((video, index) => (
                  <div
                    key={video._id}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animation: 'fadeInUp 0.5s ease-out forwards',
                      opacity: 0
                    }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 p-3 sm:p-5 bg-slate-800/40 rounded-xl hover:bg-slate-800/60 transition-all duration-300 border border-slate-700/30 hover:border-slate-600/50"
                  >
                    <img
                      src={video.thumbnail || '/api/placeholder/120/68'}
                      alt={video.title}
                      className="w-full sm:w-24 md:w-28 h-32 sm:h-14 md:h-16 object-cover bg-slate-800 rounded-lg shadow-lg"
                    />
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-bold text-white truncate text-base sm:text-lg mb-2">{video.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400">
                        <span className="font-medium">{formatNumber(video.views || 0)} views</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-[10px] sm:text-sm">{formatDate(video.createdAt)}</span>
                        <span className={`px-2 sm:px-3 py-1 rounded-lg font-semibold text-[10px] sm:text-xs ${
                          video.isPublished 
                            ? 'bg-green-900/50 text-green-300 border border-green-700/50' 
                            : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50'
                        }`}>
                          {video.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/video/${video._id}`}
                      className="w-full sm:w-auto text-center px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-800/60 hover:bg-slate-800 text-white rounded-lg transition-all duration-300 font-semibold text-xs sm:text-sm border border-slate-700/50 hover:border-slate-600/70"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="relative inline-flex mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                  </div>
                </div>
                <p className="text-slate-400 text-base sm:text-lg mb-4 sm:mb-6">No content available</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white rounded-xl sm:rounded-2xl transition-all duration-300 font-bold text-sm sm:text-base shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Create Content
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
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

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 5s ease infinite;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        /* Hide scrollbar for tab navigation */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (max-width: 640px) {
          .animate-pulse {
            animation-duration: 3s;
          }
        }
      `}</style>
    </div>
  );
}