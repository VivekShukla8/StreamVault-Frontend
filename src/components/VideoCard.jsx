import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShareButton from './ShareButton';
import { useShare } from '../hooks/useShare';
import { commentAPI } from "../api/comment";
import { likeAPI } from "../api/like";

export default function VideoCard({ video, channelData }) {
  // If channelData is provided (from channel page), use it instead of video uploader data
  if (channelData) {
    const channelName = channelData.username || channelData.fullname || 'Unknown Channel';
    const channelId = channelData._id || 'unknown';
    const channelAvatar = channelData.avatar;
    
    // Use the channel data for rendering
    const uploader = {
      _id: channelId,
      username: channelData.username,
      fullname: channelData.fullname,
      avatar: channelAvatar
    };
    
    const finalChannelName = channelName;
    const finalChannelId = channelId;
    const finalChannelAvatar = channelAvatar;
    
    return renderVideoCard(video, finalChannelName, finalChannelId, finalChannelAvatar);
  }
  
  // Original logic for when no channel data is provided (home page, etc.)
  // Ensure we have proper uploader/owner data with fallbacks
  const uploader = video.uploader || video.owner || {};
  
  // Handle case where uploader is just an ObjectId string
  let finalUploader = uploader;
  if (typeof uploader === 'string') {
    finalUploader = {
      _id: uploader,
      username: 'Unknown Channel',
      fullname: 'Unknown Channel',
      avatar: null
    };
  }
  
  const channelName = finalUploader.username || finalUploader.fullname || 'Unknown Channel';
  const channelId = finalUploader._id || 'unknown';
  const channelAvatar = finalUploader.avatar;
  
  return renderVideoCard(video, channelName, channelId, channelAvatar);
}

// Extracted render function to avoid duplication
function renderVideoCard(video, channelName, channelId, channelAvatar) {
  const [likesCount, setLikesCount] = useState(video.likes || 0);
  const [commentsCount, setCommentsCount] = useState(video.comments || 0);
  const { shareVideo } = useShare(); // Only need shareVideo now

  const formatViews = (views) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views?.toString() || '0';
  };

  // New: Format likes (similar to views)
  const formatLikes = (likes) => {
    if (likes >= 1000000) {
      return (likes / 1000000).toFixed(1) + 'M';
    } else if (likes >= 1000) {
      return (likes / 1000).toFixed(1) + 'K';
    }
    return likes?.toString() || '0';
  };

  // New: Format comments (similar to views, but for count)
  const formatComments = (comments) => {
    if (comments >= 1000000) {
      return (comments / 1000000).toFixed(1) + 'M';
    } else if (comments >= 1000) {
      return (comments / 1000).toFixed(1) + 'K';
    }
    return comments?.toString() || '0';
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

  // Video duration formatting
  const formatDuration = (duration) => {
    const durationValue = duration || video.videoDuration || video.length || video.time || 0;
    
    if (!durationValue) {
      return '0:00';
    }
    
    // If duration is already formatted as string
    if (typeof durationValue === 'string' && durationValue.includes(':')) {
      return durationValue;
    }
    
    // Convert seconds to MM:SS or HH:MM:SS format
    const totalSeconds = parseInt(durationValue);
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return '0:00';
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  useEffect(() => {
    // Fetch total likes
    likeAPI.getVideoLikeCount(video._id)
      .then(res => setLikesCount(res.data.data.likeCount))
      .catch(err => console.error(err));

    // Fetch total comments
    commentAPI.getVideoComments(video._id)
      .then(res => setCommentsCount(res.data.data.totalCount))
      .catch(err => console.error(err));
  }, [video._id]);

  return (
    <>
      <Link to={`/video/${video._id}`} className="group block transition-all duration-300 w-full">
        <div className="bg-slate-900 rounded-lg overflow-hidden hover:bg-slate-800/80 transition-all duration-300 border border-slate-800/40 h-full flex flex-col">
          
          {/* Video Thumbnail Container */}
          <div className="relative overflow-hidden group/thumbnail flex-shrink-0">
            <div className="aspect-video relative overflow-hidden w-full">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-contain transition-all duration-500 group-hover/thumbnail:scale-105 bg-gray-900"
                loading="lazy"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-all duration-300 bg-black/30">
                <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover/thumbnail:scale-100 transition-all duration-300">
                  <svg className="w-6 h-6 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2">
                <div className="px-1.5 py-1 bg-black/80 text-white text-xs font-medium rounded-md">
                  {formatDuration(video.duration)}
                </div>
              </div>
              
              {/* Live indicator if applicable */}
              {video.isLive && (
                <div className="absolute top-2 right-2">
                  <div className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Video Info Section */}
          <div className="p-3 flex-1 flex flex-col">
            <div className="flex items-start gap-3">
              {/* Channel Avatar - Larger and properly sized */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-sm">
                  {channelAvatar ? (
                    <img
                      src={channelAvatar}
                      alt={channelName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <span 
                    className="text-sm font-bold text-slate-900 hidden items-center justify-center w-full h-full" 
                  >
                    {channelName.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>

              {/* Video Details */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Title */}
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-slate-100 group-hover:text-white transition-colors">
                  {video.title || 'Untitled Video'}
                </h3>
                
                {/* Channel Name */}
                <div className="text-xs text-slate-400">
                  <Link 
                    to={`/channel/${channelId}`}
                    className="hover:text-slate-200 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {channelName}
                  </Link>
                </div>
                
                {/* Views, Likes, Comments, and Time */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {/* Views */}
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    <span>{formatViews(video.views)} views</span>
                  </div>
                  
                  {/* Likes - Added */}
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
                    </svg>
                    <span>{formatLikes(likesCount)} likes</span>
                  </div>
                  
                  {/* Comments - Added */}
                  <div className="flex items-center gap-1   ">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>
                    </svg>
                   <span>{formatComments(commentsCount)} comments</span>
                  </div>
                  
                  <span className="text-slate-600">•</span>
                  
                  {/* Time */}
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>{formatTimeAgo(video.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Share Button positioned in the top right corner */}
              <ShareButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  shareVideo(video._id);
                }}
                size="small"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
              />
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}