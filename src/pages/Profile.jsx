import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Routes, Route, Link, useLocation } from "react-router-dom";
import { getMe, getMyChannelStats } from "../api/user";
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
                   currentPath.includes('/requests') ? 'requests' : 'videos'; // Corrected activeTab logic

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
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Cover Image Section */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
        {user.coverImage && !coverImageError ? (
          <>
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
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
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center">
            <div className="text-center p-4">
              <svg className="w-16 h-16 text-gray-400 opacity-30 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
              </svg>
              <p className="text-gray-400 text-lg opacity-70">
                {coverImageError ? 'Cover image failed to load' : 'No cover image available'}
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
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors shadow-md"
                >
                  Retry Load
                </button>
              )}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>

      {/* Profile Info Section */}
      <div className="relative px-4 sm:px-6 -mt-20 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={!avatarError && user.avatar ? user.avatar : 'https://via.placeholder.com/160x160/374151/9CA3AF?text=User'}
                alt={user.fullname}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-gray-950 shadow-lg object-cover bg-gray-800"
                onError={() => {
                  console.warn('Avatar failed to load:', user.avatar);
                  setAvatarError(true);
                }}
                onLoad={() => {
                  if (user.avatar) setAvatarError(false);
                }}
              />
              {/* Loading indicator for avatar updates (can be triggered by an actual update) */}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-300 pointer-events-none" id="avatar-loading">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            </div>

            {/* User Info & Stats */}
            <div className="flex-1 w-full pb-4">
              <div className="bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl p-6 border border-gray-800 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
                        {user.fullname || 'Unknown User'}
                      </h1>
                      <p className="text-gray-400 text-base mb-1">@{user.username}</p>
                      {user.email && <p className="text-gray-500 text-sm">{user.email}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => {
                        console.log('Force refreshing profile...');
                        fetchUserProfile();
                      }}
                      className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors font-medium text-sm shadow-md"
                      title="Refresh Profile"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.524 4.545A7.002 7.002 0 0112 3a7.002 7.002 0 017 7c0 1.933-.674 3.737-1.802 5.112-.663.782-1.467 1.487-2.392 2.053-.925.566-1.947.967-3.031 1.173a7.014 7.014 0 01-3.649-.126c-1.107-.267-2.155-.767-3.111-1.494a7.004 7.004 0 01-2.484-2.618A6.98 6.98 0 013 10a7.002 7.002 0 011.524-5.455zm.813 1.137A6.002 6.002 0 0012 4a6.002 6.002 0 006 6c0 1.658-.574 3.208-1.545 4.394-.55.67-1.22 1.258-1.996 1.745-.776.487-1.637.795-2.559.923a6.012 6.012 0 01-3.13-.109c-.93-.225-1.81-.66-2.616-1.272a6.004 6.004 0 01-2.126-2.247A5.98 5.98 0 014 10a6.002 6.002 0 011.337-3.79z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M10 5.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0V6.75h-.75a.75.75 0 01-.75-.75zm-3.25 3.25a.75.75 0 01-.75-.75V6.75a.75.75 0 011.5 0v1.5a.75.75 0 01-.75.75zM15.75 8.5a.75.75 0 01-.75-.75V6.75a.75.75 0 011.5 0v1.5a.75.75 0 01-.75.75z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <Link
                      to="/profile/edit"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-semibold shadow-md transform hover:scale-105"
                    >
                      Edit Profile
                    </Link>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 pt-4 border-t border-gray-800">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.videosCount || 0}</div>
                    <div className="text-gray-400 text-sm">Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.tweetsCount || 0}</div>
                    <div className="text-gray-400 text-sm">Tweets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.subscribersCount || 0}</div>
                    <div className="text-gray-400 text-sm">Subscribers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.subscriptionsCount || 0}</div>
                    <div className="text-gray-400 text-sm">Subscriptions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats?.totalViews ? `${(stats.totalViews / 1000).toFixed(1)}K` : '0'}</div>
                    <div className="text-gray-400 text-sm">Total Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800 mb-6 overflow-x-auto justify-start">
          <Link
            to="/profile/videos"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors duration-200 relative group
              ${activeTab === 'videos' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}
            `}
          >
            Videos ({stats?.videosCount || 0})
            {activeTab === 'videos' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></span>
            )}
          </Link>
          <Link
            to="/profile/tweets"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors duration-200 relative group
              ${activeTab === 'tweets' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}
            `}
          >
            Tweets ({stats?.tweetsCount || 0})
            {activeTab === 'tweets' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></span>
            )}
          </Link>
          <Link
            to="/profile/subscribers"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors duration-200 relative group
              ${activeTab === 'subscribers' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}
            `}
          >
            Subscribers ({stats?.subscribersCount || 0})
            {activeTab === 'subscribers' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></span>
            )}
          </Link>
          <Link
            to="/profile/analytics"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors duration-200 relative group
              ${activeTab === 'analytics' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}
            `}
          >
            Analytics
            {activeTab === 'analytics' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></span>
            )}
          </Link>
          <Link
            to="/profile/requests"
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors duration-200 relative group
              ${activeTab === 'requests' ? 'text-blue-400' : 'text-gray-400 hover:text-white'}
            `}
          >
            Requests
            {activeTab === 'requests' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></span>
            )}
          </Link>
        </div>

        {/* Tab Content - Rendered as Routes */}
        <div className="pb-8">
          <Routes>
            <Route path="/videos" element={<ProfileVideos user={user} />} />
            <Route path="/tweets" element={<ProfileTweets user={user} />} />
            <Route path="/subscribers" element={<ProfileSubscribers user={user} />} />
            <Route path="/analytics" element={<ProfileAnalytics user={user} stats={stats} />} />
            <Route path="/requests" element={<MessageRequestsPanel />} />
            <Route path="*" element={<ProfileVideos user={user} />} /> {/* Fallback/Default route */}
          </Routes>
        </div>
      </div>
    </div>
  );
}