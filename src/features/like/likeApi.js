import API from "../../api/axios";

export const toggleVideoLike = (videoId) => API.post(`/likes/video/${videoId}/toggle`);
export const toggleCommentLike = (commentId) => API.post(`/likes/comment/${commentId}/toggle`);
export const getLikedVideos = (userId) => API.get(`/likes/videos/${userId}`);
