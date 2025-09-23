import * as api from "../api/playlist";

export const create = (data) => api.createPlaylist(data).then(r => r.data);
export const getUser = (userId) => api.getUserPlaylists(userId).then(r => r.data);
