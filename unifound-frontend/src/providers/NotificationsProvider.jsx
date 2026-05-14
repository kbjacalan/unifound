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
  decrementUnread: () => {},
  resetUnread: () => {},
  newNotifListenerRef: null,
});

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

export const NotificationsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);
  // Pages can register a callback here to receive live-pushed notifications
  const newNotifListenerRef = useRef(null);

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

  /** Decrement badge by `by` (default 1) — call when a notification is read/deleted */
  const decrementUnread = useCallback((by = 1) => {
    setUnreadCount((prev) => Math.max(0, prev - by));
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    refresh();

    if (!isAuthenticated) return;

    const token = localStorage.getItem("token");
    const socket = io(API_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("notification", (notif) => {
      // Always bump the bell badge
      setUnreadCount((prev) => prev + 1);
      if (typeof newNotifListenerRef.current === "function") {
        newNotifListenerRef.current(notif);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, refresh]);

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount,
        refresh,
        decrementUnread,
        resetUnread,
        newNotifListenerRef,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
