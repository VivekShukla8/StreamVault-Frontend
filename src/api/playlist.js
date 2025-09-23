import API from "./axios";

export const playlistAPI = {
  // Create playlist
  createPlaylist: (data) => API.post("/playlists", data),
  
  // Get user playlists
  getUserPlaylists: (userId) => API.get(`/playlists/user/${userId}`),
  
  // Get playlist by ID
  getPlaylistById: (playlistId) => API.get(`/playlists/${playlistId}`),
  
  // Add video to playlist
  addVideoToPlaylist: (playlistId, videoId) => API.post(`/playlists/${playlistId}/videos/${videoId}`),
  
  // Remove video from playlist
  removeVideoFromPlaylist: (playlistId, videoId) => API.delete(`/playlists/${playlistId}/videos/${videoId}`),
  
  // Update playlist
  updatePlaylist: (playlistId, data) => API.put(`/playlists/${playlistId}`, data),
  
  // Delete playlist
  deletePlaylist: (playlistId) => API.delete(`/playlists/${playlistId}`),
};

// Legacy exports for backward compatibility
export const createPlaylist = (data) => API.post("/playlists", data);
export const getUserPlaylists = (userId) => API.get(`/playlists/user/${userId}`);
export const getPlaylist = (id) => API.get(`/playlists/${id}`);
export const addVideoToPlaylist = (playlistId, videoId) =>
  API.post(`/playlists/${playlistId}/videos/${videoId}`);
export const removeVideoFromPlaylist = (playlistId, videoId) =>
  API.delete(`/playlists/${playlistId}/videos/${videoId}`);
export const updatePlaylist = (id, data) => API.put(`/playlists/${id}`, data);
export const deletePlaylist = (id) => API.delete(`/playlists/${id}`);
