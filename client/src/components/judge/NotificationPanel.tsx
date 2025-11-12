import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, X, CheckCircle, Clock, AlertCircle, Info } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Notification {
  id: string;
  type: "match" | "lineup" | "reminder" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationPanel = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}: NotificationPanelProps) => {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "match":
        return <CheckCircle className="h-4 w-4 text-[#0077CC]" />;
      case "lineup":
        return <Clock className="h-4 w-4 text-[#FACC15]" />;
      case "reminder":
        return <AlertCircle className="h-4 w-4 text-[#E11D48]" />;
      default:
        return <Info className="h-4 w-4 text-[#4A4A4A]" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-[#E0E0E0] relative">
          <Bell className="h-4 w-4 mr-2" />
          Notifications
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#E11D48] text-white text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-white" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#1A1A1A] text-lg">Notifications</CardTitle>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs text-[#4A4A4A] h-auto p-0"
                >
                  Clear all
                </Button>
              )}
            </div>
            <CardDescription className="text-[#4A4A4A] text-xs">
              {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-[#4A4A4A] text-sm">
                No notifications
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="divide-y divide-[#E0E0E0]">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-[#F5F7FA] cursor-pointer transition-colors ${
                        !notification.read ? "bg-[#0077CC]/5" : ""
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          onMarkAsRead(notification.id);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-semibold text-sm text-[#1A1A1A]">
                              {notification.title}
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-[#0077CC] flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          <div className="text-sm text-[#4A4A4A] mb-1">
                            {notification.message}
                          </div>
                          <div className="text-xs text-[#4A4A4A]">
                            {format(new Date(notification.timestamp), "MMM dd, HH:mm")}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

