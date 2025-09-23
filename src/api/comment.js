import API from "./axios";

export const commentAPI = {
  // Get video comments
  getVideoComments: (videoId) => API.get(`/comments/${videoId}`),
  
  // Add comment to video
  addComment: (videoId, data) => API.post(`/comments/${videoId}`, data),
  
  // Update comment
  updateComment: (commentId, data) => API.patch(`/comments/${commentId}`, data),
  
  // Delete comment
  deleteComment: (commentId) => API.delete(`/comments/${commentId}`),
};