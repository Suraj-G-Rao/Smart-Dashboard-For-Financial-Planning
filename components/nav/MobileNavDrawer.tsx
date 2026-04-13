"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  {
    label: "Wallet",
    children: [
      { label: "Accounts", href: "/accounts" },
      { label: "Income", href: "/income" },
      { label: "Expenses", href: "/expenses" },
      { label: "Loans", href: "/loans" },
      { label: "Emergency Fund", href: "/emergency-fund" },
      { label: "Credit Cards", href: "/credit-cards" },
    ],
  },
  {
    label: "Investments",
    href: "/investments",
    children: [
      { label: "Stock", href: "/investments" },
    ],
  },
  { label: "Goals", href: "/goals" },
  { label: "Budget", href: "/budget" },
  { label: "Financial Calculators", href: "/calculators" },
];

interface MobileNavDrawerProps {
  onNavigate?: () => void;
}

export function MobileNavDrawer({ onNavigate }: MobileNavDrawerProps) {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-1 mt-4"
    >
      {mobileNavItems.map((item) => {
        const isActive =
          (item.href && (pathname === item.href || pathname?.startsWith(item.href + "/"))) ||
          item.children?.some((c) => pathname === c.href || pathname?.startsWith(c.href + "/"));

        return (
          <div key={item.label} className="space-y-1">
            {item.href ? (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                asChild
                onClick={onNavigate}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ) : (
              <div className={cn(
                "px-3 py-2 text-base font-medium",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </div>
            )}
            {item.children && (
              <div className="ml-4 flex flex-col gap-1">
                {item.children.map((child) => {
                  const childActive =
                    pathname === child.href || pathname?.startsWith(child.href + "/");
                  return (
                    <Button
                      key={child.href}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm",
                        childActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      asChild
                      onClick={onNavigate}
                    >
                      <Link href={child.href}>{child.label}</Link>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </motion.nav>
  );
}
