import API from "./axios";

export const likeAPI = {
  // Toggle video like
  toggleVideoLike: (videoId) => API.post(`/likes/video/${videoId}/toggle`),
  
  // Toggle comment like
  toggleCommentLike: (commentId) => API.post(`/likes/comment/${commentId}/toggle`),
  
  // Toggle tweet like
  toggleTweetLike: (tweetId) => API.post(`/likes/tweet/${tweetId}/toggle`),
  
  // Check video like status
  getVideoLikeStatus: (videoId) => API.get(`/likes/video/${videoId}/status`),
  
  // Check comment like status
  getCommentLikeStatus: (commentId) => API.get(`/likes/comment/${commentId}/status`),
  
  // Get video like count (public)
  getVideoLikeCount: (videoId) => API.get(`/likes/video/${videoId}/count`),
  
  // Get user's liked videos
  getLikedVideos: (userId) => API.get(`/likes/videos/${userId}`),
};
