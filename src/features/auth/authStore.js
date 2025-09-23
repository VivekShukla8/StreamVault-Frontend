// simple helper for reading/writing auth token (expandable)
export const authStore = {
  setToken: (t) => localStorage.setItem("accessToken", t),
  getToken: () => localStorage.getItem("accessToken"),
  clear: () => localStorage.removeItem("accessToken"),
};
