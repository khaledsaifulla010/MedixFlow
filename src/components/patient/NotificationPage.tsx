"use client";

import React, { useEffect, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface NotificationPageProps {
  patientId: string;
}

const NotificationPage: React.FC<NotificationPageProps> = ({ patientId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch(
          `/api/patient/notifications?patientId=${patientId}`
        );
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data: Notification[] = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    }
    fetchNotifications();
  }, [patientId]);

  const totalNotifications = notifications.length;

  return (
    <div className="p-6">
      {/* Notification Bell */}
      <div className="flex justify-end mb-6 relative">
        <Bell className="w-6 h-6" />
        {totalNotifications > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {totalNotifications}
          </span>
        )}
      </div>

      {/* Notifications List */}
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className="mb-4 border-l-4 border-green-500 shadow-sm"
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
      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet.</p>
      )}
    </div>
  );
};

export default NotificationPage;
