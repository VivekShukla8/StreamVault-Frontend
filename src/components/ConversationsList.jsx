import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../api/messages';
import { AuthContext } from '../features/auth/AuthContext';

export default function ConversationsList({ onSelect }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const {user} = useContext(AuthContext);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConversations();
      
      const conversationsData = response.data?.data || response.data || response || [];
      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
      
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Failed to load conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation) => {
    if (onSelect) {
      onSelect(conversation._id);
    }
    navigate(`/messages/conversations/${conversation._id}`);
  };

  const formatLastMessageTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherParticipant = (participants) => {
    return participants?.find(p => String(p._id) !== String(user?._id)) || {};
  };

  if (loading) {
    return (
      <div className="w-80 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
        <div className="p-4 border-b border-gray-800/50">
          <h2 className="text-lg font-semibold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Conversations</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 border-b border-gray-800/30 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-800/50 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800/50 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800/50 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-3 bg-gray-800/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
        <div className="p-4 border-b border-gray-800/50">
          <h2 className="text-lg font-semibold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Conversations</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/10">
              <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-400 text-sm font-semibold mb-1">Failed to load</p>
            <p className="text-gray-400 text-xs mb-3">{error}</p>
            <button
              onClick={loadConversations}
              className="px-4 py-2 bg-gradient-to-r from-red-600/50 to-pink-600/50 hover:from-red-600/70 hover:to-pink-600/70 text-red-200 text-xs font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-600/20"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Conversations</h2>
          <button
            onClick={loadConversations}
            className="p-2 text-gray-400 hover:text-white bg-gray-900/40 hover:bg-gray-900/60 rounded-lg transition-all duration-300 border border-gray-800/50 hover:border-blue-700/50 hover:shadow-lg hover:shadow-blue-600/10 group"
            title="Refresh conversations"
          >
            <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm font-medium mb-1">No conversations yet</p>
              <p className="text-gray-500 text-xs">Start a conversation to see it here</p>
            </div>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation.participants);
            
            return (
              <div
                key={conversation._id}
                onClick={() => handleConversationClick(conversation)}
                className="p-4 border-b border-gray-800/30 hover:bg-gray-900/40 cursor-pointer transition-all duration-300 group hover:border-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700/50 group-hover:ring-blue-600/50 transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:shadow-blue-600/10"
                      src={
                        otherParticipant.avatar || 
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(otherParticipant.username || otherParticipant.fullname || 'User')}&background=random`
                      }
                      alt={otherParticipant.username || 'User'}
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full shadow-lg shadow-green-400/50 animate-pulse"></div>
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-white truncate group-hover:text-blue-300 transition-colors duration-300">
                        {otherParticipant.fullname || otherParticipant.username || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatLastMessageTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors duration-300">
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      
                      {conversation.unreadCount > 0 && (
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0 font-semibold shadow-md shadow-blue-600/30 animate-pulse">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}