"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Cell,
} from "recharts"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))", // Match BarChart fill if needed
  },
  rooms: {
    label: "Rooms",
    color: "hsl(var(--chart-1))",
  },
  trips: {
    label: "Trips",
    color: "hsl(var(--chart-2))",
  },
  cars: {
    label: "Cars",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
]

interface AgencyChartsClientProps {
  monthlySales: Array<{ name: string; total: number }>
  salesBreakdown: Array<{ name: string; value: number }>
}

export function AgencyChartsClient({
  monthlySales,
  salesBreakdown,
}: AgencyChartsClientProps) {
  const pieChartData = salesBreakdown.filter((item) => item.value > 0)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Monthly Revenue Chart */}
      <Card className="lg:col-span-2 shadow-sm">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
          <CardDescription>Last 12 months revenue trend</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={monthlySales}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              {/* Use a consistent color or map based on data if needed */}
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={4}>
                {/* If you want varying colors per bar based on month/data: */}
                {/* {monthlySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))} */}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Breakdown Pie Chart */}
      <Card className="flex flex-col shadow-sm">
        <CardHeader className="items-center pb-0">
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>By service category</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <div className="flex items-center justify-center gap-4 p-4 text-sm font-medium">
          {pieChartData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{
                  backgroundColor:
                    chartConfig[
                      item.name.toLowerCase() as keyof typeof chartConfig
                    ]?.color || "#ccc",
                }}
              />
              {item.name}
            </div>
          ))}
          {pieChartData.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No revenue data yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
