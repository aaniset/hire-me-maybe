"use client";
import { buttonVariants } from "@/components/ui/button";
import TeamSwitcher from "@/components/team-switcher";
import { UserNav } from "@/components/user-nav";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";

export default function DashboardNav() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);
  if (isLoading) {
    return <Loader size="sm" />;
  }
  if (status === "unauthenticated") {
    return null;
  }
  return (
    <div className=" flex-col flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <TeamSwitcher session={session} />

          <div className="ml-auto flex items-center space-x-4">
            <nav className="flex items-center">
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
              >
                <div
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                    }),
                    "h-8 w-8 px-0 animate-buttonheartbeat"
                  )}
                >
                  <Icons.gitHub className="h-4 w-4" />
                  <span className="sr-only">GitHub</span>
                </div>
              </Link>
              <Link
                href={siteConfig.links.twitter}
                target="_blank"
                rel="noreferrer"
              >
                <div
                  className={cn(
                    buttonVariants({
                      variant: "ghost",
                    }),
                    "h-8 w-8 px-0"
                  )}
                >
                  <Icons.twitter className="h-3 w-3 fill-current" />
                  <span className="sr-only">Twitter</span>
                </div>
              </Link>
            </nav>
            <UserNav session={session} />
          </div>
        </div>
      </div>
    </div>
  );
}
