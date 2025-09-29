import API from "../../api/axios";

export const fetchComments = (videoId) => API.get(`/comments/${videoId}`);
export const createComment = (videoId, data) => API.post(`/comments/${videoId}`, data);
export const editComment = (commentId, data) => API.patch(`/comments/${commentId}`, data);
export const removeComment = (commentId) => API.delete(`/comments/${commentId}`);
    