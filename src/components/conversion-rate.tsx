"use client";

import { Bar, BarChart, Rectangle, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

interface ConversionData {
  date: string;
  applications: number;
}

interface ConversionRateGraphProps {
  conversionRate: number;
  data: ConversionData[];
  desc: string;
  title: string;
}

export default function ConversionRateGraph({
  conversionRate,
  data,
  desc,
  title,
}: ConversionRateGraphProps) {
  // const averageRate =
  //   data.reduce((sum, day) => sum + day.rate, 0) / data.length;
  return (
    <Card className=" w-full">
      <CardHeader className="p-4 pb-0">
        {/* <CardTitle>Application Conversion Rate</CardTitle> */}
        <CardTitle>{title}</CardTitle>

        <CardDescription>{desc}</CardDescription>
        {/* <CardDescription>
          Your average conversion rate is {conversionRate.toFixed(2)}%. Keep
          improving!
        </CardDescription> */}
      </CardHeader>
      <CardContent className="flex flex-row items-baseline gap-4 p-4 pt-2">
        <div className="flex items-baseline gap-2 text-3xl font-bold tabular-nums leading-none">
          {conversionRate.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground">%</span>
        </div>
        <ChartContainer
          config={{
            conversionRate: {
              label: "Conversion Rate",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="ml-auto w-[64px]"
        >
          <BarChart
            accessibilityLayer
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            data={data}
          >
            <Bar
              dataKey="applications"
              fill="var(--color-conversionRate)"
              radius={2}
              fillOpacity={0.2}
              activeIndex={data.length - 1}
              activeBar={<Rectangle fillOpacity={0.8} />}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              hide
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
