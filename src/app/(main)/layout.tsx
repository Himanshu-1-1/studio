import { AppShell } from "@/components/shared/AppShell";
import { UserRole } from "@/lib/types";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, you would fetch the user's role from a session
  const userRole: UserRole = "student"; // Mocking user role

  return <AppShell userRole={userRole}>{children}</AppShell>;
}
