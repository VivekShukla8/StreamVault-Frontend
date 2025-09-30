import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getAllTweets, createTweet, deleteTweet, toggleTweetLike, getUserTweets } from "../api/tweet";
import { subscriptionAPI } from "../api/subscription";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";

export default function Tweets() {
  const { user } = useContext(AuthContext);
  const [view, setView] = useState('channels');
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [channelTweets, setChannelTweets] = useState({});
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

      const channelsResponse = await subscriptionAPI.getSubscribedChannels(user._id);
      const subscribedChannels = channelsResponse.data?.data || [];
      
      if (subscribedChannels.length === 0) {
        setChannels([]);
        setLoading(false);
        return;
      }

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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 flex items-center justify-center p-3 sm:p-4 md:p-8">
        <div className="text-center bg-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl sm:rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text mb-3 sm:mb-4">
            Please Login
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg">You need to be logged in to view tweets from your subscribed channels.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text mb-2">
                {view === 'channels' ? 'Channel Tweets' : 
                 view === 'channel-tweets' ? `${selectedChannel?.username || 'Channel'} Tweets` : 
                 'All Tweets'}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                {view === 'channels' ? 'View tweets from your subscribed channels' :
                 view === 'channel-tweets' ? `All tweets from ${selectedChannel?.username || 'this channel'}` :
                 'Share your thoughts with the community'}
              </p>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex gap-2 sm:gap-3 bg-gray-900/50 backdrop-blur-sm p-1 sm:p-1.5 rounded-lg sm:rounded-xl border border-gray-800/50 w-full sm:w-auto">
              <button
                onClick={() => setView('channels')}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 ${
                  view === 'channels'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                By Channels
              </button>
              <button
                onClick={() => setView('all')}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 ${
                  view === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                All Tweets
              </button>
            </div>
          </div>
          
          {/* Back Button */}
          {view === 'channel-tweets' && (
            <button
              onClick={() => setView('channels')}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-all duration-300 mb-4 group bg-gray-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-900/50 border border-gray-800/50 text-sm sm:text-base"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Channels
            </button>
          )}
        </div>

        {/* Create Tweet Form */}
        {view === 'all' && (
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 shadow-2xl hover:shadow-purple-500/10 transition-shadow duration-300">
            <form onSubmit={handleCreateTweet}>
              <div className="flex gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ring-2 ring-gray-800/50">
                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                
                <div className="flex-1">
                  <textarea
                    value={newTweet}
                    onChange={(e) => setNewTweet(e.target.value)}
                    placeholder="What's happening? ✨"
                    className="w-full bg-transparent text-white text-sm sm:text-base md:text-lg placeholder-gray-500 resize-none border-none outline-none"
                    rows="3"
                    maxLength="280"
                  />
                  
                  <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800/50">
                    <div className="text-xs sm:text-sm font-medium">
                      <span className={newTweet.length > 260 ? 'text-red-400' : 'text-gray-500'}>
                        {newTweet.length}
                      </span>
                      <span className="text-gray-600">/280</span>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!newTweet.trim() || isPosting || newTweet.length > 280}
                      className="px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-full font-bold text-xs sm:text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:shadow-none transform hover:scale-105 disabled:scale-100"
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
          <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-lg">
            <p className="text-red-400 font-medium text-sm sm:text-base">{error}</p>
          </div>
        )}

        {/* Channels List View */}
        {view === 'channels' && (
          <div>
            {channels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {channels.map((channel, index) => (
                  <div
                    key={channel.channelId}
                    onClick={() => fetchChannelTweets(channel)}
                    style={{animationDelay: `${index * 50}ms`}}
                    className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 md:gap-5">
                      {/* Channel Avatar */}
                      <Link 
                        to={`/channel/${channel.channelId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="relative group flex-shrink-0"
                      >
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden ring-2 ring-gray-800/50 group-hover:ring-purple-500/50 transition-all duration-300 shadow-xl">
                          {channel.avatar ? (
                            <img
                              src={channel.avatar}
                              alt={channel.username}
                              className="w-full h-full object-cover bg-gray-800"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">
                                {channel.username?.charAt(0)?.toUpperCase() || 'C'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/channel/${channel.channelId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-white text-base sm:text-lg md:text-xl mb-1 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all duration-300 block truncate"
                        >
                          {channel.username || channel.fullname || 'Unknown Channel'}
                        </Link>
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-blue-400 text-xs sm:text-sm font-semibold">
                            {channel.tweetCount} {channel.tweetCount === 1 ? 'tweet' : 'tweets'}
                          </span>
                        </div>
                        {channel.latestTweet && (
                          <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            <span className="text-gray-500 font-medium">Latest: </span>
                            "{channel.latestTweet.content.substring(0, 80)}{channel.latestTweet.content.length > 80 ? '...' : ''}"
                          </p>
                        )}
                        <div className="mt-2 sm:mt-3">
                          <div className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-xs sm:text-sm font-bold">
                            View tweets →
                          </div>
                          {channel.latestTweet && (
                            <div className="text-gray-500 text-[10px] sm:text-xs font-medium mt-1">
                              {formatTimeAgo(channel.latestTweet.createdAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text mb-2">No channel tweets found</h3>
                <p className="text-gray-500 text-sm sm:text-base">Your subscribed channels haven't posted any tweets yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Tweets List View */}
        {(view === 'all' || view === 'channel-tweets') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {tweets.map((tweet, index) => (
              <div 
                key={tweet._id} 
                style={{animationDelay: `${index * 50}ms`}}
                className="bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl border border-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 animate-fade-in"
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Avatar */}
                  <Link 
                    to={`/channel/${tweet.owner?._id}`}
                    className="relative group flex-shrink-0"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl overflow-hidden ring-2 ring-gray-800/50 group-hover:ring-purple-500/50 transition-all duration-300 shadow-lg">
                      {tweet.owner?.avatar ? (
                        <img
                          src={tweet.owner.avatar}
                          alt={tweet.owner.username}
                          className="w-full h-full object-cover bg-gray-800"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                            {tweet.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg sm:rounded-xl"></div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                      <Link 
                        to={`/channel/${tweet.owner?._id}`}
                        className="font-bold text-white text-sm sm:text-base md:text-lg hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all duration-300 truncate"
                      >
                        {tweet.owner?.fullname || 'Unknown User'}
                      </Link>
                      <Link 
                        to={`/channel/${tweet.owner?._id}`}
                        className="text-gray-500 text-xs sm:text-sm hover:text-purple-400 transition-colors duration-300 font-medium truncate"
                      >
                        @{tweet.owner?.username || 'unknown'}
                      </Link>
                      <span className="text-gray-700 text-xs">•</span>
                      <span className="text-gray-500 text-xs sm:text-sm font-medium">
                        {formatTimeAgo(tweet.createdAt)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-100 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4 whitespace-pre-wrap break-words">
                      {tweet.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      {/* Like Button */}
                      <button
                        onClick={() => handleToggleLike(tweet._id)}
                        className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
                          tweet.isLiked
                            ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 shadow-lg shadow-red-500/20'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 hover:text-red-400'
                        }`}
                      >
                        <svg
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${tweet.isLiked ? 'fill-current animate-pulse' : 'stroke-current fill-none'}`}
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span className="font-bold">{tweet.likesCount || 0}</span>
                      </button>

                      {/* Delete Button */}
                      {view === 'all' && tweet.owner?._id === user?._id && (
                        <button
                          onClick={() => handleDeleteTweet(tweet._id)}
                          className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gray-800/50 text-gray-400 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 hover:text-red-400 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

        {/* Load More */}
        {view === 'all' && hasMore && tweets.length > 0 && (
          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={() => fetchAllTweets(page + 1, false)}
              disabled={loading}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all duration-300 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
            >
              {loading ? "Loading..." : "Load More Tweets"}
            </button>
          </div>
        )}

        {/* Empty State for All Tweets */}
        {view === 'all' && tweets.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text mb-2">No tweets yet</h3>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">Be the first to share something!</p>
          </div>
        )}

        {/* Empty State for Channel Tweets */}
        {view === 'channel-tweets' && tweets.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-800/50">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-pulse">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text mb-2">No tweets from this channel</h3>
            <p className="text-gray-500 text-sm sm:text-base md:text-lg">This channel hasn't posted any tweets yet.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}