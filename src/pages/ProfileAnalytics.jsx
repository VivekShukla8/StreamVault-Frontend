import React, { useState } from "react";

// Mock Loader component
const Loader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
  </div>
);

export default function ProfileAnalytics({ user, stats }) {
  const [loading, setLoading] = useState(false);

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views?.toString() || '0';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate engagement rate (likes per video)
  const engagementRate = stats?.videosCount > 0 ? (stats.totalLikes / stats.videosCount).toFixed(1) : 0;

  // Calculate average views per video
  const avgViewsPerVideo = stats?.videosCount > 0 ? Math.round(stats.totalViews / stats.videosCount) : 0;

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 right-10 sm:right-20 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-fuchsia-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-slate-100 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
              Channel Analytics
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-400">Track your content performance</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 backdrop-blur-xl border border-blue-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/20 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:shadow-blue-600/50 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">Total Views</h3>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {formatViews(stats?.totalViews || 0)}
            </div>
            <div className="text-blue-400 text-xs sm:text-sm">
              Across all {stats?.videosCount || 0} videos
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 backdrop-blur-xl border border-emerald-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-emerald-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/30 group-hover:shadow-emerald-600/50 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">Subscribers</h3>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {formatViews(stats?.subscribersCount || 0)}
            </div>
            <div className="text-emerald-400 text-xs sm:text-sm">
              People following your channel
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 backdrop-blur-xl border border-rose-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-rose-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-rose-600/20 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:shadow-rose-600/50 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">Total Likes</h3>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {formatViews(stats?.totalLikes || 0)}
            </div>
            <div className="text-rose-400 text-xs sm:text-sm">
              Likes across all content
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 backdrop-blur-xl border border-violet-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-violet-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-600/20 group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/30 group-hover:shadow-violet-600/50 transition-all duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">Content</h3>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {(stats?.videosCount || 0) + (stats?.tweetsCount || 0)}
            </div>
            <div className="text-violet-400 text-xs sm:text-sm">
              {stats?.videosCount || 0} videos, {stats?.tweetsCount || 0} tweets
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {/* Performance Metrics */}
          <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 hover:border-slate-600/50 transition-all duration-300">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent mb-4 sm:mb-5 md:mb-6">
              Performance Metrics
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-5 bg-slate-800/40 rounded-lg sm:rounded-xl border border-slate-700/30 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300 group gap-2 sm:gap-0">
                <div>
                  <div className="text-white font-medium text-xs sm:text-sm md:text-base">Average Views per Video</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Per video performance</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                  {formatViews(avgViewsPerVideo)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-5 bg-slate-800/40 rounded-lg sm:rounded-xl border border-slate-700/30 hover:border-violet-600/50 hover:shadow-lg hover:shadow-violet-600/10 transition-all duration-300 group gap-2 sm:gap-0">
                <div>
                  <div className="text-white font-medium text-xs sm:text-sm md:text-base">Average Likes per Video</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Engagement rate</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-violet-400 group-hover:text-violet-300 transition-colors duration-300">
                  {engagementRate}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 md:p-5 bg-slate-800/40 rounded-lg sm:rounded-xl border border-slate-700/30 hover:border-emerald-600/50 hover:shadow-lg hover:shadow-emerald-600/10 transition-all duration-300 group gap-2 sm:gap-0">
                <div>
                  <div className="text-white font-medium text-xs sm:text-sm md:text-base">Subscriber to Video Ratio</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Content frequency</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300">
                  {stats?.videosCount > 0 ? Math.round((stats.subscribersCount || 0) / stats.videosCount) : 0}:1
                </div>
              </div>
            </div>
          </div>

          {/* Channel Information */}
          <div className="bg-gradient-to-br from-slate-900/80 to-gray-900/60 backdrop-blur-xl border border-slate-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 hover:border-slate-600/50 transition-all duration-300">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-100 to-violet-300 bg-clip-text text-transparent mb-4 sm:mb-5 md:mb-6">
              Channel Information
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 bg-slate-800/40 rounded-lg sm:rounded-xl border border-slate-700/30 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-700/50 hover:ring-blue-500/50 transition-all duration-300">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover bg-slate-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                      <span className="text-white font-bold text-base sm:text-lg md:text-xl">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate text-sm sm:text-base md:text-lg">
                    {user?.fullname || 'Unknown User'}
                  </div>
                  <div className="text-slate-400 text-xs sm:text-sm">
                    @{user?.username}
                  </div>
                  <div className="text-slate-500 text-[10px] sm:text-xs">
                    Joined {formatDate(user?.createdAt)}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-5 bg-slate-800/40 rounded-lg sm:rounded-xl border border-slate-700/30              hover:border-emerald-600/50 hover:shadow-lg hover:shadow-emerald-600/10 transition-all duration-300">
                <div className="text-white font-medium mb-2 text-xs sm:text-sm md:text-base">Account Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
                  <span className="text-emerald-400 text-xs sm:text-sm font-medium">Active</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-5 bg-slate-800/40 rounded-lg sm:rounded-xl border border-slate-700/30 hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-300">
                <div className="text-white font-medium mb-2 text-xs sm:text-sm md:text-base">Channel Growth</div>
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                  <span className="text-slate-400 text-xs sm:text-sm">
                    {stats?.subscribersCount > 100 ? 'Growing' : 
                     stats?.subscribersCount > 10 ? 'Emerging' : 
                     'Getting Started'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Tips */}
        {(stats?.subscribersCount || 0) < 1000 && (
          <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 bg-gradient-to-br from-slate-900/80 to-gray-900/60 backdrop-blur-xl border border-indigo-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4 sm:mb-5 md:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-100 to-indigo-300 bg-clip-text text-transparent">
                Growth Tips
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-3 p-3 sm:p-4 md:p-5 bg-slate-800/40 rounded-lg sm:rounded-xl border border-slate-700/30 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-blue-600/30">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-xs sm:text-sm md:text-base">Upload Consistently</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Regular uploads help build audience</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 sm:p-4 md:p-5 bg-slate-800/40 rounded-lg sm:rounded-xl border border-slate-700/30 hover:border-violet-600/50 hover:shadow-lg hover:shadow-violet-600/10 transition-all duration-300">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-violet-600/30">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-xs sm:text-sm md:text-base">Engage on Social</div>
                  <div className="text-slate-400 text-[10px] sm:text-xs">Share thoughts and connect with audience</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
