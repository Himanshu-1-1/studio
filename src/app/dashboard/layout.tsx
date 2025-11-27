'use client';

import { AppShell } from "@/components/shared/AppShell";
import { useUser } from "@/firebase";
import { UserRole } from "@/lib/types";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user object is resolved
    }
    
    if (!user) {
        router.replace('/login');
        return;
    }

    const fetchUserRole = async () => {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userRole = userDocSnap.data()?.role as UserRole;
            setRole(userRole);
        } else {
            // Handle case where user exists in Auth but not in Firestore
            router.replace('/login');
        }
        setIsRoleLoading(false);
    };

    fetchUserRole();

  }, [user, isUserLoading, firestore, router]);


  if (isUserLoading || isRoleLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="space-y-4 text-center">
                 <p className="text-muted-foreground">Loading your dashboard...</p>
                 <Skeleton className="h-96 w-96" />
            </div>
        </div>
    )
  }

  return <AppShell userRole={role || 'student'}>{children}</AppShell>;
}
