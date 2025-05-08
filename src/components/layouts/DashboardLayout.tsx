"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  FileText,
  Users,
  Sparkles,
  PanelLeft,
  School,
} from 'lucide-react';
import AppLogo from '@/components/AppLogo';
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
} from '@/components/ui/sidebar'; // Assuming sidebar components are structured like this
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Asistencia', icon: CalendarCheck },
  { href: '/grades', label: 'Notas', icon: GraduationCap },
  { href: '/reports', label: 'Informes', icon: FileText },
  { href: '/students', label: 'Estudiantes', icon: Users },
  { href: '/anomaly-checker', label: 'Verificador IA', icon: Sparkles },
];

function MobileNavToggle() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={toggleSidebar}
      aria-label="Toggle Navigation"
    >
      <PanelLeft />
    </Button>
  );
}


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader className="p-4 flex items-center justify-between">
             <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <School className="h-7 w-7 text-primary" />
                <span className="font-semibold text-xl text-primary">EduAssist</span>
             </div>
             <div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center hidden w-full py-1.5">
                <School className="h-7 w-7 text-primary" />
             </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
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

        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
            <MobileNavToggle />
            <div className="flex-1">
              {/* Optional: Breadcrumbs or Page Title can go here */}
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
