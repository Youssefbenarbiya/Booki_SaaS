// app/agency/dashboard/layout.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/auth";
import NotAllowed from "@/components/not-allowed";
import { ReactNode } from "react";
import { getAgencyNotifications } from "@/actions/agency/notificationActions";
import NotificationCenter from "@/components/dashboard/agency/NotificationCenter";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = {
  title: "Agency Dashboard",
  description: "Admin dashboard for managing the application",
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    (session.user.role !== "agency owner" && session.user.role !== "employee")
  ) {
    return <NotAllowed />;
  }

  // Get initial notifications
  const { notifications, unreadCount } = await getAgencyNotifications(5);
  const typedNotifications = notifications.map((notification) => ({
    ...notification,
    type: (["error", "info", "success", "warning"].includes(notification.type)
      ? notification.type
      : "info") as "error" | "info" | "success" | "warning",
    userId:
      typeof notification.userId === "string"
        ? Number(notification.userId)
        : notification.userId,
  }));

  return (
    <>
      <header className="bg-white shadow z-30 relative">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            {/* Left side content if needed */}
          </div>
          <div className="flex items-center">
            <NotificationCenter
              initialNotifications={typedNotifications}
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </header>
      <main className="p-6 overflow-y-auto max-h-[calc(100vh-64px)]">
        {children}
      </main>
    </>
  );
}
