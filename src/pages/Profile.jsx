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
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!user) return <div className="text-center text-gray-400 p-8">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Cover Image Section - Reduced Height */}
      <div className="relative h-32 md:h-40 bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden group">
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
                  <svg className="animate-spin h-6 w-6 text-white mx-auto mb-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-white text-xs">Loading...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
            <div className="text-center p-3">
              <svg className="w-10 h-10 text-gray-400 opacity-30 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
              <p className="text-gray-400 text-sm opacity-70">
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
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors shadow-md"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent"></div>
      </div>

      {/* Profile Info Section - Reduced Spacing */}
      <div className="relative px-4 sm:px-6 -mt-12 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            {/* Avatar - Reduced Size */}
            <div className="relative flex-shrink-0 group/avatar">
              {/* Gradient ring */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-75 group-hover/avatar:opacity-100 blur-sm transition-opacity duration-300"></div>
              
              <img
                src={!avatarError && user.avatar ? user.avatar : 'https://via.placeholder.com/96x96/374151/9CA3AF?text=User'}
                alt={user.fullname}
                className="w-30 h-30 md:w-34 md:h-34  rounded-full border-4 border-gray-950 shadow-lg object-cover bg-gray-800 relative z-10 transition-transform duration-300 group-hover/avatar:scale-105"
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

            {/* User Info & Stats - Reduced Padding */}
            <div className="flex-1 w-full pb-3 ml-5">
              <div className="bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl p-4 border border-gray-800 shadow-xl relative overflow-hidden">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
                  <div className="flex-1">
                    <div>
                      <h1 className="text-xl md:text-2xl font-extrabold text-white mb-0.5 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                        {user.fullname || 'Unknown User'}
                      </h1>
                      <p className="text-gray-400 text-sm mb-0.5">@{user.username}</p>
                      {user.email && <p className="text-gray-500 text-xs">{user.email}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        console.log('Force refreshing profile...');
                        fetchUserProfile();
                      }}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all duration-300 font-medium text-sm shadow-md group/refresh relative overflow-hidden"
                      title="Refresh Profile"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover/refresh:opacity-100 transition-opacity duration-300"></span>
                      <RefreshCw className="h-4 w-4 relative z-10 group-hover/refresh:rotate-180 transition-transform duration-500" />
                    </button>
                    <Link
                      to="/profile/edit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md transform hover:scale-105 flex items-center gap-2 group/edit relative overflow-hidden text-sm"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-500/20 opacity-0 group-hover/edit:opacity-100 transition-opacity duration-300"></span>
                      <Edit3 className="h-3.5 w-3.5 relative z-10" />
                      <span className="relative z-10">Edit Profile</span>
                    </Link>
                  </div>
                </div>

                {/* Stats - Reduced Size */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4  pt-3 border-t border-gray-800 relative z-10">
                  <div className="text-center group/stat cursor-pointer">
                    <div className="relative">
                      <div className="text-lg font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-red-400 group-hover/stat:to-pink-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.videosCount || 0}
                      </div>
                      <Video className="w-4 h-4 mx-auto mt-0.5 text-gray-600 group-hover/stat:text-red-500 transition-colors duration-300" />
                    </div>
                    <div className="text-gray-400 text-[15px] mt-0.5">Videos</div>
                  </div>
                  <div className="text-center group/stat cursor-pointer">
                    <div className="relative">
                      <div className="text-lg font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-sky-400 group-hover/stat:to-blue-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.tweetsCount || 0}
                      </div>
                      <MessageSquare className="w-4 h-4 mx-auto mt-0.5 text-gray-600 group-hover/stat:text-sky-500 transition-colors duration-300" />
                    </div>
                    <div className="text-gray-400 text-[15px] mt-0.5">Tweets</div>
                  </div>
                  <div className="text-center group/stat cursor-pointer">
                    <div className="relative">
                      <div className="text-lg font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-purple-400 group-hover/stat:to-pink-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.subscribersCount || 0}
                      </div>
                      <Users className="w-4 h-4 mx-auto mt-0.5 text-gray-600 group-hover/stat:text-purple-500 transition-colors duration-300" />
                    </div>
                    <div className="text-gray-400 text-[15px] mt-0.5">Subscribers</div>
                  </div>
                  <div className="text-center group/stat cursor-pointer">
                    <div className="relative">
                      <div className="text-lg font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-emerald-400 group-hover/stat:to-teal-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.subscriptionsCount || 0}
                      </div>
                      <UserPlus className="w-4 h-4 mx-auto mt-0.5 text-gray-600 group-hover/stat:text-emerald-500 transition-colors duration-300" />
                    </div>
                    <div className="text-gray-400 text-[15px]  mt-0.5">Subscriptions</div>
                  </div>
                  <div className="text-center group/stat cursor-pointer">
                    <div className="relative">
                      <div className="text-lg font-bold text-white group-hover/stat:text-transparent group-hover/stat:bg-gradient-to-r group-hover/stat:from-amber-400 group-hover/stat:to-orange-500 group-hover/stat:bg-clip-text transition-all duration-300">
                        {stats?.totalViews ? `${(stats.totalViews / 1000).toFixed(1)}K` : '0'}
                      </div>
                      <Eye className="w-4 h-4 mx-auto mt-0.5 text-gray-600 group-hover/stat:text-amber-500 transition-colors duration-300" />
                    </div>
                    <div className="text-gray-400 text-[15px] mt-0.5">Total Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6 overflow-x-auto justify-start">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <Link
                key={tab.key}
                to={`/profile/${tab.key}`}
                className={`px-6 py-3 font-medium whitespace-nowrap transition-all duration-300 relative group overflow-hidden
                  ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'}
                `}
              >
                {/* Gradient glow on hover */}
                <span className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></span>
                
                <div className="flex items-center gap-2 relative z-10">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'} transition-colors duration-300`} />
                  <span>
                    {tab.label}
                    {tab.count !== null && ` (${tab.count})`}
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

        {/* Tab Content - Rendered as Routes */}
        <div className="pb-8">
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
    </div>
  );
}