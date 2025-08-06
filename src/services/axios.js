import axios from "axios";

let ReactAppUrl = import.meta.env.VITE_API_URL;

// Create axios instance with the dynamic base URL
const instance = axios.create({
  baseURL: ReactAppUrl,
});

instance.defaults.headers.common["Content-Type"] = "application/json"; // Default content type (JSON)




instance.interceptors.request.use((config) => {
  // Detect if data is FormData
  if (config.data instanceof FormData) {
    config.headers["content-type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  // Attach authentication tokens
  const accessToken = localStorage.getItem("arc_accessToken");
  const refreshToken = sessionStorage.getItem("refreshToken");

  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    config.headers["x-refresh-token"] = refreshToken;
  }

  return config;
});



export default instance;
