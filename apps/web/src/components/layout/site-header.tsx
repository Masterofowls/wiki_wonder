"use client";

import { Bookmark, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { WikiSearch } from "@/components/wiki/wiki-search";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            WikiWonder
          </Link>
          <nav className="hidden items-center gap-3 text-sm text-muted-foreground md:flex" aria-label="Main">
            <Link href="/wiki" className="hover:text-foreground">
              Browse
            </Link>
            <Link href="/bookmarks" className="hover:text-foreground">
              Bookmarks
            </Link>
            <Link href="/import" className="hover:text-foreground">
              Import
            </Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center gap-2 sm:max-w-md md:max-w-lg">
          <div className="flex-1">
            <WikiSearch />
          </div>
          <Button variant="ghost" size="icon" asChild aria-label="Bookmarks">
            <Link href="/bookmarks">
              <Bookmark className="h-4 w-4" />
            </Link>
          </Button>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
