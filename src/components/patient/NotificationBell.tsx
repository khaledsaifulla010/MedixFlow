"use client";

import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface NotificationBellProps {
  patientId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ patientId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(
          `/api/patient/notifications?patientId=${patientId}`
        );
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data: Notification[] = await res.json();
        setNotifications(data);
        setUnreadCount(data.length);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    }
    fetchNotifications();
  }, [patientId]);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (!open && notifications.length > 0) {
      // Mark as read
      try {
        await fetch(`/api/patient/notifications/markRead`, {
          method: "POST",
          body: JSON.stringify({ ids: notifications.map((n) => n.id) }),
          headers: { "Content-Type": "application/json" },
        });
        setUnreadCount(0);
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle>Notifications</DialogTitle>
          <DialogClose asChild></DialogClose>
        </DialogHeader>

        {notifications.length === 0 && (
          <p className="text-gray-500 mt-2">No notifications yet.</p>
        )}

        <div className="mt-4 space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="border-l-4 border-green-500 shadow-sm"
            >
              <CardHeader className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <CardTitle>{notification.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-2">
                  {notification.description}
                </CardDescription>
                <p className="text-sm text-gray-500">{notification.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationBell;
