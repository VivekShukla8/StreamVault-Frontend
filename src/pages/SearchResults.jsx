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
    
    // Check if date is valid
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
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Search Results for "{query}"</h1>
      
      {/* Channels Section */}
      {results.channels && results.channels.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.channels.map(channel => (
              <Link key={channel._id} to={`/channel/${channel._id}`} className="group">
                <div className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      {channel.avatar ? (
                        <img
                          src={channel.avatar}
                          alt={channel.username}
                          className="w-full h-full rounded-full object-contain bg-gray-700"
                        />
                      ) : (
                        <span className="text-xl font-semibold">
                          {channel.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                        {channel.username}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {formatViews(channel.subscribersCount || 0)} subscribers
                      </p>
                      {channel.fullName && (
                        <p className="text-sm text-gray-500 truncate">
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
          <h2 className="text-xl font-semibold mb-4">Videos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.videos.map(video => (
              <Link key={video._id} to={`/video/${video._id}`} className="group">
                <div className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-800">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-contain bg-gray-900"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                      {video.duration || '0:00'}
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-3">
                    <div className="flex gap-3">
                      {/* Channel Avatar */}
                      <div className="w-9 h-9 bg-gray-700 rounded-full flex-shrink-0 flex items-center justify-center">
                        {video.owner?.avatar ? (
                          <img
                            src={video.owner.avatar}
                            alt={video.owner.username}
                            className="w-full h-full rounded-full object-contain bg-gray-700"
                          />
                        ) : (
                          <span className="text-sm font-semibold">
                            {video.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>

                      {/* Video Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {video.title}
                        </h3>
                        <div className="text-xs text-gray-400 mt-1">
                          <Link 
                            to={`/channel/${video.owner?._id}`}
                            className="hover:text-white transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {video.owner?.username || 'Unknown'}
                          </Link>
                        </div>
                        <div className="text-xs text-gray-400">
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
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No results found for "{query}"</div>
          <p className="text-gray-500">Try different keywords or check your spelling</p>
        </div>
      )}
    </div>
  );
}
