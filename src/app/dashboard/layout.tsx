'use client';

import { AppShell } from "@/components/shared/AppShell";
import { useUser } from "@/firebase";
import { UserRole } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  // In a real app, you would fetch the user's role from a session or firestore
  const userRole: UserRole = (user?.role as UserRole) || 'student';

  return <AppShell userRole={userRole}>{children}</AppShell>;
}
