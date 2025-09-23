import React, { createContext, useEffect, useState, useContext } from "react";
import { apiGetMe, apiLogin, apiLogout } from "./authApi";
import API from "../../api/axios";

export const AuthContext = createContext();

// Custom hook for easier use in components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load logged-in user info
  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await apiGetMe();
      setUser(res?.data?.data || null);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  // Login function
  const login = async (creds) => {
    try {
      const res = await apiLogin(creds);
      if(res.ok){
        console.log("login success");
      }else{
        console.error("Login error:");
      }
      const token = res?.data?.data?.accessToken;
      console.log("response",res);
      if (token) {
        localStorage.setItem("accessToken", token);
        await loadUser();
      } else {
        throw new Error("Login failed: no access token");
      }
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  // Register function with file upload support
  const register = async (data) => {
    try {
      // Create FormData object for file uploads
      const formData = new FormData();
      
      // Append text fields
      formData.append("fullname", data.fullname);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      
      // Append file fields if they exist
      if (data.avatar) {
        formData.append("avatar", data.avatar);
      }
      
      if (data.coverImage) {
        formData.append("coverImage", data.coverImage);
      }
      
      // Make API call with FormData
      const res = await API.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      console.log("res", res);
      // const token = res?.data?.data?.accessToken;
      // console.log("ttookkeenn",token);
      // if (token) {
      //   localStorage.setItem("accessToken", token);
      //   await loadUser();
      // } else {
      //   throw new Error("Registration failed: no access token");
      // }
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}