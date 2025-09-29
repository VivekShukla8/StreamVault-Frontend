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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gray-950/70 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-500/20">
              <svg className="w-10 h-10 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-3">
              Access Your Dashboard
            </h2>
            <p className="text-gray-400 mb-6">Manage your channel and track your content performance</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text">
                  Channel Dashboard
                </h1>
                <p className="text-gray-400 text-lg">Welcome back, {user.fullname}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                to="/upload"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:scale-105 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Video
              </Link>
              <Link
                to={`/profile/videos`}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                View Channel
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                activeTab === 'content'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Content
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl p-5">
            <p className="text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-5 py-2 bg-red-700/50 hover:bg-red-700/70 text-red-200 rounded-lg transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-blue-800/30 rounded-xl p-4 hover:border-blue-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(stats?.subscribersCount || 0)}</div>
                    <div className="text-blue-400 text-xs font-medium">Subscribers</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-green-800/30 rounded-xl p-4 hover:border-green-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(stats?.totalViews || 0)}</div>
                    <div className="text-green-400 text-xs font-medium">Total Views</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-pink-800/30 rounded-xl p-4 hover:border-pink-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-600/20">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(stats?.totalLikes || 0)}</div>
                    <div className="text-pink-400 text-xs font-medium">Total Likes</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-purple-800/30 rounded-xl p-4 hover:border-purple-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats?.videosCount || 0}</div>
                    <div className="text-purple-400 text-xs font-medium">Videos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Videos */}
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-6">Recent Videos</h2>
              {recentVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentVideos.map((video, index) => (
                    <div key={video._id} style={{animationDelay: `${index * 100}ms`}} className="animate-fade-in scale-90">
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
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                  </div>
                  <p className="text-gray-400 text-lg mb-6">No videos uploaded yet</p>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-lg transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
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
          <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text mb-3">Detailed Analytics</h3>
              <p className="text-gray-400 text-lg mb-8">Get comprehensive insights about your channel performance</p>
              <Link
                to="/profile/analytics"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-lg transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
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
          <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Content Management</h2>
              <Link
                to="/profile/videos"
                className="px-5 py-2.5 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-lg transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
              >
                View All Videos
              </Link>
            </div>
            
            {recentVideos.length > 0 ? (
              <div className="space-y-4">
                {recentVideos.slice(0, 5).map((video, index) => (
                  <div
                    key={video._id}
                    style={{animationDelay: `${index * 50}ms`}}
                    className="flex items-center gap-5 p-5 bg-gray-900/40 rounded-xl hover:bg-gray-900/60 transition-all duration-300 border border-gray-800/30 hover:border-gray-700/50 animate-fade-in"
                  >
                    <img
                      src={video.thumbnail || '/api/placeholder/120/68'}
                      alt={video.title}
                      className="w-28 h-16 object-cover bg-gray-800 rounded-lg shadow-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate text-lg">{video.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                        <span className="font-medium">{formatNumber(video.views || 0)} views</span>
                        <span>•</span>
                        <span>{formatDate(video.createdAt)}</span>
                        <span className={`px-3 py-1 rounded-lg font-semibold ${
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
                      className="px-5 py-2.5 bg-gray-800/60 hover:bg-gray-800 text-white rounded-lg transition-all duration-300 font-semibold border border-gray-700/50 hover:border-gray-600/70"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <p className="text-gray-400 text-lg mb-6">No content available</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-lg transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
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

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}