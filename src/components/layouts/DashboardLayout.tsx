
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
  Building2, 
  Settings,
  UserCircle,
  Home, 
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
import { useCampusContext } from '@/contexts/CampusContext';
import type { LegacyUserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: LegacyUserRole[];
  requiresCampus?: boolean; 
}

const baseNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresCampus: false },
  { href: '/attendance', label: 'Asistencia', icon: CalendarCheck, requiresCampus: true },
  { href: '/grades', label: 'Notas', icon: GraduationCap, requiresCampus: true },
  { href: '/reports', label: 'Informes', icon: FileText, requiresCampus: true },
  { href: '/students', label: 'Estudiantes', icon: Users, requiresCampus: true },
  { href: '/notifications', label: 'Notificaciones', icon: MessageSquare, requiresCampus: true },
  { href: '/campuses', label: 'Sedes', icon: Building2, roles: ['superuser'], requiresCampus: false },
  { href: '/anomaly-checker', label: 'Verificador IA', icon: Sparkles, roles: ['superuser'], requiresCampus: false }, 
];

// These are now only for UserNav, not sidebar
const profileAndSettingsNavItems: NavItem[] = [
    { href: '/profile', label: 'Perfil', icon: UserCircle, requiresCampus: false },
    { href: '/settings', label: 'Configuración', icon: Settings, requiresCampus: false },
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
  const { selectedCampus, isLoadingSelection: campusSelectionLoading } = useCampusContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isAuthLoading, router]);

  const isItemDisabled = (item: NavItem): boolean => {
    if (item.requiresCampus && !selectedCampus) return true;
    return false;
  }


  if (isAuthLoading || (!isAuthLoading && !currentUser) || campusSelectionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
         <p className="ml-3 text-muted-foreground">Cargando entorno...</p>
      </div>
    );
  }
  
  const sidebarTitle = selectedCampus ? selectedCampus.name : "EduAssist";
  const SidebarIconComponent = selectedCampus ? Building2 : School;


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col bg-background md:flex-row">
        <Sidebar
          collapsible="icon"
          className="border-r bg-sidebar text-sidebar-foreground"
          side="left"
        >
          <SidebarHeader className="p-4 flex items-center justify-between">
             <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden" aria-label={sidebarTitle}>
                <SidebarIconComponent className="h-7 w-7 text-sidebar-foreground" />
                <span className="font-semibold text-xl text-sidebar-foreground truncate max-w-[150px]">{sidebarTitle}</span>
             </Link>
             <Link href="/dashboard" className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center hidden w-full py-1.5" aria-label={sidebarTitle}>
                <SidebarIconComponent className="h-7 w-7 text-sidebar-foreground" />
             </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {baseNavItems.map((item) => {
                const roleMatch = !item.roles || item.roles.length === 0 || (currentUser && item.roles.includes(currentUser.role));
                if (!roleMatch) return null;

                const disabled = isItemDisabled(item);
                                
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={disabled ? "#" : item.href} passHref legacyBehavior>
                      <SidebarMenuButton
                        isActive={!disabled && (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)))}
                        tooltip={{ children: item.label, className: "whitespace-nowrap" }}
                        className={`justify-start ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-current={!disabled && pathname === item.href ? "page" : undefined}
                        disabled={disabled}
                        aria-disabled={disabled}
                        onClick={(e) => disabled && e.preventDefault()}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            {/* Profile and Settings items are removed from here as they are in UserNav */}
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-x-hidden">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <MobileNavToggle />
            <SidebarTrigger className="hidden md:inline-flex" />
            <div className="flex-1">
              {selectedCampus && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">{selectedCampus.name}</span>
                </div>
              )}
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
