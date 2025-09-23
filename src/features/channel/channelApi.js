import API from "../../api/axios";

export const getChannelStats = () => API.get("/channel/stats");
export const getChannelVideos = () => API.get("/channel/videos");
export const getChannelById = (id) => API.get(`/users/${id}`); // depends on backend
