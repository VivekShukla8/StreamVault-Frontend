// Profile.jsx - Full component with responsive scrollable tabs

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { getMe, getMyChannelStats } from "../api/user";
import { 
  RefreshCw, 
  Edit3, 
  Video, 
  MessageSquare, 
  Users, 
  UserPlus, 
  Eye,
  Mail,
  BarChart3
} from "lucide-react";
import Loader from "../components/Loader";
import ProfileVideos from "./ProfileVideos";
import ProfileTweets from "./ProfileTweets";
import ProfileSubscribers from "./ProfileSubscribers";
import ProfileAnalytics from "./ProfileAnalytics";
import MessageRequestsPanel from "../components/MessageRequestsPanel";

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coverImageError, setCoverImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [coverImageLoading, setCoverImageLoading] = useState(false);

  // Get current page from URL path
  const currentPath = location.pathname;
  const activeTab = currentPath.includes('/videos') ? 'videos' :
                   currentPath.includes('/tweets') ? 'tweets' :
                   currentPath.includes('/subscribers') ? 'subscribers' :
                   currentPath.includes('/analytics') ? 'analytics' : 
                   currentPath.includes('/requests') ? 'requests' : 'videos';

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  // Listen for profile updates from edit page
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profileUpdated') {
        fetchUserProfile();
        localStorage.removeItem('profileUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const handleProfileUpdate = () => {
      fetchUserProfile();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching user profile...');
      
      const [profileResponse, statsResponse] = await Promise.all([
        getMe(),
        getMyChannelStats()
      ]);
      
      console.log('Profile response:', profileResponse);
      console.log('Stats response:', statsResponse);
      
      const userData = profileResponse.data?.data || profileResponse.data;
      const statsData = statsResponse.data?.data || statsResponse.data;
      
      console.log('User data:', userData);
      console.log('Stats data:', statsData);
      console.log('Cover image URL:', userData?.coverImage);
      
      setUser(userData);
      setStats(statsData);
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError("Failed to load user profile. Please login.");
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    { key: 'videos', label: 'Videos', icon: Video, count: stats?.videosCount || 0, gradient: 'from-red-500 to-pink-500' },
    { key: 'tweets', label: 'Tweets', icon: MessageSquare, count: stats?.tweetsCount || 0, gradient: 'from-sky-500 to-blue-500' },
    { key: 'subscribers', label: 'Subscribers', icon: Users, count: stats?.subscribersCount || 0, gradient: 'from-purple-500 to-pink-500' },
    { key: 'analytics', label: 'Analytics', icon: BarChart3, count: null, gradient: 'from-amber-500 to-orange-500' },
    { key: 'requests', label: 'Requests', icon: Mail, count: null, gradient: 'from-emerald-500 to-teal-500' },
  ];

  if (loading) return <Loader />;
  
  // 💫 RESPONSIVE: Enhanced error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center p-3 sm:p-4 md:p-8">
        <div className="max-w-md w-full bg-gradient-to-br from-red-950/30 to-slate-900/50 backdrop-blur-xl rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 border border-red-500/20 shadow-2xl">
          <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl md:rounded-2xl mx-auto mb-3 sm:mb-4 md:mb-6 shadow-lg shadow-red-500/30">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent mb-2 md:mb-3">
            Profile Error
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base text-center leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 flex items-center justify-center p-4">
        <p className="text-slate-400 text-sm sm:text-base">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 text-gray-100 relative overflow-hidden">
      {/* 💫 RESPONSIVE: Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* 💫 RESPONSIVE: Cover Image Section */}
      <div className="relative h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 overflow-hidden group">
        {user.coverImage && !coverImageError ? (
          <>
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => {
                console.warn('Cover image failed to load:', user.coverImage);
                setCoverImageError(true);
                setCoverImageLoading(false);
              }}
              onLoad={() => {
                setCoverImageError(false);
                setCoverImageLoading(false);
              }}
              onLoadStart={() => {
                setCoverImageLoading(true);
              }}
            />
            {coverImageLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-white mx-auto mb-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-white text-xs sm:text-sm">Loading...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
            <div className="text-center p-3">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-slate-400 opacity-30 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
              <p className="text-slate-400 text-xs sm:text-sm opacity-70">
                {coverImageError ? 'Failed to load' : 'No cover image'}
              </p>
              {coverImageError && (
                <button 
                  onClick={() => {
                    setCoverImageError(false);
                    setCoverImageLoading(true);
                    const img = new Image();
                    img.onload = () => setCoverImageLoading(false);
                    img.onerror = () => {
                      setCoverImageError(true);
                      setCoverImageLoading(false);
                    };
                    img.src = user.coverImage;
                  }}
                  className="mt-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded-lg transition-colors shadow-md"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
      </div>

      {/* 💫 RESPONSIVE: Profile Info Section */}
      <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 -mt-12 sm:-mt-16 md:-mt-20 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-3 sm:gap-4 md:gap-6">
            {/* 💫 RESPONSIVE: Avatar */}
            <div className="relative flex-shrink-0 group/avatar mx-auto md:mx-0">
              {/* Gradient ring */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full opacity-75 group-hover/avatar:opacity-100 blur-sm transition-opacity duration-300"></div>
              
              <img
                src={!avatarError && user.avatar ? user.avatar : 'https://via.placeholder.com/120x120/374151/9CA3AF?text=User'}
                alt={user.fullname}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full border-4 border-slate-950 shadow-2xl object-cover bg-slate-800 relative z-10 transition-transform duration-300 group-hover/avatar:scale-105"
                onError={() => {
                  console.warn('Avatar failed to load:', user.avatar);
                  setAvatarError(true);
                }}
                onLoad={() => {
                  if (user.avatar) setAvatarError(false);
                }}
              />
              
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none" id="avatar-loading">
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>

            {/* 💫 RESPONSIVE: User Info & Stats */}
            <div className="flex-1 w-full pb-3 sm:pb-4">
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 relative z-10">
                  <div className="flex-1 text-center md:text-left">
                    <div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-1">
                        {user.fullname || 'Unknown User'}
                      </h1>
                      <p className="text-slate-400 text-xs sm:text-sm md:text-base mb-0.5">@{user.username}</p>
                      {user.email && <p className="text-slate-500 text-xs sm:text-sm">{user.email}</p>}
                    </div>
                  </div>
                  
                  {/* 💫 RESPONSIVE: Action buttons */}
                  <div className="flex items-center justify-center md:justify-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        console.log('Force refreshing profile...');
                        fetchUserProfile();
                      }}
                      className="p-2 sm:p-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-all duration-300 shadow-lg group/refresh relative overflow-hidden"
                      title="Refresh Profile"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover/refresh:opacity-100 transition-opacity duration-300"></span>
                      <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover/refresh:rotate-180 transition-transform duration-500" />
                    </button>
                    <Link
                      to="/profile/edit"
                      className="px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:shadow-cyan-500/30 transform hover:scale-105 active:scale-95 flex items-center gap-1.5 sm:gap-2 group/edit relative overflow-hidden text-xs sm:text-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10" />
                      <span className="relative z-10">Edit Profile</span>
                    </Link>
                  </div>
                </div>

                {/* 💫 RESPONSIVE: Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-slate-800 relative z-10">
                  <div className="text-center group/stat cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-300">
                    <div className="relative">
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-red-400 group-hover/stat:to-pink-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.videosCount || 0}
                      </div>
                      <Video className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mt-1 text-slate-600 group-hover/stat:text-red-500 transition-colors duration-300" />
                    </div>
                    <div className="text-slate-400 text-[10px] sm:text-xs md:text-sm mt-1">Videos</div>
                  </div>
                  <div className="text-center group/stat cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-300">
                    <div className="relative">
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-sky-400 group-hover/stat:to-blue-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.tweetsCount || 0}
                      </div>
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mt-1 text-slate-600 group-hover/stat:text-sky-500 transition-colors duration-300" />
                    </div>
                    <div className="text-slate-400 text-[10px] sm:text-xs md:text-sm mt-1">Tweets</div>
                  </div>
                  <div className="text-center group/stat cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-300">
                    <div className="relative">
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-purple-400 group-hover/stat:to-pink-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.subscribersCount || 0}
                      </div>
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mt-1 text-slate-600 group-hover/stat:text-purple-500 transition-colors duration-300" />
                    </div>
                    <div className="text-slate-400 text-[10px] sm:text-xs md:text-sm mt-1">Subscribers</div>
                  </div>
                  <div className="text-center group/stat cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-300">
                    <div className="relative">
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-emerald-400 group-hover/stat:to-teal-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.subscriptionsCount || 0}
                      </div>
                      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mt-1 text-slate-600 group-hover/stat:text-emerald-500 transition-colors duration-300" />
                    </div>
                    <div className="text-slate-400 text-[10px] sm:text-xs md:text-sm mt-1">Subscriptions</div>
                  </div>
                  <div className="text-center group/stat cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-300 col-span-2 sm:col-span-1">
                    <div className="relative">
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-amber-400 group-hover/stat:to-orange-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.totalViews ? `${(stats.totalViews / 1000).toFixed(1)}K` : '0'}
                      </div>
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mt-1 text-slate-600 group-hover/stat:text-amber-500 transition-colors duration-300" />
                    </div>
                    <div className="text-slate-400 text-[10px] sm:text-xs md:text-sm mt-1">Total Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 💫 RESPONSIVE: Content Navigation */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-4 sm:mt-6 md:mt-8">
        {/* 💫 RESPONSIVE: Tab Navigation - Scrollable on mobile with visible scrollbar */}
        <div className="relative">
          {/* Gradient fade indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-10 md:hidden"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-10 md:hidden"></div>
          
          <div className="flex border-b border-slate-800 mb-4 sm:mb-6 md:mb-8 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 hover:scrollbar-thumb-slate-600 justify-start pb-2">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <Link
                  key={tab.key}
                  to={`/profile/${tab.key}`}
                  className={`px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 font-medium whitespace-nowrap transition-all duration-300 relative group overflow-hidden text-xs sm:text-sm md:text-base flex-shrink-0
                    ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'}
                  `}
                >
                  {/* Gradient glow on hover */}
                  <span className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></span>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2 relative z-10">
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-white'} transition-colors duration-300`} />
                    <span>
                      {tab.label}
                      {tab.count !== null && (
                        <span className="ml-1 text-[10px] sm:text-xs opacity-70">({tab.count})</span>
                      )}
                    </span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${tab.gradient} rounded-full`}></span>
                  )}
                  
                  {/* Hover indicator */}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r ${tab.gradient} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${isActive ? 'hidden' : ''}`}></span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tab Content - Rendered as Routes */}
        <div className="pb-6 sm:pb-8 md:pb-12 lg:pb-16">
          <Routes>
            <Route path="/videos" element={<ProfileVideos user={user} />} />
            <Route path="/tweets" element={<ProfileTweets user={user} />} />
            <Route path="/subscribers" element={<ProfileSubscribers user={user} />} />
            <Route path="/analytics" element={<ProfileAnalytics user={user} stats={stats} />} />
            <Route path="/requests" element={<MessageRequestsPanel />} />
            <Route path="*" element={<ProfileVideos user={user} />} />
          </Routes>
        </div>
      </div>

      {/* Custom CSS */}
      <style jsx>{`
        .delay-1000 {
          animation-delay: 1s;
        }
        
        /* Custom scrollbar styling */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        
        .scrollbar-thumb-slate-700::-webkit-scrollbar-thumb {
          background-color: rgb(51 65 85);
          border-radius: 9999px;
        }
        
        .scrollbar-track-slate-900::-webkit-scrollbar-track {
          background-color: rgb(15 23 42);
          border-radius: 9999px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgb(71 85 105);
        }
      `}</style>
    </div>
  );
}