import * as signalR from "@microsoft/signalr";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import useAuth from "../Routing/AuthContext";
import { GetAccessToken } from "../services/apiClient";

const SignalRContext = createContext();
export const useSignalR = () => useContext(SignalRContext);

export const SignalRProvider = ({ children }) => {
  const [connection, setConnection] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const notificationListenersRef = useRef([]);
  const { user } = useAuth();

  // Retry strategy
  const retryDelays = [10_000, 60_000, 120_000, 300_000]; // 10s, 1m, 2m, 5m
  const retryIndexRef = useRef(0);
  const retryTimeoutRef = useRef(null);
  const isInitializingRef = useRef(false); // New: Guard against double initialization

  const registerNotificationListener = useCallback((listener) => {
    notificationListenersRef.current.push(listener);
    return () => {
      notificationListenersRef.current =
        notificationListenersRef.current.filter((l) => l !== listener);
    };
  }, []);

  const clearRetryTimeout = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const reconnectSignalR = async () => {
    if (connection) {
      await connection.stop();
    }
    await initializeSignalRConnection();
  };

  const scheduleReconnect = () => {
    if (retryIndexRef.current >= retryDelays.length) {
      return;
    }
    const delay = retryDelays[retryIndexRef.current];
    retryTimeoutRef.current = setTimeout(() => {
      retryIndexRef.current++;
      initializeSignalRConnection();
    }, delay);
  };

  const initializeSignalRConnection = async () => {
    if (isInitializingRef.current) return; // Prevent double init
    isInitializingRef.current = true;

    clearRetryTimeout();
    let token = GetAccessToken();
    if (!user?.UserId || !token) {
      console.warn("SignalR init skipped: Missing user.UserId or token");
      isInitializingRef.current = false;
      return;
    }
    const userSign = user?.UserSign || user?.UserId;

    // Stop existing connection if any
    if (connection) {
      await connection.stop();
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(
        `http://hwaceri5:8076/NotificationHub?UserId=${userSign}`,
        {
          accessTokenFactory: () => {
            const token = GetAccessToken();
            return token ? token.replace("Bearer ", "") : null;
          },
        }
      )
      .withAutomaticReconnect([0])
      .build();

    newConnection.onclose((err) => {
      console.error("SignalR connection closed:", err);
      isInitializingRef.current = false; // Reset on close
      scheduleReconnect();
    });

    try {
      await newConnection.start();
      console.log("SignalR connected successfully!");
      retryIndexRef.current = 0;
      setConnection(newConnection);
    } catch (err) {
      console.error("SignalR connection failed:", err);
      isInitializingRef.current = false;
      scheduleReconnect();
    }

    newConnection.on("ReceiveNotification", (notificationObj) => {
      const newNotification = {
        ...notificationObj,
        CreatedAt: new Date().toISOString(),
      };
      console.log("Received notification:", newNotification);

      setNotifications((prev) => [...prev, newNotification]);
      notificationListenersRef.current.forEach((listener) =>
        listener(newNotification)
      );
     toast(
  <div style={{ 
    display: "flex", 
    alignItems: "flex-start", 
    gap: "14px",
    padding: "4px"
  }}>
    {/* Animated Icon Container */}
    <div style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "44px",
      height: "44px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
      flexShrink: 0
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      {/* Small "New" Dot */}
      <span style={{
        position: "absolute",
        top: "-2px",
        right: "-2px",
        width: "10px",
        height: "10px",
        backgroundColor: "#10b981",
        borderRadius: "50%",
        border: "2px solid white"
      }} />
    </div>

    {/* Text Content */}
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <h4 style={{ 
        margin: 0, 
        fontSize: "15px", 
        fontWeight: "700", 
        color: "#1e293b",
        letterSpacing: "-0.01em"
      }}>
        {newNotification.Subject || "Notification"}
      </h4>
      <p style={{ 
        margin: 0, 
        fontSize: "13px", 
        color: "#64748b",
        fontWeight: "500" 
      }}>
        Sent by <span style={{ color: "#6366f1", fontWeight: "600" }}>{newNotification.FromUserName}</span>
      </p>
    </div>
  </div>,
  {
    position: "top-right",
    autoClose: 8000,
    style: {
      background: "rgba(255, 255, 255, 0.85)",
      backdropFilter: "blur(12px) saturate(180%)",
      WebkitBackdropFilter: "blur(12px) saturate(180%)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      padding: "16px",
      overflow: "hidden"
    },
    progressStyle: {
      background: "linear-gradient(to right, #6366f1, #a855f7)",
      height: "3px"
    }
  }
);
    });

    window.signalRConnection = newConnection;
    setConnection(newConnection);
    isInitializingRef.current = false; // Reset after setup
  };

  useEffect(() => {
    initializeSignalRConnection();
    return () => {
      clearRetryTimeout();
      if (connection) connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.UserId]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SignalRContext.Provider
      value={{
        connection,
        notifications,
        clearNotifications,
        user,
        registerNotificationListener,
        reconnectSignalR,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};