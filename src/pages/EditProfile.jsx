import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateUserProfile, updateUserAvatar, updateUserCoverImage } from "../api/user";
import Loader from "../components/Loader";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [editForm, setEditForm] = useState({
    fullname: '',
    email: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileResponse = await getMe();
      const userData = profileResponse.data?.data || profileResponse.data;
      
      setUser(userData);
      setEditForm({
        fullname: userData?.fullname || '',
        email: userData?.email || ''
      });
      
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError("Failed to load user profile. Please login.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await updateUserProfile(editForm);
      const updatedUser = response.data?.data || response.data;
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
      
      // Notify other components about the update
      localStorage.setItem('profileUpdated', Date.now().toString());
      window.dispatchEvent(new Event('profileUpdated'));
      
      // Navigate back to profile after 1.5 seconds
      setTimeout(() => {
        navigate('/profile/videos');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Avatar file size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      setError(null);
      setSuccess(null);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await updateUserAvatar(formData);
      const updatedUser = response.data?.data || response.data;
      setUser(updatedUser);
      setUploadProgress(100);
      setSuccess("Avatar updated successfully!");
      
      // Notify other components about the update
      localStorage.setItem('profileUpdated', Date.now().toString());
      window.dispatchEvent(new Event('profileUpdated'));
      
      // Clear progress after delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating avatar:', err);
      setError('Failed to update avatar. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB for cover images)
    if (file.size > 10 * 1024 * 1024) {
      setError('Cover image file size must be less than 10MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      setUploadingCover(true);
      setError(null);
      setSuccess(null);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const response = await updateUserCoverImage(formData);
      const updatedUser = response.data?.data || response.data;
      setUser(updatedUser);
      setUploadProgress(100);
      setSuccess("Cover image updated successfully!");
      
      // Notify other components about the update
      localStorage.setItem('profileUpdated', Date.now().toString());
      window.dispatchEvent(new Event('profileUpdated'));
      
      // Clear progress after delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating cover image:', err);
      setError('Failed to update cover image. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploadingCover(false);
    }
  };

  if (loading) return <Loader />;
  if (error && !user) return <div className="text-center text-red-500 p-8">{error}</div>;
  if (!user) return <div className="text-center text-gray-400 p-8">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
            <p className="text-gray-400">Update your profile information and media</p>
          </div>
          <button
            onClick={() => navigate('/profile/videos')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Back to Profile
          </button>
        </div>

        {/* Global Loading Indicator */}
        {(saving || uploadingAvatar || uploadingCover) && (
          <div className="fixed top-4 right-4 bg-blue-900 bg-opacity-90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">
              {saving && 'Saving profile...'}
              {uploadingAvatar && 'Uploading avatar...'}
              {uploadingCover && 'Uploading cover image...'}
            </span>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-900 border border-green-700 text-green-100 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="space-y-8">
          {/* Cover Image Section */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Cover Image</h2>
            <div className="relative h-48 bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg overflow-hidden">
              {user.coverImage ? (
                <img
                  src={user.coverImage}
                  alt="Cover"
                  className="w-full h-full object-contain bg-gray-800"
                  onError={(e) => {
                    console.warn('Cover image failed to load:', user.coverImage);
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback when no cover image or load fails */}
              <div 
                className={`w-full h-full bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center ${
                  user.coverImage ? 'hidden' : 'flex'
                }`}
                style={{ display: user.coverImage ? 'none' : 'flex' }}
              >
                <p className="text-white text-lg opacity-50">No cover image</p>
              </div>
              
              {/* Upload Progress Overlay */}
              {uploadingCover && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
                  <div className="text-white mb-4">
                    <svg className="animate-spin h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm">Uploading cover image...</p>
                  </div>
                  {uploadProgress > 0 && (
                    <div className="w-48 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {uploadProgress > 0 && (
                    <p className="text-white text-xs mt-2">{uploadProgress}%</p>
                  )}
                </div>
              )}
              
              {/* Upload Button Overlay */}
              {!uploadingCover && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium">
                    Change Cover Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="hidden"
                      disabled={uploadingCover}
                    />
                  </label>
                </div>
              )}
            </div>
            {uploadingCover && (
              <p className="text-blue-400 text-sm mt-2 animate-pulse">⬆️ Uploading cover image...</p>
            )}
          </div>

          {/* Avatar Section */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={user.avatar || 'https://via.placeholder.com/120x120/374151/9CA3AF?text=User'}
                  alt={user.fullname}
                  className="w-24 h-24 rounded-full border-4 border-gray-700 bg-gray-800"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/120x120/374151/9CA3AF?text=User';
                  }}
                />
                
                {/* Upload Progress Overlay */}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-75 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <svg className="animate-spin h-6 w-6 text-white mx-auto" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                )}
                
                {/* Hover Upload Icon */}
                {!uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer text-white">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <label className={`cursor-pointer px-4 py-2 rounded-lg transition-colors font-medium inline-flex items-center gap-2 ${
                    uploadingAvatar 
                      ? 'bg-blue-800 text-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                    {uploadingAvatar ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload New Avatar'
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                  
                  {uploadingAvatar && uploadProgress > 0 && (
                    <div className="flex-1 max-w-48">
                      <div className="bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-blue-400 text-xs mt-1">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm mt-2">
                  Recommended: Square image, at least 200x200 pixels (max 5MB)
                </p>
                
                {uploadingAvatar && (
                  <p className="text-blue-400 text-sm mt-1 animate-pulse">⬆️ Uploading avatar...</p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">Username cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullname}
                  onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your email address"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate('/profile/videos')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}