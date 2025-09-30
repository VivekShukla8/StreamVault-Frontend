import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShareButton from './ShareButton';
import { useShare } from '../hooks/useShare';
import { commentAPI } from "../api/comment";
import { likeAPI } from "../api/like";

export default function VideoCard({ video, channelData }) {
  if (channelData) {
    const channelName = channelData.username || channelData.fullname || 'Unknown Channel';
    const channelId = channelData._id || 'unknown';
    const channelAvatar = channelData.avatar;

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

  const uploader = video.uploader || video.owner || {};

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

function renderVideoCard(video, channelName, channelId, channelAvatar) {
  const [likesCount, setLikesCount] = useState(video.likes || 0);
  const [commentsCount, setCommentsCount] = useState(video.comments || 0);
  const { shareVideo } = useShare();

  const formatViews = (views) => {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views?.toString() || '0';
  };

  const formatLikes = (likes) => {
    if (likes >= 1000000) return (likes / 1000000).toFixed(1) + 'M';
    if (likes >= 1000) return (likes / 1000).toFixed(1) + 'K';
    return likes?.toString() || '0';
  };

  const formatComments = (comments) => {
    if (comments >= 1000000) return (comments / 1000000).toFixed(1) + 'M';
    if (comments >= 1000) return (comments / 1000).toFixed(1) + 'K';
    return comments?.toString() || '0';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';

    const now = new Date();
    const videoDate = new Date(date);

    if (isNaN(videoDate.getTime())) return 'Unknown time';

    const diffInSeconds = Math.floor((now - videoDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const formatDuration = (duration) => {
    const durationValue = duration || video.videoDuration || video.length || video.time || 0;

    if (!durationValue) return '0:00';

    if (typeof durationValue === 'string' && durationValue.includes(':')) return durationValue;

    const totalSeconds = parseInt(durationValue);
    if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';

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
    likeAPI.getVideoLikeCount(video._id)
      .then(res => setLikesCount(res.data.data.likeCount))
      .catch(err => console.error(err));

    commentAPI.getVideoComments(video._id)
      .then(res => setCommentsCount(res.data.data.totalCount))
      .catch(err => console.error(err));
  }, [video._id]);

  return (
    <>
      <Link to={`/video/${video._id}`} className="group block transition-all duration-300 w-full" aria-label={`Watch video: ${video.title || 'Untitled Video'}`}>
        <div className="relative rounded-xl overflow-hidden shadow-2xl hover:shadow-cyan-500/30 hover:scale-[1.02] transition-all duration-500 ease-out bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col h-full card-wrapper">
          {/* Animated Border - Bottom to Right */}
          <div className="animated-border-overlay"></div>
          
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none rounded-xl z-[1]"></div>

          {/* Video Thumbnail Container */}
          <div className="relative flex-shrink-0 group/thumbnail">
            <div className="aspect-video relative w-full overflow-hidden rounded-t-xl bg-slate-950">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-contain rounded-t-xl transition-all duration-700 group-hover/thumbnail:scale-110 group-hover/thumbnail:brightness-110"
                loading="lazy"
                draggable={false}
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumbnail:opacity-100 transition-all duration-400 bg-gradient-to-br from-black/60 via-black/50 to-transparent rounded-t-xl">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-400/70 cursor-pointer transform scale-90 group-hover/thumbnail:scale-110 transition-all duration-400 ease-out hover:rotate-6">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 text-white drop-shadow-2xl ml-0.5 sm:ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-10">
                <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-black/80 backdrop-blur-sm text-cyan-300 text-[10px] sm:text-xs font-bold rounded-lg shadow-xl border border-cyan-500/30 select-none">
                  {formatDuration(video.duration)}
                </div>
              </div>

              {/* Live indicator */}
              {video.isLive && (
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
                  <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] sm:text-xs font-bold rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-2xl shadow-red-500/50 select-none">
                    <div className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                </div>
              )}

              {/* Thumbnail shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="shimmer-effect"></div>
              </div>
            </div>
          </div>

          {/* Video Info Section */}
          <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between relative z-10">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              {/* Channel Avatar */}
              <Link
                to={`/channel/${channelId}`}
                className="relative flex-shrink-0 rounded-full p-[2px] bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-400/40 hover:scale-110 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Go to ${channelName} channel`}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                  {channelAvatar ? (
                    <img
                      src={channelAvatar}
                      alt={channelName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                      draggable={false}
                    />
                  ) : null}
                  <span
                    className="text-sm sm:text-base md:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-purple-500 hidden items-center justify-center w-full h-full select-none"
                  >
                    {channelName.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </Link>

              {/* Video Details */}
              <div className="flex-1 min-w-0 space-y-1 sm:space-y-2 md:space-y-2.5">
                {/* Title */}
                <h3 className="font-bold text-sm sm:text-base md:text-lg leading-tight line-clamp-2 text-slate-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-500 transition-all duration-500 cursor-pointer select-text">
                  {video.title || 'Untitled Video'}
                </h3>

                {/* Channel Name */}
                <div className="text-xs sm:text-sm text-slate-400">
                  <Link
                    to={`/channel/${channelId}`}
                    className="hover:text-cyan-400 transition-colors duration-300 font-medium select-text inline-flex items-center gap-1 sm:gap-1.5 group/channel"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{channelName}</span>
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-0 group-hover/channel:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>

                {/* Views, Likes, Comments, Time */}
                <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-1 sm:gap-y-2 text-[10px] sm:text-xs font-medium select-none">
                  {/* Views */}
                  <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors duration-300 group/stat">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover/stat:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                    <span>{formatViews(video.views)}</span>
                  </div>

                  {/* Likes */}
                  <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400 hover:text-blue-400 transition-colors duration-300 group/stat">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover/stat:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                    </svg>
                    <span>{formatLikes(likesCount)}</span>
                  </div>

                  {/* Comments */}
                  <div className="flex items-center gap-1 sm:gap-1.5 text-slate-400 hover:text-purple-400 transition-colors duration-300 group/stat">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover/stat:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                    </svg>
                    <span>{formatComments(commentsCount)}</span>
                  </div>

                  <span className="text-slate-700 select-none hidden sm:inline">•</span>

                  {/* Time */}
                  <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 group/stat">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover/stat:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    <span className="hidden sm:inline">{formatTimeAgo(video.createdAt)}</span>
                    <span className="sm:hidden">{formatTimeAgo(video.createdAt).replace(' ago', '')}</span>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <ShareButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  shareVideo(video._id);
                }}
                size="small"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-2 group-hover:translate-y-0 mt-1 text-slate-500 hover:text-cyan-400 hover:scale-110 hidden sm:block"
                aria-label="Share video"
              />
            </div>
          </div>

          {/* CSS Styles */}
          <style jsx>{`
            .card-wrapper {
              position: relative;
              border: 2px solid transparent;
            }

            .animated-border-overlay {
              position: absolute;
              inset: 0;
              border-radius: 0.75rem;
              padding: 2px;
              background: linear-gradient(
                135deg,
                transparent 0%,
                transparent 40%,
                #06b6d4 50%,
                #3b82f6 60%,
                #8b5cf6 70%,
                transparent 80%,
                transparent 100%
              );
              -webkit-mask: 
                linear-gradient(#fff 0 0) content-box, 
                linear-gradient(#fff 0 0);
              -webkit-mask-composite: xor;
              mask-composite: exclude;
              opacity: 0;
              transition: opacity 0.4s ease;
              pointer-events: none;
              z-index: 2;
              background-size: 300% 300%;
              animation: border-flow 3s linear infinite;
            }

            .card-wrapper:hover .animated-border-overlay {
              opacity: 1;
            }

            @keyframes border-flow {
              0% {
                background-position: 0% 100%;
              }
              50% {
                background-position: 100% 0%;
              }
              100% {
                background-position: 0% 100%;
              }
            }

            .shimmer-effect {
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(6, 182, 212, 0.3) 50%,
                transparent 100%
              );
              animation: shimmer 2s infinite;
            }

            @keyframes shimmer {
              0% {
                left: -100%;
              }
              100% {
                left: 100%;
              }
            }
          `}</style>
        </div>
      </Link>
    </>
  );
}