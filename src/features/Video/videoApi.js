import API from "../../api/axios";

export const getAll = (params) => API.get("/videos", { params });
export const getById = (id) => API.get(`/videos/${id}`);
export const upload = (formData) => API.post("/videos", formData, { headers: { "Content-Type": "multipart/form-data" }});
export const update = (id, formData) => API.patch(`/videos/${id}`, formData);
export const remove = (id) => API.delete(`/videos/${id}`);
