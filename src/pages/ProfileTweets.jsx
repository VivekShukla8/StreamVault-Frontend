import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserTweets, createTweet, deleteTweet, toggleTweetLike } from "../api/tweet";
import Loader from "../components/Loader";
import ConfirmModal from "../ConfirmModal";
import Toast from "../components/Toast";

export default function ProfileTweets({ user }) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTweet, setNewTweet] = useState("");
  const [posting, setPosting] = useState(false);
  const [likingTweets, setLikingTweets] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tweetToDelete, setTweetToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');


  useEffect(() => {
    if (user?._id) {
      fetchUserTweets();
    }
  }, [user]);

  const fetchUserTweets = async () => {
    try {
      setLoading(true);
      const response = await getUserTweets(user._id, { limit: 50 });
      
      // Handle different response structures
      const tweetsData = response.data?.data;
      const tweets = tweetsData?.tweets || tweetsData?.docs || [];
      
      setTweets(tweets);
    } catch (err) {
      console.error('Error fetching user tweets:', err);
      setError('Failed to load tweets');
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostTweet = async () => {
    if (!newTweet.trim() || posting) return;

    try {
      setPosting(true);
      await createTweet({ content: newTweet.trim() });
      setNewTweet("");
      fetchUserTweets(); // Refresh tweets
    } catch (err) {
      console.error('Error posting tweet:', err);
      alert('Failed to post tweet');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteTweet = (tweetId) => {
    setTweetToDelete(tweetId);
    setShowDeleteModal(true);
  };

  // Add cancel handler
  const confirmDelete = async () => {
    if (!tweetToDelete) return;

    try {
      await deleteTweet(tweetToDelete);
      setTweets(prev => prev.filter(tweet => tweet._id !== tweetToDelete));
      setToastMessage('Tweet deleted successfully!');
      setToastType('success');
    } catch (err) {
      console.error('Error deleting tweet:', err);
      setToastMessage('Failed to delete tweet');
      setToastType('error');
    } finally {
      setTweetToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setTweetToDelete(null);
    setShowDeleteModal(false);
  };


  const formatTimeAgo = (date) => {
    const now = new Date();
    const tweetDate = new Date(date);
    const diffInSeconds = Math.floor((now - tweetDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  };

   const handleToggleLike = async (tweetId) => {
    if (likingTweets.has(tweetId)) return;
    
    try {
      setLikingTweets(prev => new Set(prev).add(tweetId));
      const response = await toggleTweetLike(tweetId);
      
      const { isLiked, likeCount } = response.data?.data || {};
      
      setTweets(prev => prev.map(tweet => {
        if (tweet._id === tweetId) {
          return {
            ...tweet,
            isLiked: isLiked,
            likesCount: likeCount !== undefined ? likeCount : tweet.likesCount
          };
        }
        return tweet;
      }));
      
    } catch (err) {
      console.error("Error toggling like:", err);
      setError("Failed to update like");
    } finally {
      setLikingTweets(prev => {
        const newSet = new Set(prev);
        newSet.delete(tweetId);
        return newSet;
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">My Tweets ({tweets.length})</h2>
      </div>

      {/* Create Tweet */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-full h-full object-contain bg-gray-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <textarea
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
              placeholder="What's happening?"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:border-blue-500 focus:outline-none"
              rows="3"
              maxLength="280"
            />
            
            <div className="flex items-center justify-between mt-3">
              <span className={`text-sm ${newTweet.length > 250 ? 'text-red-400' : 'text-gray-400'}`}>
                {newTweet.length}/280
              </span>
              
              <button
                onClick={handlePostTweet}
                disabled={!newTweet.trim() || posting || newTweet.length > 280}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {posting ? 'Posting...' : 'Tweet'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tweets List */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <button 
            onClick={fetchUserTweets}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {tweets.length > 0 ? (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div key={tweet._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  {tweet.owner?.avatar ? (
                    <img
                      src={tweet.owner.avatar}
                      alt={tweet.owner.username}
                      className="w-full h-full object-contain bg-gray-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {tweet.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">
                      {tweet.owner?.fullname || 'Unknown User'}
                    </h3>
                    <span className="text-gray-400 text-sm">
                      @{tweet.owner?.username || 'unknown'}
                    </span>
                    <span className="text-gray-500 text-sm">·</span>
                    <span className="text-gray-500 text-sm">
                      {formatTimeAgo(tweet.createdAt)}
                    </span>
                  </div>

                  <p className="text-white text-base leading-relaxed mb-4 whitespace-pre-wrap">
                    {tweet.content}
                  </p>

                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleToggleLike(tweet._id)}
                      className={`flex items-center gap-2 text-sm transition-colors ${
                        tweet.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={tweet.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{tweet.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTweet(tweet._id)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete tweet"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No tweets yet</h3>
          <p className="text-gray-400 mb-6">Share your thoughts with your audience!</p>
        </div>
      )}

      <ConfirmModal
        show={showDeleteModal}
        title="Delete Tweet"
        message="Are you sure you want to delete this tweet?"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {toastMessage && (
      <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
