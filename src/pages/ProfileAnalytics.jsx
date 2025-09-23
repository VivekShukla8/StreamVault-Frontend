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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Channel Analytics</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border border-blue-700/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Views</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatViews(stats?.totalViews || 0)}
          </div>
          <div className="text-blue-200 text-sm">
            Across all {stats?.videosCount || 0} videos
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border border-green-700/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Subscribers</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatViews(stats?.subscribersCount || 0)}
          </div>
          <div className="text-green-200 text-sm">
            People following your channel
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border border-purple-700/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Likes</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {formatViews(stats?.totalLikes || 0)}
          </div>
          <div className="text-purple-200 text-sm">
            Likes across all content
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-xl p-6 border border-orange-700/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Content</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {(stats?.videosCount || 0) + (stats?.tweetsCount || 0)}
          </div>
          <div className="text-orange-200 text-sm">
            {stats?.videosCount || 0} videos, {stats?.tweetsCount || 0} tweets
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Metrics */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Performance Metrics</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <div className="text-white font-medium">Average Views per Video</div>
                <div className="text-gray-400 text-sm">Per video performance</div>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {formatViews(avgViewsPerVideo)}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <div className="text-white font-medium">Average Likes per Video</div>
                <div className="text-gray-400 text-sm">Engagement rate</div>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {engagementRate}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div>
                <div className="text-white font-medium">Subscriber to Video Ratio</div>
                <div className="text-gray-400 text-sm">Content frequency</div>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {stats?.videosCount > 0 ? Math.round((stats.subscribersCount || 0) / stats.videosCount) : 0}:1
              </div>
            </div>
          </div>
        </div>

        {/* Channel Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Channel Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
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

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-white font-medium mb-2">Account Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 text-sm">Active</span>
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-white font-medium mb-2">Channel Growth</div>
              <div className="text-gray-400 text-sm">
                {stats?.subscribersCount > 100 ? 'Growing' : 
                 stats?.subscribersCount > 10 ? 'Emerging' : 
                 'Getting Started'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Tips */}
      {(stats?.subscribersCount || 0) < 1000 && (
        <div className="mt-8 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Growth Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">Upload Consistently</div>
                <div className="text-gray-400 text-sm">Regular uploads help build audience</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
                </svg>
              </div>
              <div>
                <div className="text-white font-medium">Engage on Social</div>
                <div className="text-gray-400 text-sm">Share thoughts and connect with audience</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}