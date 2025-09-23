import API from "./axios";

// Authentication APIs
export const registerUser = (data) => API.post("/users/register", data);
export const loginUser = (data) => API.post("/users/login", data);
export const getMe = () => API.get("/users/current-user");
export const logout = () => API.post("/users/logout");
export const refreshToken = () => API.post("/users/refresh-token");

// Profile APIs
export const getUserProfile = (userId) => API.get(`/users/current-user`); // For now, get current user
export const getUserChannelProfile = (username) => API.get(`/users/c/${username}`);
export const updateUserProfile = (data) => API.patch("/users/update-details", data);
export const updateUserAvatar = (formData) => API.patch("/users/change-avatar", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const updateUserCoverImage = (formData) => API.patch("/users/change-coverImage", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const getWatchHistory = () => API.get("/users/watchHistory");
export const removeFromWatchHistory = (videoId) => API.delete(`/users/watchHistory/${videoId}`);
export const changePassword = (data) => API.post("/users/change-password", data);

// Get user's own channel statistics
export const getMyChannelStats = () => API.get("/users/my-stats");
