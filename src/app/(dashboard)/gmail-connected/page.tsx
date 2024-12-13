"use client";
import Loader from "@/components/loader";
import { SyncGmailLoader } from "@/components/sync-gmail-loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GmailConnectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);
  if (status === "unauthenticated") {
    return <Loader size="sm" />;
  }

  return <SyncGmailLoader />;
}
