import API from "../../api/axios";

// Note: Register function is now handled directly in AuthContext.jsx to support file uploads
export const apiLogin = (data) => API.post("/users/login", data);
export const apiGetMe = () => API.get("/users/current-user");
export const apiLogout = () => API.post("/users/logout");