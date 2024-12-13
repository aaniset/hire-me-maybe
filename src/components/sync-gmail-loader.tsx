"use client";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import AnimatedCircularProgressBar from "@/components/magicui/animated-circular-progress-bar";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useLastSynced } from "@/hooks/last-synced";
import { toast } from "sonner";
import { Icons } from "@/components/icons";

export function SyncGmailLoader() {
  const [value, setValue] = React.useState(0);
  const [isFetching, setIsFetching] = React.useState(false);
  const router = useRouter();
  const { updateLastSynced } = useLastSynced();

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchEmails = async () => {
      if (isFetching) return;
      
      try {
        setIsFetching(true);
        // Start with initial progress
        setValue(10);

        const response = await axios.post("/api/fetch-emails", {
          signal: controller.signal
        });

        if (response.status === 200) {
          // Gradually increase progress to show activity
          const interval = setInterval(() => {
            setValue(prev => {
              if (prev >= 90) {
                clearInterval(interval);
                return 90;
              }
              return prev + 5;
            });
          }, 3000);

          // Update last synced timestamp
          await updateLastSynced();
          
          // Clear interval and complete the progress
          clearInterval(interval);
          setValue(100);

          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } catch (error) {
        console.error("Error fetching emails:", error);
        toast(
          <div className="flex gap-2 justify-center items-center">
            <Icons.gmail className="h-8 w-8" />
            Connect your Gmail and try again
          </div>
        );
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } finally {
        setIsFetching(false);
      }
    };

    fetchEmails();

    return () => {
      controller.abort();
    };
  }, [router, updateLastSynced]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="sm:max-w-[425px] p-8">
        <CardContent className="flex flex-col items-center justify-center gap-6">
          <AnimatedCircularProgressBar
            max={100}
            min={0}
            value={value}
            gaugePrimaryColor="rgb(79 70 229)"
            gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
            className="items-center"
          />
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Syncing Gmail</h2>
            <p className="text-muted-foreground">
              Reading and syncing your inbox for past 60 days. This may take a
              moment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
