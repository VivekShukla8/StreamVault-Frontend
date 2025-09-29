import React, { useEffect, useState } from 'react';
import { getMessageRequests, respondMessageRequest } from '../api/messages';
import Toast from './Toast';

export default function MessageRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await getMessageRequests();
      setRequests(res.data.data || []);
    } catch (err) {
      console.error('Error loading requests:', err);
      setToastMessage('Failed to load message requests');
      setToastType('error');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id, action) => {
    try {
      setProcessingId(id);
      await respondMessageRequest(id, action);

      // Show success message
      setToastMessage(
        action === 'accept'
          ? 'Request accepted! You can now chat with this user.'
          : 'Request declined.'
      );
      setToastType('success');

      // Reload requests to update the UI
      await loadRequests();

    } catch (err) {
      console.error('Error responding to request:', err);
      setToastMessage(
        err?.response?.data?.message || 'Failed to respond to request'
      );
      setToastType('error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    const now = new Date();
    const requestDate = new Date(date);
    if (isNaN(requestDate.getTime())) return 'Unknown time';
    
    const diffInSeconds = Math.floor((now - requestDate) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <svg className="w-6 h-6 text-blue-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Message Requests</h2>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-900/60 rounded-xl p-6 border border-slate-800/50 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-4 py-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <svg className="w-6 h-6 text-blue-400 " fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Message Requests</h2>
          <p className="text-gray-400 text-sm">
            {requests.length === 0 ? 'No pending requests' : `${requests.length} pending request${requests.length > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No message requests</h3>
          <p className="text-gray-400">When someone sends you a message request, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div 
              key={request._id}
              className="bg-slate-900/80 backdrop-blur-xl rounded-xl p-6 border border-slate-800/30 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] hover:border-slate-700/40 transition-all duration-500 group"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {request.sender?.avatar ? (
                      <img
                        src={request.sender.avatar}
                        alt={request.sender.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {request.sender?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white hover:text-blue-400 transition-colors duration-200 cursor-pointer">
                      {request.sender?.fullname || request.sender?.username || 'Unknown User'}
                    </h4>
                    <span className="text-gray-400">@{request.sender?.username}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {formatTimeAgo(request.createdAt)}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <p className="text-gray-300 leading-relaxed bg-slate-800/30 rounded-lg p-3 border border-slate-700/30">
                      "{request.content}"
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleResponse(request._id, 'accept')}
                      disabled={processingId === request._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 group"
                    >
                      {processingId === request._id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                        </svg>
                      )}
                      Accept
                    </button>

                    <button
                      onClick={() => handleResponse(request._id, 'decline')}
                      disabled={processingId === request._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 group"
                    >
                      {processingId === request._id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      )}
                      Decline
                    </button>

                    {/* View Profile Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-700/60 hover:bg-slate-600/60 text-slate-300 hover:text-white rounded-lg transition-all duration-300 font-medium text-sm border border-slate-600/30 hover:border-slate-500/50 hover:scale-105">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}