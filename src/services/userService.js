import * as api from "../api/user";

export const register = (data) => api.registerUser(data).then(r => r.data);
export const login = (data) => api.loginUser(data).then(r => r.data);
export const me = () => api.getMe().then(r => r.data);
