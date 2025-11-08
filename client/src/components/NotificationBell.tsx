import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getSocket, isSocketEnabled } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: "match" | "leaderboard" | "team" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only set up socket listeners if socket.io is enabled and connected
    if (!isSocketEnabled()) {
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    // Listen for real-time notifications
    socket.on("leaderboard:update", (data: any) => {
      addNotification({
        id: Date.now().toString(),
        type: "leaderboard",
        title: "Leaderboard Updated",
        message: data.message || "The leaderboard has been updated",
        timestamp: new Date(),
        read: false,
      });
    });

    socket.on("match:update", (data: any) => {
      addNotification({
        id: Date.now().toString(),
        type: "match",
        title: "Match Update",
        message: data.message || "A match has been updated",
        timestamp: new Date(),
        read: false,
      });
    });

    socket.on("match:live", (data: any) => {
      addNotification({
        id: Date.now().toString(),
        type: "match",
        title: "Live Match",
        message: data.message || "A match is now live",
        timestamp: new Date(),
        read: false,
      });
    });

    return () => {
      if (socket) {
        socket.off("leaderboard:update");
        socket.off("match:update");
        socket.off("match:live");
      }
    };
  }, []);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Keep last 10
    setUnreadCount((prev) => prev + 1);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "match":
        return "⚔️";
      case "leaderboard":
        return "🏆";
      case "team":
        return "👥";
      default:
        return "🔔";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge className="h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <DropdownMenuItem
                    className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">{notification.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;

