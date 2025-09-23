import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { getMe, getMyChannelStats } from "../api/user";
import Loader from "../components/Loader";
import ProfileVideos from "./ProfileVideos";
import ProfileTweets from "./ProfileTweets";
import ProfileSubscribers from "./ProfileSubscribers";
import ProfileAnalytics from "./ProfileAnalytics";

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
                   currentPath.includes('/analytics') ? 'analytics' : 'videos';

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  // Listen for profile updates from edit page
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'profileUpdated') {
        // Refresh profile data when updates are made
        fetchUserProfile();
        localStorage.removeItem('profileUpdated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events within the same tab
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
      
      // Get current user profile and statistics
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



  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!user) return <div className="text-center text-gray-400 p-8">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Cover Image Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-900 to-purple-900">
        {user.coverImage && !coverImageError ? (
          <>
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-contain bg-gray-800"
              onError={() => {
                console.warn('Cover image failed to load:', user.coverImage);
                console.log('User object:', user);
                setCoverImageError(true);
                setCoverImageLoading(false);
              }}
              onLoad={() => {
                console.log('Cover image loaded successfully:', user.coverImage);
                setCoverImageError(false);
                setCoverImageLoading(false);
              }}
              onLoadStart={() => {
                console.log('Cover image loading started:', user.coverImage);
                setCoverImageLoading(true);
              }}
            />
            {/* Loading overlay for cover image */}
            {coverImageLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-white text-sm">Loading cover image...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-white opacity-30 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
              <p className="text-white text-lg opacity-50">
                {coverImageError ? 'Cover image failed to load' : 'No cover image'}
              </p>
              {coverImageError && (
                <button 
                  onClick={() => {
                    setCoverImageError(false);
                    setCoverImageLoading(true);
                    // Force reload the image
                    const img = new Image();
                    img.onload = () => setCoverImageLoading(false);
                    img.onerror = () => {
                      setCoverImageError(true);
                      setCoverImageLoading(false);
                    };
                    img.src = user.coverImage;
                  }}
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Profile Info Section */}
      <div className="relative px-6 -mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={!avatarError && user.avatar ? user.avatar : 'https://via.placeholder.com/160x160/374151/9CA3AF?text=User'}
                alt={user.fullname}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-gray-800"
                onError={() => {
                  console.warn('Avatar failed to load:', user.avatar);
                  setAvatarError(true);
                }}
                onLoad={() => {
                  if (user.avatar) setAvatarError(false);
                }}
              />
              {/* Loading indicator for avatar updates */}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity" id="avatar-loading">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 pb-4">
              <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {user.fullname || 'Unknown User'}
                      </h1>
                      <p className="text-gray-400 mb-1">@{user.username}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        console.log('Force refreshing profile...');
                        fetchUserProfile();
                      }}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium text-sm"
                      title="Refresh Profile"
                    >
                      🔄
                    </button>
                    <Link
                      to="/profile/edit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Edit Profile
                    </Link>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-gray-800">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{stats?.videosCount || 0}</div>
                    <div className="text-gray-400 text-sm">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{stats?.tweetsCount || 0}</div>
                    <div className="text-gray-400 text-sm">Tweets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{stats?.subscribersCount || 0}</div>
                    <div className="text-gray-400 text-sm">Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{stats?.subscriptionsCount || 0}</div>
                    <div className="text-gray-400 text-sm">Subscriptions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{stats?.totalViews ? `${Math.floor(stats.totalViews / 1000)}K` : '0'}</div>
                    <div className="text-gray-400 text-sm">Total Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Navigation */}
      <div className="max-w-6xl mx-auto px-6 mt-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6 overflow-x-auto">
          <Link
            to="/profile/videos"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'videos'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Videos ({stats?.videosCount || 0})
          </Link>
          <Link
            to="/profile/tweets"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'tweets'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Tweets ({stats?.tweetsCount || 0})
          </Link>
          <Link
            to="/profile/subscribers"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'subscribers'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Subscribers ({stats?.subscribersCount || 0})
          </Link>
          <Link
            to="/profile/analytics"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Analytics
          </Link>
        </div>

        {/* Tab Content - Rendered as Routes */}
        <div className="pb-8">
          <Routes>
            <Route path="/videos" element={<ProfileVideos user={user} />} />
            <Route path="/tweets" element={<ProfileTweets user={user} />} />
            <Route path="/subscribers" element={<ProfileSubscribers user={user} />} />
            <Route path="/analytics" element={<ProfileAnalytics user={user} stats={stats} />} />
            <Route path="/" element={<ProfileVideos user={user} />} /> {/* Default */}
          </Routes>
        </div>
      </div>
    </div>
  );
}