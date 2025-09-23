import API from "./axios";

export const videoAPI = {
  // Get all videos with pagination and filters
  getAllVideos: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortType) queryParams.append('sortType', params.sortType);
    if (params.query) queryParams.append('query', params.query);
    if (params.userId) queryParams.append('userId', params.userId);
    
    return API.get(`/videos?${queryParams.toString()}`);
  },
  
  // Get single video by ID
  getVideoById: (id) => API.get(`/videos/${id}`),
  
  // Upload new video
  uploadVideo: (formData) => API.post("/videos", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Update video details
  updateVideo: (id, data) => API.patch(`/videos/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Delete video
  deleteVideo: (id) => API.delete(`/videos/${id}`),
  
  // Toggle publish status
  togglePublishStatus: (id) => API.patch(`/videos/${id}/toggle`),
  
  // Increment video views
  incrementViews: (id) => API.patch(`/videos/${id}/views`),
};

// Legacy exports for backward compatibility
export const fetchVideos = (params) => API.get("/videos", { params });
export const fetchVideoById = (id) => API.get(`/videos/${id}`);
export const uploadVideo = (formData) =>
  API.post("/videos", formData, { headers: { "Content-Type": "multipart/form-data" }});
export const updateVideo = (id, formData) =>
  API.patch(`/videos/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" }});
export const deleteVideo = (id) => API.delete(`/videos/${id}`);
