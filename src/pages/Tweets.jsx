import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getAllTweets, createTweet, deleteTweet, toggleTweetLike, getUserTweets } from "../api/tweet";
import { subscriptionAPI } from "../api/subscription";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";

export default function Tweets() {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState('channels'); // 'channels' or 'all' or 'channel-tweets'
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [channelTweets, setChannelTweets] = useState({}); // Store tweets grouped by channel
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTweet, setNewTweet] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likingTweets, setLikingTweets] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchChannelsWithTweets();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (view === 'all') {
      fetchAllTweets();
    }
  }, [view]);

  const fetchChannelsWithTweets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get subscribed channels
      const channelsResponse = await subscriptionAPI.getSubscribedChannels(user._id);
      const subscribedChannels = channelsResponse.data?.data || [];
      
      if (subscribedChannels.length === 0) {
        setChannels([]);
        setLoading(false);
        return;
      }

      // Fetch tweets for each channel and count them
      const channelsWithTweets = [];
      const allChannelTweets = {};

      for (const channel of subscribedChannels) {
        try {
          const tweetsResponse = await getUserTweets(channel.channelId, { limit: 50 });
          const tweetsData = tweetsResponse.data?.data;
          const tweets = tweetsData?.tweets || tweetsData?.docs || [];
          
          if (tweets.length > 0) {
            channelsWithTweets.push({
              ...channel,
              tweetCount: tweets.length,
              latestTweet: tweets[0]
            });
            allChannelTweets[channel.channelId] = tweets;
          }
        } catch (err) {
          console.error(`Error fetching tweets for channel ${channel.channelId}:`, err);
        }
      }

      setChannels(channelsWithTweets);
      setChannelTweets(allChannelTweets);

    } catch (err) {
      console.error("Error fetching channels with tweets:", err);
      setError("Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTweets = async (pageNum = 1, reset = true) => {
    try {
      if (reset) setLoading(true);
      setError(null);

      const response = await getAllTweets({
        page: pageNum,
        limit: 10,
        sortBy: "createdAt",
        sortType: "desc"
      });

      const data = response.data?.data || response.data;
      const newTweets = data?.tweets || [];

      if (reset) {
        setTweets(newTweets);
      } else {
        setTweets(prev => [...prev, ...newTweets]);
      }

      setHasMore(pageNum < (data?.totalPages || 1));
      setPage(pageNum);

    } catch (err) {
      console.error("Error fetching tweets:", err);
      setError("Failed to fetch tweets");
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelTweets = async (channel) => {
    try {
      setLoading(true);
      setSelectedChannel(channel);
      
      // Use cached tweets if available
      if (channelTweets[channel.channelId]) {
        setTweets(channelTweets[channel.channelId]);
        setView('channel-tweets');
        setLoading(false);
        return;
      }

      const response = await getUserTweets(channel.channelId, { limit: 50 });
      const tweetsData = response.data?.data;
      const tweets = tweetsData?.tweets || tweetsData?.docs || [];
      
      setTweets(tweets);
      setView('channel-tweets');
      
      // Cache the tweets
      setChannelTweets(prev => ({
        ...prev,
        [channel.channelId]: tweets
      }));

    } catch (err) {
      console.error("Error fetching channel tweets:", err);
      setError("Failed to fetch channel tweets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim() || isPosting) return;

    try {
      setIsPosting(true);
      const response = await createTweet({ content: newTweet.trim() });
      
      const createdTweet = response.data?.data || response.data;
      setTweets(prev => [createdTweet, ...prev]);
      setNewTweet("");
      
    } catch (err) {
      console.error("Error creating tweet:", err);
      setError("Failed to create tweet");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await deleteTweet(tweetId);
      setTweets(prev => prev.filter(tweet => tweet._id !== tweetId));
    } catch (err) {
      console.error("Error deleting tweet:", err);
      setError("Failed to delete tweet");
    }
  };

  const handleToggleLike = async (tweetId) => {
    // Prevent multiple simultaneous likes on the same tweet
    if (likingTweets.has(tweetId)) return;
    
    try {
      setLikingTweets(prev => new Set(prev).add(tweetId));
      const response = await toggleTweetLike(tweetId);
      
      // Use the backend response to ensure consistency
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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const tweetDate = new Date(date);
    const diffInSeconds = Math.floor((now - tweetDate) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) return <Loader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
          <p className="text-gray-400">You need to be logged in to view tweets from your subscribed channels.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-2xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {view === 'channels' ? 'Channel Tweets' : 
                 view === 'channel-tweets' ? `${selectedChannel?.username || 'Channel'} Tweets` : 
                 'All Tweets'}
              </h1>
              <p className="text-gray-400">
                {view === 'channels' ? 'View tweets from your subscribed channels' :
                 view === 'channel-tweets' ? `All tweets from ${selectedChannel?.username || 'this channel'}` :
                 'Share your thoughts with the community'}
              </p>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('channels')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'channels'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                By Channels
              </button>
              <button
                onClick={() => setView('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Tweets
              </button>
            </div>
          </div>
          
          {/* Back Button for Channel Tweets View */}
          {view === 'channel-tweets' && (
            <button
              onClick={() => setView('channels')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Channels
            </button>
          )}
        </div>

        {/* Create Tweet Form - Only show in All Tweets view */}
        {view === 'all' && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
            <form onSubmit={handleCreateTweet}>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <textarea
                    value={newTweet}
                    onChange={(e) => setNewTweet(e.target.value)}
                    placeholder="What's happening?"
                    className="w-full bg-transparent text-white text-xl placeholder-gray-400 resize-none border-none outline-none"
                    rows="3"
                    maxLength="280"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-400">
                      {newTweet.length}/280
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!newTweet.trim() || isPosting || newTweet.length > 280}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full font-semibold transition-colors"
                    >
                      {isPosting ? "Posting..." : "Tweet"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-600/20 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Channels List View */}
        {view === 'channels' && (
          <div>
            {channels.length > 0 ? (
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div
                    key={channel.channelId}
                    onClick={() => fetchChannelTweets(channel)}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 hover:border-gray-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Channel Avatar - Clickable to channel page */}
                        <Link 
                          to={`/channel/${channel.channelId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-500/50 transition-all duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                        >
                          {channel.avatar ? (
                            <img
                              src={channel.avatar}
                              alt={channel.username}
                              className="w-full h-full object-contain bg-gray-700"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {channel.username?.charAt(0)?.toUpperCase() || 'C'}
                              </span>
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/channel/${channel.channelId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-semibold text-white text-lg mb-1 hover:text-blue-400 transition-colors duration-200 block"
                          >
                            {channel.username || channel.fullname || 'Unknown Channel'}
                          </Link>
                          <p className="text-gray-400 text-sm mb-2">
                            {channel.tweetCount} {channel.tweetCount === 1 ? 'tweet' : 'tweets'}
                          </p>
                          {channel.latestTweet && (
                            <p className="text-gray-300 text-sm line-clamp-2">
                              Latest: "{channel.latestTweet.content.substring(0, 100)}{channel.latestTweet.content.length > 100 ? '...' : ''}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-blue-400 text-sm font-medium">
                            View tweets
                          </div>
                          <div className="text-gray-400 text-xs">
                            or click avatar/name for channel
                          </div>
                          {channel.latestTweet && (
                            <div className="text-gray-500 text-xs">
                              {formatTimeAgo(channel.latestTweet.createdAt)}
                            </div>
                          )}
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No channel tweets found</h3>
                <p className="text-gray-400">Your subscribed channels haven't posted any tweets yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tweets List View (for both All and Channel-specific tweets) */}
        {(view === 'all' || view === 'channel-tweets') && (
          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div key={tweet._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:bg-gray-800/50 transition-colors">
                <div className="flex gap-4">
                  {/* Avatar - Clickable */}
                  <Link 
                    to={`/channel/${tweet.owner?._id}`}
                    className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-500/50 transition-all duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                  >
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
                  </Link>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <Link 
                        to={`/channel/${tweet.owner?._id}`}
                        className="font-semibold text-white truncate hover:text-blue-400 transition-colors duration-200 active:shadow-[inset_0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                      >
                        {tweet.owner?.fullname || 'Unknown User'}
                      </Link>
                      <Link 
                        to={`/channel/${tweet.owner?._id}`}
                        className="text-gray-400 text-sm hover:text-blue-400 transition-colors duration-200"
                      >
                        @{tweet.owner?.username || 'unknown'}
                      </Link>
                      <span className="text-gray-500 text-sm">·</span>
                      <span className="text-gray-500 text-sm">
                        {formatTimeAgo(tweet.createdAt)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-white text-base leading-relaxed mb-4 whitespace-pre-wrap">
                      {tweet.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-6">
                      {/* Like Button */}
                      <button
                        onClick={() => handleToggleLike(tweet._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                          tweet.isLiked
                            ? 'text-red-500 hover:bg-red-500/10'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
                        }`}
                      >
                        <svg
                          className={`w-5 h-5 ${tweet.isLiked ? 'fill-current' : 'stroke-current fill-none'}`}
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="text-sm font-medium">{tweet.likesCount || 0}</span>
                      </button>

                      {/* Delete Button (only for own tweets in all view) */}
                      {view === 'all' && tweet.owner?._id === user?._id && (
                        <button
                          onClick={() => handleDeleteTweet(tweet._id)}
                          className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More for All Tweets view */}
        {view === 'all' && hasMore && tweets.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => fetchAllTweets(page + 1, false)}
              disabled={loading}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More Tweets"}
            </button>
          </div>
        )}

        {/* Empty State for All Tweets */}
        {view === 'all' && tweets.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tweets yet</h3>
            <p className="text-gray-400">Be the first to share something!</p>
          </div>
        )}

        {/* Empty State for Channel Tweets */}
        {view === 'channel-tweets' && tweets.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tweets from this channel</h3>
            <p className="text-gray-400">This channel hasn't posted any tweets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}