import * as api from "../api/comment";

export const fetchForVideo = (videoId) => api.getVideoComments(videoId).then(r => r.data);
export const add = (videoId, data) => api.addComment(videoId, data).then(r => r.data);
