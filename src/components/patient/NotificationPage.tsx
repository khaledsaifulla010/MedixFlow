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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Your Notifications</h1>

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
