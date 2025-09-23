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
        setSubscribers([]); // No subscribers found
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
        <h2 className="text-2xl font-bold text-white">My Subscribers ({subscribers.length})</h2>
      </div>

      {error && (
        <div className="text-center py-8">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchSubscribers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {subscribers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscribers.map((subscriber) => (
            <div key={subscriber.subscriberId} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-4">
                {/* Subscriber Avatar */}
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-semibold text-white">
                    {subscriber.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
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
              <div className="mt-4 pt-4 border-t border-gray-800">
                <Link
                  to={`/channel/${subscriber.subscriberId}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Visit Channel
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No subscribers yet</h3>
          <p className="text-gray-400 mb-6">
            Start creating amazing content to attract subscribers!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Upload Video
            </Link>
            <Link 
              to="/tweets"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </svg>
              Share Thoughts
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}