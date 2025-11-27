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
  Search,
  Settings,
  User,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons/Logo';
import type { UserRole } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import Link from 'next/link';

interface AppShellProps {
  children: React.ReactNode;
  userRole: UserRole;
}

const seekerNav = [
  { href: '/dashboard/seeker', icon: Search, label: 'Find Jobs', tooltip: 'Find Jobs' },
  { href: '/dashboard/seeker/applications', icon: FileText, label: 'Applications', tooltip: 'My Applications' },
  { href: '/dashboard/seeker/messages', icon: MessageSquare, label: 'Messages', tooltip: 'Messages' },
  { href: '/dashboard/seeker/profile', icon: User, label: 'Profile', tooltip: 'My Profile' },
];

const recruiterNav = [
    { href: '/dashboard/recruiter', icon: Briefcase, label: 'Jobs', tooltip: 'My Jobs' },
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
        setNavItems([]);
    }
  }, [userRole]);

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
                    isActive={pathname === item.href}
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
               <Link href="/">
                <SidebarMenuButton tooltip={{ children: 'Logout' }}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
              </Link>
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
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
