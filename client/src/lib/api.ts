import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4251",
  withCredentials: true, // send cookies for refresh token
});

export default api;
