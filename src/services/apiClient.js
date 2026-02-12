// services/apiClient.js
import axios from "axios";
import * as signalR from "@microsoft/signalr";

import { config } from "../config/environment";
const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");
const apiClient = axios.create({
  baseURL: config.api.baseURL,
  // timeout: config.api.timeout,
  // headers: {
    // "Content-Type": "application/json",
    // Authorization: `${getAccessToken()}`,
    // RefreshToken: `${getRefreshToken()}`,
    // "X-App-Version": config.app.version,
    // "X-Environment": config.app.environment,
  // },
});

apiClient.interceptors.request.use((req) => {
  const token = getAccessToken();
  if (token) {
    req.headers.Authorization = `${token}`;
  }
  return req;
});
// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `${token}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshResponse = await axios.post(
          `${config.api.baseURL}/Login/refresh-token`,
          { RefreshToken: getRefreshToken() },
          { headers: { "Content-Type": "application/json" } }
        );
        const newAccessToken = refreshResponse.headers["authorization"];
        const newRefreshToken = refreshResponse.headers["x-refresh-token"];
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        apiClient.defaults.headers.Authorization = `${newAccessToken}`;
        originalRequest.headers.Authorization = `${newAccessToken}`;
        processQueue(null, newAccessToken);
        if (
  window.signalRConnection &&
  window.signalRConnection.state ===
    signalR.HubConnectionState.Connected
) {
  try {
    if (window.reconnectSignalR) {
      await window.reconnectSignalR();
    }
  } catch (err) {
    console.error("Error restarting SignalR connection:", err);
  }
}

        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        window.location.href = "/"; // redirect to login if refresh fails
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Optional: Log requests & responses in development
if (config.isDevelopment && config.app.debug) {
  apiClient.interceptors.request.use(
    (req) => {
      // console.debug("Request:", req);
      // console.log("Request:", req);

      return req;
    },
    (err) => Promise.reject(err)
  );

  apiClient.interceptors.response.use(
    (res) => {
      // console.debug("Response:", res);
      // console.log("Response:", res);

      return res;
    },
    (err) => Promise.reject(err)
  );
}

export default apiClient;
export const GetAccessToken = () => localStorage.getItem("accessToken");
export const GetRefreshToken = () => localStorage.getItem("refreshToken");
