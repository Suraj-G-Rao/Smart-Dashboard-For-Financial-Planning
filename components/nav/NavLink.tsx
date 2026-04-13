"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative inline-flex items-center px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
        "after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-200",
        isActive && "text-primary after:scale-x-100",
        !isActive && "text-muted-foreground hover:after:scale-x-100",
        className
      )}
    >
      {children}
    </Link>
  );
}
