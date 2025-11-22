import { Search, Sun, Moon, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "./theme-provider";
import { Link } from "wouter";

interface HeaderProps {
  userName?: string;
  showSearch?: boolean;
}

export function Header({ userName = "Usuário", showSearch = true }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/treinamentos">
          <a className="flex items-center gap-2 hover-elevate rounded-md px-3 py-2" data-testid="link-home">
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-primary font-display">
                LMS
              </span>
              <span className="text-xs text-muted-foreground font-medium -mt-1">
                Priscilla Moreira
              </span>
            </div>
          </a>
        </Link>

        <div className="flex items-center gap-3">
          {showSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-64 pl-9"
                data-testid="input-search"
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            data-testid="button-notifications"
            className="rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 pl-2">
            <Avatar className="h-9 w-9" data-testid="avatar-user">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block text-sm font-medium" data-testid="text-username">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
