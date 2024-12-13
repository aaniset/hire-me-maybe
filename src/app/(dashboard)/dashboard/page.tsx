"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomKanban } from "@/components/kanbanBoardFramer";
import { EmailTableBetav2 } from "@/components/email-table-betav2";
import Analytics from "@/components/analyticsTab";
import Settings from "@/components/settings";
import FloatingBadge from "@/components/floating-badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader from "@/components/loader";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailFetching, setIsEmailFetching] = useState(false);

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

  const fetchEmails = async () => {
    setIsEmailFetching(true);
    try {
      const response = await fetch("/api/fetch-emails", { method: "POST" });
      const data = await response.json();
      
      if (data.jobId) {
        // Poll for job completion
        const pollInterval = setInterval(async () => {
          const statusResponse = await fetch(`/api/job-status?jobId=${data.jobId}`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === "COMPLETED") {
            clearInterval(pollInterval);
            setIsEmailFetching(false);
            toast.success("Emails fetched successfully", {
              description: "Your emails have been updated.",
            });
          } else if (statusData.status === "FAILED") {
            clearInterval(pollInterval);
            setIsEmailFetching(false);
            toast.error("Error fetching emails", {
              description: "Please try again later.",
            });
          }
        }, 5000); // Poll every 5 seconds
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      setIsEmailFetching(false);
      toast.error("Error fetching emails", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <>
      <div className="flex-col flex">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2"></div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Applications</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="emails">Email Data</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <CustomKanban />
            </TabsContent>
            <TabsContent value="emails" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Email Data</h3>
                <button
                  onClick={fetchEmails}
                  disabled={isEmailFetching}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isEmailFetching ? "Fetching..." : "Fetch Emails"}
                </button>
              </div>
              <EmailTableBetav2 />
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Analytics />
            </TabsContent>
            <TabsContent value="settings" className="space-y-4">
              <Settings session={session} />
            </TabsContent>
          </Tabs>
        </div>
        <FloatingBadge />
      </div>
    </>
  );
}
