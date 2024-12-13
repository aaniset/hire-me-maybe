
"use client";

import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  Label,
  Rectangle,
  ReferenceLine,
  XAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ApplicationData {
  date: string;
  applications: number;
}

interface AvgJobApplicationsProps {
  data: ApplicationData[];
}

export default function AvgJobApplications({ data }: AvgJobApplicationsProps) {
  const totalApplications = useMemo(
    () => data.reduce((sum, day) => sum + day.applications, 0),
    [data]
  );

  const averageApplications = useMemo(
    () => Math.round(totalApplications / data.length),
    [totalApplications, data]
  );

  const todayApplications = useMemo(
    () => data[data.length - 1]?.applications || 0,
    [data]
  );

  return (
    <Card className="">
      <CardHeader className="space-y-0 pb-2">
        <CardDescription>Today</CardDescription>
        <CardTitle className="text-4xl tabular-nums">
          {todayApplications}{" "}
          <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
            Applications
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            applications: {
              label: "Applications",
              color: "hsl(var(--chart-1))",
            },
          }}
        >
          <BarChart
            accessibilityLayer
            margin={{
              left: -4,
              right: -4,
            }}
            data={data}
          >
            <Bar
              dataKey="applications"
              fill="var(--color-applications)"
              radius={5}
              fillOpacity={0.6}
              activeBar={<Rectangle fillOpacity={0.8} />}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  weekday: "short",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
              }
              cursor={false}
            />
            <ReferenceLine
              y={averageApplications}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeWidth={1}
            >
              <Label
                position="insideBottomLeft"
                value="Average Applications"
                offset={10}
                fill="hsl(var(--foreground))"
              />
              <Label
                position="insideTopLeft"
                value={averageApplications.toString()}
                className="text-lg"
                fill="hsl(var(--foreground))"
                offset={10}
                startOffset={100}
              />
            </ReferenceLine>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <CardDescription>
          Over the past 7 days, you have submitted{" "}
          <span className="font-medium text-foreground">
            {totalApplications}
          </span>{" "}
          job applications.
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
