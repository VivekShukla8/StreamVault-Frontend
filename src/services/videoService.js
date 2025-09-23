import * as api from "../api/video";

export const listVideos = (params) => api.fetchVideos(params).then(r => r.data);
export const getVideo = (id) => api.fetchVideoById(id).then(r => r.data);
export const uploadVideo = (formData) => api.uploadVideo(formData).then(r => r.data);
