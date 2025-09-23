import API from "./axios";

export const channelAPI = {
  // Get channel info
  getChannel: (channelId) => API.get(`/channels/${channelId}`),
  
  // Get channel videos
  getChannelVideos: (channelId) => API.get(`/channels/${channelId}/videos`),
  
  // Get user channel profile
  getUserChannelProfile: (username) => API.get(`/users/c/${username}`),
  
  // Get user tweets (if authenticated and viewing own channel)
  getUserTweets: () => API.get(`/tweets/my-tweets`),
};
