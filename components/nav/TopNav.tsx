"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Bell, Moon, Sun, Sparkles, User, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { NavLink } from "./NavLink";
import { NavDropdown } from "./NavDropdown";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { cn } from "@/lib/utils";

export function TopNav() {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (u) {
        const name =
          (u.user_metadata as any)?.full_name ||
          u.email?.split("@")[0] ||
          null;
        setUserName(name);
      }
    };
    fetchUser();
  }, [supabase]);

  const toggleTheme = () => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      router.push("/login");
    }
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="hidden text-lg font-semibold tracking-tight sm:inline-block">
              FinanceAI
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavDropdown
            label="Wallet"
            items={[
              { label: "Accounts", href: "/accounts" },
              { label: "Income", href: "/income" },
              { label: "Expenses", href: "/expenses" },
              { label: "Loans", href: "/loans" },
              { label: "Emergency Fund", href: "/emergency-fund" },
              { label: "Credit Cards", href: "/credit-cards" },
            ]}
          />
          <NavDropdown
            label="Investments"
            baseHref="/investments"
            items={[
              { label: "Stock", href: "/investments" },
            ]}
          />
          <NavLink href="/goals">Goals</NavLink>
          <NavLink href="/budget">Budget</NavLink>
          <NavLink href="/calculators">Financial Calculators</NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Profile menu with dropdown */}
          <div className="relative hidden sm:flex items-center gap-2 pl-2 border-l">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              onClick={() => setProfileOpen((o) => !o)}
              aria-label="Open profile menu"
            >
              <User className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-10 w-52 rounded-md border bg-popover text-popover-foreground shadow-lg z-50"
                >
                  <div className="py-1 text-sm">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted"
                      onClick={() => {
                        setProfileOpen(false);
                        // notifications placeholder
                      }}
                    >
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted"
                      onClick={() => {
                        toggleTheme();
                        setProfileOpen(false);
                      }}
                    >
                      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                    </button>
                    <Link
                      href="/settings"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-16 z-40 border-b bg-background/95 backdrop-blur-md md:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
              <MobileNavDrawer onNavigate={() => setMobileOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
