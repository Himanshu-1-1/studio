'use client';

import * as React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  Briefcase,
  FileText,
  Home,
  LogOut,
  MessageSquare,
  PlusCircle,
  Search,
  Settings,
  User,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/icons/Logo';
import type { UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AppShellProps {
  children: React.ReactNode;
  userRole: UserRole;
}

const seekerNav = [
  { href: '/dashboard/find-jobs', icon: Search, label: 'Find Jobs', tooltip: 'Find Jobs' },
  { href: '/dashboard/applications', icon: FileText, label: 'Applications', tooltip: 'My Applications' },
  { href: '/dashboard/messages', icon: MessageSquare, label: 'Messages', tooltip: 'Messages' },
  { href: '/dashboard/profile', icon: User, label: 'Profile', tooltip: 'My Profile' },
];

const recruiterNav = [
    { href: '/dashboard/recruiter', icon: Briefcase, label: 'My Jobs', tooltip: 'My Jobs' },
    { href: '/dashboard/recruiter/jobs/new', icon: PlusCircle, label: 'Post a Job', tooltip: 'Post a New Job' },
    { href: '/dashboard/recruiter/applicants', icon: Users, label: 'Applicants', tooltip: 'All Applicants' },
    { href: '/dashboard/recruiter/messages', icon: MessageSquare, label: 'Messages', tooltip: 'Messages' },
    { href: '/dashboard/recruiter/profile', icon: User, label: 'Profile', tooltip: 'My Profile' },
];

const adminNav = [
    { href: '/dashboard/admin', icon: Home, label: 'Dashboard', tooltip: 'Dashboard' },
    { href: '/dashboard/admin/verifications', icon: ShieldCheck, label: 'Verifications', tooltip: 'Verifications' },
    { href: '/dashboard/admin/reports', icon: FileText, label: 'Reports', tooltip: 'Reports' },
    { href: '/dashboard/admin/users', icon: Users, label: 'Users', tooltip: 'Manage Users' },
];

export function AppShell({ children, userRole }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();
  const [navItems, setNavItems] = React.useState(seekerNav);

  React.useEffect(() => {
    switch (userRole) {
      case 'student':
      case 'graduate':
      case 'experienced':
        setNavItems(seekerNav);
        break;
      case 'recruiter':
        setNavItems(recruiterNav);
        break;
      case 'admin':
        setNavItems(adminNav);
        break;
      default:
        setNavItems(seekerNav); // Default to seeker if role is unknown
    }
  }, [userRole]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged out successfully.' });
      router.push('/');
    } catch (error) {
      console.error("Logout Error:", error);
      toast({ variant: 'destructive', title: 'Failed to log out.' });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{ children: item.tooltip }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: 'Settings' }}>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Logout' }}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 sticky top-0 z-30">
            <div className='md:hidden'>
                <SidebarTrigger/>
            </div>
            <div className="flex-1">
                {/* Potentially add breadcrumbs or page title here */}
            </div>
             <Avatar>
                <AvatarImage src={user?.photoURL || "https://github.com/shadcn.png"} alt="@shadcn" />
                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
