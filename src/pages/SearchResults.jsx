import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchAPI } from "../api/search";
import Loader from "../components/Loader";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState({ videos: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const response = await searchAPI.searchVideosAndChannels(query);
      setResults(response.data.data || { videos: [], channels: [] });
    } catch (err) {
      setError("Failed to fetch search results");
      console.error("Error fetching search results:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views?.toString() || '0';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const videoDate = new Date(date);
    
    if (isNaN(videoDate.getTime())) {
      return 'Unknown time';
    }
    
    const diffInSeconds = Math.floor((now - videoDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  if (loading) return <Loader />;
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-md w-full bg-gradient-to-br from-red-950/30 to-slate-900/50 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-8 border border-red-500/20 shadow-2xl">
          <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl md:rounded-2xl mx-auto mb-4 md:mb-6 shadow-lg shadow-red-500/30">
            <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent mb-2 md:mb-3">
            Connection Error
          </h3>
          <p className="text-slate-300 text-sm md:text-base text-center leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 md:left-20 w-64 h-64 md:w-96 md:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 md:right-20 w-64 h-64 md:w-96 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content - Full Width */}
      <div className="relative w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-10 lg:py-12">
        {/* Header */}
        <div className="mb-6 md:mb-10 space-y-3 md:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
            <span className="block bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Search Results
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-400 font-light">
            Results for "<span className="text-cyan-400 font-medium">{query}</span>"
          </p>
        </div>
        
        {/* Channels Section */}
        {results.channels && results.channels.length > 0 && (
          <div className="mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Channels
            </h2>
            {/* Mobile: 1 column, iPad: 2 columns, Desktop: 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {results.channels.map((channel, index) => (
                <Link 
                  key={channel._id} 
                  to={`/channel/${channel._id}`} 
                  className="group transform transition-all duration-300 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0
                  }}
                >
                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-5 lg:p-6 hover:from-slate-800/80 hover:to-slate-700/80 transition-all duration-300 border border-slate-700/50 hover:border-cyan-500/50 shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-cyan-500/30 transition-shadow duration-300">
                        {channel.avatar ? (
                          <img
                            src={channel.avatar}
                            alt={channel.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-br from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            {channel.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                          {channel.username}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-0.5 md:mt-1">
                          {formatViews(channel.subscribersCount || 0)} subscribers
                        </p>
                        {channel.fullName && (
                          <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
                            {channel.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {results.videos && results.videos.length > 0 && (
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Videos
            </h2>
            {/* Mobile: 1 column, iPad: 2 columns, Desktop: 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {results.videos.map((video, index) => (
                <Link 
                  key={video._id} 
                  to={`/video/${video._id}`} 
                  className="group transform transition-all duration-300 hover:-translate-y-2"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0
                  }}
                >
                  <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl md:rounded-2xl overflow-hidden hover:from-slate-800/80 hover:to-slate-700/80 transition-all duration-300 border border-slate-700/50 hover:border-purple-500/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20">
                    {/* Thumbnail - Full Image without cropping */}
                    <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-contain bg-slate-900"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded font-semibold">
                        {video.duration || '0:00'}
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="p-3 sm:p-4">
                      <div className="flex gap-2 sm:gap-3">
                        {/* Channel Avatar */}
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex-shrink-0 flex items-center justify-center shadow-md">
                          {video.owner?.avatar ? (
                            <img
                              src={video.owner.avatar}
                              alt={video.owner.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs sm:text-sm font-bold text-cyan-400">
                              {video.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>

                        {/* Video Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-white group-hover:text-purple-400 transition-colors leading-snug">
                            {video.title}
                          </h3>
                          <div className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-1.5">
                            <Link 
                              to={`/channel/${video.owner?._id}`}
                              className="hover:text-cyan-400 transition-colors truncate block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {video.owner?.username || 'Unknown'}
                            </Link>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {(!results.videos || results.videos.length === 0) && (!results.channels || results.channels.length === 0) && (
          <div className="flex items-center justify-center py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="max-w-xl w-full mx-auto px-4">
              <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-8 sm:p-10 md:p-12 lg:p-16 border border-slate-700/50 shadow-2xl overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10 text-center space-y-6 md:space-y-8">
                  {/* Icon */}
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full blur-xl md:blur-2xl opacity-50 animate-pulse"></div>
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center shadow-2xl shadow-slate-900/50">
                      <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      No Results Found
                    </h3>
                    <p className="text-slate-400 text-sm sm:text-base md:text-lg leading-relaxed max-w-md mx-auto px-4">
                      We couldn't find anything matching "<span className="text-cyan-400 font-medium">{query}</span>"
                    </p>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      Try different keywords or check your spelling
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}