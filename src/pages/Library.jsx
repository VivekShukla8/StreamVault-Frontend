import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { getWatchHistory } from "../api/user";
import { likeAPI } from "../api/like";
import { playlistAPI } from "../api/playlist";
import { AuthContext } from "../features/auth/AuthContext";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";
import PlaylistCard from "../components/PlaylistCard";

export default function Library() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchLibraryData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [historyResponse, likedResponse, playlistsResponse] = await Promise.allSettled([
        getWatchHistory(),
        likeAPI.getLikedVideos(user._id),
        playlistAPI.getUserPlaylists(user._id)
      ]);

      if (historyResponse.status === 'fulfilled') {
        const historyData = historyResponse.value.data?.data || [];
        setHistory(historyData.slice(0, 6));
      }

      if (likedResponse.status === 'fulfilled') {
        const likedData = likedResponse.value.data?.data || [];
        setLikedVideos(likedData.slice(0, 6));
      }

      if (playlistsResponse.status === 'fulfilled') {
        const playlistsData = playlistsResponse.value.data?.data || [];
        setPlaylists(playlistsData.slice(0, 4));
      }

    } catch (err) {
      console.error('Error fetching library data:', err);
      setError('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffInSeconds = Math.floor((now - targetDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-gray-950/70 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-500/20">
              <svg className="w-10 h-10 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text mb-3">
              Access Your Library
            </h2>
            <p className="text-gray-400 mb-6">Keep track of your videos, playlists, and watch history all in one place</p>
            <Link
              to="/login"
              className="inline-block px-8 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-slate-400 via-slate-300 to-slate-500 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/20">
              <svg className="w-7 h-7 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text">
                Your Library
              </h1>
              <p className="text-gray-400 text-lg">All your content in one place</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-900/30 to-pink-900/30 backdrop-blur-sm border border-red-600/30 rounded-xl p-5">
            <p className="text-red-400 font-medium mb-3">{error}</p>
            <button
              onClick={fetchLibraryData}
              className="px-5 py-2 bg-red-700/50 hover:bg-red-700/70 text-red-200 rounded-lg transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Link
            to="/history"
            className="group bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/70 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <h3 className="font-bold text-white mb-1">History</h3>
            <p className="text-gray-400 text-sm">{history.length} videos watched</p>
          </Link>

          <Link
            to="/liked"
            className="group bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/70 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-pink-600/20">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <h3 className="font-bold text-white mb-1">Liked Videos</h3>
            <p className="text-gray-400 text-sm">{likedVideos.length} videos liked</p>
          </Link>

          <Link
            to="/playlists"
            className="group bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/70 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-green-600/20">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
            </div>
            <h3 className="font-bold text-white mb-1">Playlists</h3>
            <p className="text-gray-400 text-sm">{playlists.length} collections</p>
          </Link>

          <Link
            to="/subscriptions"
            className="group bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 hover:border-gray-700/70 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-purple-600/20">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z"/>
              </svg>
            </div>
            <h3 className="font-bold text-white mb-1">Subscriptions</h3>
            <p className="text-gray-400 text-sm">Your channels</p>
          </Link>
        </div>

        {/* Recent Watch History */}
        {history.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Continue Watching</h2>
              <Link
                to="/history"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-semibold group"
              >
                View all
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.slice(0, 3).map((video, index) => (
                <div key={video._id} style={{animationDelay: `${index * 100}ms`}} className="animate-fade-in">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Liked Videos */}
        {likedVideos.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Recently Liked</h2>
              <Link
                to="/liked"
                className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors text-sm font-semibold group"
              >
                View all
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedVideos.slice(0, 3).map((video, index) => (
                <div key={video._id} style={{animationDelay: `${index * 100}ms`}} className="animate-fade-in">
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Playlists */}
        {playlists.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text">Your Playlists</h2>
              <Link
                to="/playlists"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm font-semibold group"
              >
                View all
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {playlists.map((playlist, index) => (
                <div key={playlist._id} style={{animationDelay: `${index * 100}ms`}} className="animate-fade-in">
                  <PlaylistCard
                    playlist={playlist}
                    formatTimeAgo={formatTimeAgo}
                    onDelete={() => {}}
                    onUpdate={() => {}}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {history.length === 0 && likedVideos.length === 0 && playlists.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800/50 p-12 max-w-lg mx-auto shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-slate-300 to-slate-400 bg-clip-text mb-3">
                Your library is empty
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Start exploring content to build your personal library. Watch videos, create playlists, and like content to see them here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="px-8 py-3 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 hover:from-slate-300 hover:via-slate-200 hover:to-slate-300 text-slate-900 rounded-xl transition-all duration-300 font-bold shadow-lg shadow-slate-500/30 hover:shadow-slate-400/50 transform hover:scale-105"
                >
                  Explore Videos
                </Link>
                <Link
                  to="/trending"
                  className="px-8 py-3 bg-gray-900/60 hover:bg-gray-900/80 text-white border border-gray-800/50 hover:border-gray-700/70 rounded-xl transition-all duration-300 font-semibold transform hover:scale-105"
                >
                  View Trending
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {(history.length > 0 || likedVideos.length > 0 || playlists.length > 0) && (
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text mb-1">{history.length}</div>
              <div className="text-gray-400 text-sm font-medium">Videos Watched</div>
            </div>
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text mb-1">{likedVideos.length}</div>
              <div className="text-gray-400 text-sm font-medium">Videos Liked</div>
            </div>
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text mb-1">{playlists.length}</div>
              <div className="text-gray-400 text-sm font-medium">Playlists Created</div>
            </div>
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/50 backdrop-blur-xl border border-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text mb-1">
                {playlists.reduce((total, playlist) => total + (playlist.videoCount || 0), 0)}
              </div>
              <div className="text-gray-400 text-sm font-medium">Playlist Videos</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}