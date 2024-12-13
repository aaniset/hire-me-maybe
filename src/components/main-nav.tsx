"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Library } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <Library className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/") ? "text-foreground" : "text-foreground/60"
          )}
        >
          Home
        </Link>
        <Link
          href="/#features"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/#features")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Features
        </Link>
        <Link
          href="/terms-and-conditions"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/docs/component/chart") ||
              pathname?.startsWith("/terms-and-conditions")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Terms and Conditions
        </Link>
        <Link
          href="/privacy-policy"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/privacy-policy")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Privacy Policy
        </Link>
        <Link
          href="/login"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/login" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Login
        </Link>
        {/* <Link
          href="/examples"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/examples")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Examples
        </Link>
        <Link
          href="/colors"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/colors")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Colors
        </Link> */}
      </nav>
    </div>
  );
}
