
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User as UserIcon, Users, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { currentUser, switchUserProfile, availableUsers, logout, isAuthLoading } = useAuth();
  const router = useRouter();

  if (isAuthLoading) {
    return <Button variant="ghost" className="relative h-10 w-10 rounded-full"><Loader2 className="h-5 w-5 animate-spin" /></Button>;
  }

  if (!currentUser) {
    return (
       <Button variant="outline" onClick={() => router.push('/login')}>Iniciar Sesión</Button>
    );
  }

  const handleRoleChange = (userId: string) => {
    switchUserProfile(userId);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border">
            <AvatarImage 
              src={`https://picsum.photos/seed/${currentUser.avatarSeed || currentUser.email}/40/40`} 
              alt={currentUser.name}
              data-ai-hint="user avatar" 
            />
            <AvatarFallback>
              {currentUser.role === 'superuser' ? <ShieldCheck className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email} ({currentUser.role === 'superuser' ? 'Superusuario' : 'Usuario Normal'})
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5">Cambiar Perfil (Demo)</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={currentUser.id} onValueChange={handleRoleChange}>
            {availableUsers.map(user => (
              <DropdownMenuRadioItem key={user.id} value={user.id}>
                 {user.role === 'superuser' ? <ShieldCheck className="mr-2 h-4 w-4" /> : <UserIcon className="mr-2 h-4 w-4" />}
                {user.name} ({user.role === 'superuser' ? 'Super' : 'Normal'})
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
