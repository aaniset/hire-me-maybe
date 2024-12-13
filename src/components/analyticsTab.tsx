"use client";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { TwoMonthBarGraph } from "./two-month-bar-graph";
import AvgJobApplications from "./avg-job-applications";
import ConversionRateGraph from "./conversion-rate";
import Loader from "./loader";
import { Button } from "@/components/ui/button";
import { Icons } from "./icons";

interface GraphData {
  twoMonthGraph: { date: string; applications: number }[];
  sevenDayAverage: { date: string; applications: number }[];
  totalApplications: number;
  appliedJobs: number;
  rejectedJobs: number;
  acceptedJobs: number;
  interviewingJobs: number;
  interviewConversionRate: number;
  acceptedConversionRate: number;
  rejectedConversionRate: number;
}

interface Application {
  status: string;
  date: string;
  // Add other properties as needed
}

interface DailyApplications {
  date: string;
  applications: number;
}

interface GraphData {
  twoMonthGraph: DailyApplications[];
  sevenDayAverage: DailyApplications[];
  totalApplications: number;
  appliedJobs: number;
  rejectedJobs: number;
  acceptedJobs: number;
  interviewingJobs: number;
  interviewConversionRate: number;
  acceptedConversionRate: number;
  rejectedConversionRate: number;
}

function processApplicationData(applications: Application[]): GraphData {
  const today = new Date();
  const twoMonthsAgo = new Date(
    today.getFullYear(),
    today.getMonth() - 2,
    today.getDate()
  );
  const sevenDaysAgo = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - 6
  );

  const twoMonthGraph: DailyApplications[] = [];
  const sevenDayAverage: DailyApplications[] = [];

  let currentDate = new Date(twoMonthsAgo);
  while (currentDate <= today) {
    const dateString = currentDate.toISOString().split("T")[0];
    const applicationsCount = applications.filter((app) =>
      app.date.startsWith(dateString)
    ).length;

    twoMonthGraph.push({ date: dateString, applications: applicationsCount });

    if (currentDate >= sevenDaysAgo) {
      sevenDayAverage.push({
        date: dateString,
        applications: applicationsCount,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalApplications = applications.length;
  const appliedJobs = applications.filter(
    (app) => app.status === "applied"
  ).length;
  const rejectedJobs = applications.filter(
    (app) => app.status === "rejected"
  ).length;
  const acceptedJobs = applications.filter(
    (app) => app.status === "accepted"
  ).length;
  const interviewingJobs = applications.filter(
    (app) => app.status === "interviewing"
  ).length;

  const interviewConversionRate = (interviewingJobs / totalApplications) * 100;
  const acceptedConversionRate = (acceptedJobs / totalApplications) * 100;
  const rejectedConversionRate = (rejectedJobs / totalApplications) * 100;

  return {
    twoMonthGraph,
    sevenDayAverage,
    totalApplications,
    appliedJobs,
    rejectedJobs,
    acceptedJobs,
    interviewingJobs,
    interviewConversionRate,
    acceptedConversionRate,
    rejectedConversionRate,
  };
}

export const Analytics: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const handleFindJobs = useCallback(() => {
    window.open(
      "https://www.linkedin.com/jobs/",
      "_blank",
      "noopener,noreferrer"
    );
  }, []);
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get("/api/fetch-applications");
        console.log("analytics applciaitons ", response.data.data);
        setApplications(response.data.data);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    if (applications.length > 0) {
      const processedData = processApplicationData(applications);
      setGraphData(processedData);
    }
  }, [applications]);
  const NoDataPlaceholder = () => (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <div className="border-2 border-dashed  border-input rounded-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          No Job Applications Found
        </h2>
        <p className="mb-6 ">
          Start tracking your job search journey by applying to jobs.
        </p>
        <Button onClick={handleFindJobs} variant={"outline"}>
          {" "}
          <Icons.LinkedIn /> Find Jobs to Apply
        </Button>
      </div>
    </div>
  );
  if (isLoading) {
    return <Loader size="lg" />;
  }
  if (!graphData) {
    return <NoDataPlaceholder />;
  }
  return (
    graphData && (
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="space-y-6 md:space-y-8">
          <div className=" rounded-lg shadow-md">
            <TwoMonthBarGraph data={graphData?.twoMonthGraph} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className=" rounded-lg shadow-md">
              <AvgJobApplications data={graphData?.sevenDayAverage} />
            </div>

            <div className="space-y-6">
              <div className=" rounded-lg shadow-md">
                <ConversionRateGraph
                  conversionRate={graphData?.interviewConversionRate}
                  data={graphData?.sevenDayAverage}
                  title="Interview Conversion Rate"
                  desc={`Your interview conversion rate is ${graphData?.interviewConversionRate.toFixed(
                    2
                  )}%. This indicates the percentage of your applications that resulted in an interview.`}
                />
              </div>
              <div className=" rounded-lg shadow-md">
                <ConversionRateGraph
                  conversionRate={graphData?.acceptedConversionRate}
                  data={graphData?.sevenDayAverage}
                  title="Job Offer Conversion Rate"
                  desc={`Your job offer conversion rate is ${graphData?.acceptedConversionRate.toFixed(
                    2
                  )}%. This metric reflects the percentage of applications that led to job offers.`}
                />
              </div>
              <div className=" rounded-lg shadow-md">
                <ConversionRateGraph
                  conversionRate={graphData?.rejectedConversionRate}
                  data={graphData?.sevenDayAverage}
                  title="Apply to Rejected Rate"
                  desc={`Your rejection conversion rate is ${graphData?.rejectedConversionRate.toFixed(
                    2
                  )}%. This percentage represents the applications that resulted in rejections.`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Analytics;
