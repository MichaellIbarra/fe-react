
// @ts-nocheck
"use client";

import * as React from 'react'; 
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  FileText,
  Users,
  Sparkles,
  PanelLeft,
  School,
  Loader2,
  MessageSquare,
  BarChart3, // Added BarChart3 for Reports
} from 'lucide-react';
import { UserNav } from '@/components/UserNav';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar'; 
import { useAuth } from '@/contexts/AuthContext';
import type { LegacyUserRole } from '@/types'; 

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: LegacyUserRole[]; 
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Asistencia', icon: CalendarCheck },
  { href: '/grades', label: 'Notas', icon: GraduationCap },
  { href: '/reports', label: 'Informes', icon: FileText },
  { href: '/students', label: 'Estudiantes', icon: Users },
  { href: '/notifications', label: 'Notificaciones', icon: MessageSquare }, 
  { href: '/anomaly-checker', label: 'Verificador IA', icon: Sparkles, roles: ['superuser'] },
];

function MobileNavToggle() {
  const { setOpenMobile, isMobile } = useSidebar(); 
  
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
        <Button variant="ghost" size="icon" className="md:hidden" disabled aria-label="Toggle Navigation">
         <PanelLeft />
        </Button>
    );
  }
  
  if (!isMobile) {
    return null;
  }
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setOpenMobile(true)} 
      aria-label="Toggle Navigation"
    >
      <PanelLeft />
    </Button>
  );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentUser, isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isAuthLoading, router]);

  const accessibleNavItems = navItems.filter(item => {
    if (!item.roles || item.roles.length === 0) {
      return true; 
    }
    return currentUser && item.roles.includes(currentUser.role);
  });

  if (isAuthLoading || (!isAuthLoading && !currentUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <Sidebar 
          collapsible="icon" 
          className="border-r bg-sidebar text-sidebar-foreground"
          side="left"
        >
          <SidebarHeader className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <School className="h-7 w-7 text-sidebar-foreground" />
                <span className="font-semibold text-xl text-sidebar-foreground">EduAssist</span>
             </div>
             <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center hidden w-full py-1.5">
                <School className="h-7 w-7 text-sidebar-foreground" />
             </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {accessibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                      tooltip={{ children: item.label, className: "whitespace-nowrap" }}
                      className="justify-start"
                      aria-current={pathname === item.href ? "page" : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-x-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <MobileNavToggle />
            <SidebarTrigger className="hidden md:inline-flex" /> 
            <div className="flex-1">
            </div>
            <UserNav />
          </header>
          <SidebarInset>
            <main className="flex-1 p-4 md:p-6 lg:p-8">
                {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}

