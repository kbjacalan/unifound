import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthProvider";

const NotificationsContext = createContext({
  unreadCount: 0,
  refresh: () => {},
});

const API_URL = "http://localhost:5000";

export const NotificationsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

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
      if (res.ok) {
        setUnreadCount(data.data?.unreadCount ?? 0);
      }
    } catch {
      /* silently fail */
    }
  }, [isAuthenticated]);

  // Poll every 30 seconds while authenticated
  useEffect(() => {
    refresh();
    if (!isAuthenticated) return;
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refresh]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);
