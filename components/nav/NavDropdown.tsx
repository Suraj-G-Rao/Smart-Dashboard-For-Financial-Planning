"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  href: string;
}

interface NavDropdownProps {
  label: string;
  baseHref?: string;
  items: DropdownItem[];
}

export function NavDropdown({ label, baseHref, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive =
    (!!baseHref && (pathname === baseHref || pathname?.startsWith(baseHref + "/"))) ||
    items.some((item) => pathname === item.href || pathname?.startsWith(item.href + "/"));

  return (
    <div
      className="relative inline-flex h-full items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {baseHref ? (
        <Link
          href={baseHref}
          className={cn(
            "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
            "hover:text-primary",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <span>{label}</span>
          <ChevronDown className="h-4 w-4" />
        </Link>
      ) : (
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
            "hover:text-primary",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <span>{label}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      )}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 min-w-[180px] rounded-md border bg-popover py-1 shadow-lg z-40"
          >
            {items.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
