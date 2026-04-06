import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ,
  withCredentials: true,
  timeout: 10000,
});

/* 🔐 ADD TOKEN */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* 🔐 HANDLE EXPIRED TOKEN */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;