"use client";

import { useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  // Track whether the dropdown has been opened at least once (post-hydration)
  const [opened, setOpened] = useState(false);

  return (
    <DropdownMenu onOpenChange={(o) => o && setOpened(o)}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Ganti tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="gap-2 cursor-pointer"
        >
          <Sun className="h-3.5 w-3.5" />
          <span className="text-xs">Terang</span>
          {opened && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" data-theme-indicator="light" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="gap-2 cursor-pointer"
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="text-xs">Gelap</span>
          {opened && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" data-theme-indicator="dark" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="gap-2 cursor-pointer"
        >
          <Monitor className="h-3.5 w-3.5" />
          <span className="text-xs">Sistem</span>
          {opened && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" data-theme-indicator="system" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
