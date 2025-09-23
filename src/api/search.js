import API from "./axios";

export const searchAPI = {
  // Search videos and channels
  searchVideosAndChannels: (query, params = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.type) queryParams.append('type', params.type); // 'video' or 'channel'
    
    return API.get(`/search?${queryParams.toString()}`);
  },
};