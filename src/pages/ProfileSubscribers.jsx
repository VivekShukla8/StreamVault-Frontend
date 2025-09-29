import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { subscriptionAPI } from "../api/subscription";
import Loader from "../components/Loader";

export default function ProfileSubscribers({ user }) {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?._id) {
      fetchSubscribers();
    }
  }, [user]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await subscriptionAPI.getChannelSubscribers(user._id);
      setSubscribers(response.data?.data || []);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      if (err.response?.status === 404) {
        setSubscribers([]);
      } else {
        setError('Failed to load subscribers');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">
          My Subscribers ({subscribers.length})
        </h2>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/10">
            <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-red-400 text-lg font-semibold mb-4">{error}</div>
          <button 
            onClick={fetchSubscribers}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600/50 to-pink-600/50 hover:from-red-600/70 hover:to-pink-600/70 text-red-200 rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:shadow-red-600/20"
          >
            Try Again
          </button>
        </div>
      )}

      {subscribers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscribers.map((subscriber) => (
            <div 
              key={subscriber.subscriberId} 
              className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10 group"
            >
              <div className="flex items-center gap-4">
                {/* Subscriber Avatar */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ring-2 ring-gray-700/50 group-hover:ring-blue-600/50 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:shadow-blue-600/10">
                  {subscriber.avatar ? (
                    <img
                      src={subscriber.avatar}
                      alt={subscriber.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {subscriber.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      to={`/channel/${subscriber.subscriberId}`}
                      className="font-semibold text-white hover:text-blue-400 transition-colors truncate"
                    >
                      {subscriber.fullname || 'Unknown User'}
                    </Link>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2">
                    @{subscriber.username}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    Subscribed on {formatDate(subscriber.subscribedAt)}
                  </div>
                </div>
              </div>
              
              {/* Visit Channel Button */}
              <div className="mt-4 pt-4 border-t border-gray-800/50">
                <Link
                  to={`/channel/${subscriber.subscriberId}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-900/40 text-gray-300 rounded-lg hover:bg-gray-900/60 hover:text-white transition-all duration-300 text-sm font-medium border border-gray-800/50 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-600/10"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Visit Channel
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text mb-2">
            No subscribers yet
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Start creating amazing content to attract subscribers!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/upload"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              Upload Video
            </Link>
            <Link 
              to="/tweets"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-lg transition-all duration-300 font-semibold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
              Share Thoughts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}