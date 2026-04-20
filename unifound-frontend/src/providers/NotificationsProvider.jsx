import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

const NotificationsContext = createContext({
  unreadCount: 0,
  refresh: () => {},
});

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

export const NotificationsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  // Initial fetch of unread count from REST (still useful on page load)
  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUnreadCount(data.data?.unreadCount ?? 0);
    } catch {
      /* silently fail */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh(); // fetch count once on mount/login

    if (!isAuthenticated) return;

    const token = localStorage.getItem("token");

    // Connect to WebSocket
    const socket = io(API_URL, {
      auth: { token },
    });

    socketRef.current = socket;

    // Increment badge in real-time when a new notification arrives
    socket.on("notification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, refresh]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
