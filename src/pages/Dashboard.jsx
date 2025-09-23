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
      
      // Fetch user stats
      const statsResponse = await getMyChannelStats();
      setStats(statsResponse.data?.data);
      
      // Fetch recent videos
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
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-slate-900/80 via-gray-900/80 to-zinc-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">📊</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign in to access dashboard</h2>
          <p className="text-slate-400 mb-6">Manage your channel and track your content performance</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Channel Dashboard</h1>
                <p className="text-slate-400">Welcome back, {user.fullname}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link
                to="/upload"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-2xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              >
                <span>📤</span>
                Upload Video
              </Link>
              <Link
                to={`/profile/videos`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white font-medium rounded-2xl hover:from-slate-800 hover:to-slate-900 transition-all duration-300 shadow-lg"
              >
                <span>👤</span>
                View Channel
              </Link>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 bg-gradient-to-r from-slate-900/50 via-gray-900/50 to-zinc-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'content'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Content
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-2xl">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 px-4 py-2 bg-red-700/50 text-red-200 rounded-xl hover:bg-red-700/70 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-900/40 via-blue-800/40 to-blue-900/40 backdrop-blur-xl border border-blue-700/30 rounded-2xl p-6 hover:border-blue-600/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(stats?.subscribersCount || 0)}</div>
                    <div className="text-blue-300 text-sm">Subscribers</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/40 via-green-800/40 to-green-900/40 backdrop-blur-xl border border-green-700/30 rounded-2xl p-6 hover:border-green-600/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(stats?.totalViews || 0)}</div>
                    <div className="text-green-300 text-sm">Total Views</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-900/40 via-red-800/40 to-red-900/40 backdrop-blur-xl border border-red-700/30 rounded-2xl p-6 hover:border-red-600/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">❤️</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{formatNumber(stats?.totalLikes || 0)}</div>
                    <div className="text-red-300 text-sm">Total Likes</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-purple-900/40 backdrop-blur-xl border border-purple-700/30 rounded-2xl p-6 hover:border-purple-600/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats?.videosCount || 0}</div>
                    <div className="text-purple-300 text-sm">Videos</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Videos */}
            <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Recent Videos</h2>
              {recentVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentVideos.map((video) => (
                    <VideoCard
                      key={video._id}
                      video={video}
                      channelData={{
                        _id: user._id,
                        username: user.username,
                        avatar: user.avatar
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <p className="text-slate-400 mb-4">No videos uploaded yet</p>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/50 text-blue-200 rounded-xl hover:bg-blue-600/70 transition-colors"
                  >
                    <span>📤</span>
                    Upload Your First Video
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Detailed Analytics</h3>
              <p className="text-slate-400 mb-6">Get insights about your channel performance</p>
              <Link
                to="/profile/analytics"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/50 text-blue-200 rounded-xl hover:bg-blue-600/70 transition-colors"
              >
                <span>📈</span>
                View Full Analytics
              </Link>
            </div>
          </div>
        )}
        
        {activeTab === 'content' && (
          <div className="bg-gradient-to-br from-slate-900/40 via-gray-900/40 to-zinc-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Content Management</h2>
              <Link
                to="/profile/videos"
                className="px-4 py-2 bg-blue-600/50 text-blue-200 rounded-xl hover:bg-blue-600/70 transition-colors"
              >
                View All Videos
              </Link>
            </div>
            
            {recentVideos.length > 0 ? (
              <div className="space-y-4">
                {recentVideos.slice(0, 5).map((video) => (
                  <div
                    key={video._id}
                    className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                  >
                    <img
                      src={video.thumbnail || '/api/placeholder/120/68'}
                      alt={video.title}
                      className="w-20 h-12 object-contain bg-gray-800 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{video.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{formatNumber(video.views || 0)} views</span>
                        <span>{formatDate(video.createdAt)}</span>
                        <span className={`px-2 py-1 rounded-lg ${
                          video.isPublished 
                            ? 'bg-green-900/50 text-green-300' 
                            : 'bg-yellow-900/50 text-yellow-300'
                        }`}>
                          {video.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/video/${video._id}`}
                      className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700/70 transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-slate-400 mb-4">No content available</p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/50 text-blue-200 rounded-xl hover:bg-blue-600/70 transition-colors"
                >
                  <span>📤</span>
                  Create Content
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
