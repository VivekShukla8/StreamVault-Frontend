import React, { useState, useEffect } from "react";
import Loader from "../components/Loader";

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
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Channel Analytics</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-blue-800/30 rounded-xl p-4 hover:border-blue-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/20 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Total Views</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatViews(stats?.totalViews || 0)}
          </div>
          <div className="text-blue-400 text-xs">
            Across all {stats?.videosCount || 0} videos
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-green-800/30 rounded-xl p-4 hover:border-green-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-600/20 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20 group-hover:shadow-green-600/40 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Subscribers</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatViews(stats?.subscribersCount || 0)}
          </div>
          <div className="text-green-400 text-xs">
            People following your channel
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-pink-800/30 rounded-xl p-4 hover:border-pink-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-600/20 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-600/20 group-hover:shadow-pink-600/40 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Total Likes</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatViews(stats?.totalLikes || 0)}
          </div>
          <div className="text-pink-400 text-xs">
            Likes across all content
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-purple-800/30 rounded-xl p-4 hover:border-purple-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/20 group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:shadow-purple-600/40 transition-all duration-300">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Content</h3>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {(stats?.videosCount || 0) + (stats?.tweetsCount || 0)}
          </div>
          <div className="text-purple-400 text-xs">
            {stats?.videosCount || 0} videos, {stats?.tweetsCount || 0} tweets
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/50 transition-all duration-300">
          <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-6">Performance Metrics</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300 group">
              <div>
                <div className="text-white font-medium text-sm">Average Views per Video</div>
                <div className="text-gray-400 text-xs">Per video performance</div>
              </div>
              <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                {formatViews(avgViewsPerVideo)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-purple-700/50 hover:shadow-lg hover:shadow-purple-600/10 transition-all duration-300 group">
              <div>
                <div className="text-white font-medium text-sm">Average Likes per Video</div>
                <div className="text-gray-400 text-xs">Engagement rate</div>
              </div>
              <div className="text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                {engagementRate}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-green-700/50 hover:shadow-lg hover:shadow-green-600/10 transition-all duration-300 group">
              <div>
                <div className="text-white font-medium text-sm">Subscriber to Video Ratio</div>
                <div className="text-gray-400 text-xs">Content frequency</div>
              </div>
              <div className="text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">
                {stats?.videosCount > 0 ? Math.round((stats.subscribersCount || 0) / stats.videosCount) : 0}:1
              </div>
            </div>
          </div>
        </div>

        {/* Channel Information */}
        <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/50 transition-all duration-300">
          <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-6">Channel Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-700/50 hover:ring-blue-500/50 transition-all duration-300">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-full h-full object-contain bg-gray-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-white font-semibold truncate">
                  {user?.fullname || 'Unknown User'}
                </div>
                <div className="text-gray-400 text-sm">
                  @{user?.username}
                </div>
                <div className="text-gray-500 text-xs">
                  Joined {formatDate(user?.createdAt)}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-green-700/50 hover:shadow-lg hover:shadow-green-600/10 transition-all duration-300">
              <div className="text-white font-medium mb-2 text-sm">Account Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-green-400 text-sm font-medium">Active</span>
              </div>
            </div>

            <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-indigo-700/50 hover:shadow-lg hover:shadow-indigo-600/10 transition-all duration-300">
              <div className="text-white font-medium mb-2 text-sm">Channel Growth</div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <span className="text-gray-400 text-sm">
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
        <div className="mt-8 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-blue-800/30 rounded-xl p-6 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Growth Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-blue-600/20">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-medium text-sm">Upload Consistently</div>
                <div className="text-gray-400 text-xs">Regular uploads help build audience</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-900/40 rounded-lg border border-gray-800/30 hover:border-purple-700/50 hover:shadow-lg hover:shadow-purple-600/10 transition-all duration-300">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-purple-600/20">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-medium text-sm">Engage on Social</div>
                <div className="text-gray-400 text-xs">Share thoughts and connect with audience</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}