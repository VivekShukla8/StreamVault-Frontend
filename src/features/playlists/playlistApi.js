import API from "../../api/axios";

export const create = (data) => API.post("/playlists", data);
export const getByUser = (userId) => API.get(`/playlists/user/${userId}`);
export const getById = (id) => API.get(`/playlists/${id}`);
export const addVideo = (playlistId, videoId) => API.post(`/playlists/${playlistId}/videos/${videoId}`);
export const removeVideo = (playlistId, videoId) => API.delete(`/playlists/${playlistId}/videos/${videoId}`);
