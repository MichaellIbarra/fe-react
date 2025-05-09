
"use client"

import * as React from "react"
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { LegacyAttendanceRecord } from "@/types";

export interface AttendanceDataPoint {
  status: LegacyAttendanceRecord['status'];
  count: number;
  fill: string;
}

interface TodaysAttendanceChartProps {
  data: AttendanceDataPoint[];
}

const chartConfig = {
  count: {
    label: "Estudiantes",
  },
  Presente: {
    label: "Presente",
    color: "hsl(var(--chart-1))",
  },
  Ausente: {
    label: "Ausente",
    color: "hsl(var(--chart-2))",
  },
  Tardanza: {
    label: "Tardanza",
    color: "hsl(var(--chart-3))",
  },
  Justificado: {
    label: "Justificado",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export default function TodaysAttendanceChart({ data }: TodaysAttendanceChartProps) {
  const totalStudents = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0)
  }, [data])

  if (!data || data.every(d => d.count === 0)) {
    return <p className="text-sm text-muted-foreground text-center py-4">No hay datos de asistencia para hoy.</p>;
  }
  
  // Filter out data points with zero count to avoid rendering empty slices
  const filteredData = data.filter(item => item.count > 0);


  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto flex aspect-square max-h-[300px] items-center justify-center"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={filteredData}
            dataKey="count"
            nameKey="status"
            innerRadius={60}
            strokeWidth={5}
            activeIndex={0} // Can be used for interactive highlighting
            // activeShape, // For custom active shape
          >
            {filteredData.map((entry) => (
              <Cell key={entry.status} fill={entry.fill} className="stroke-background hover:opacity-80" />
            ))}
          </Pie>
           <ChartLegend
            content={<ChartLegendContent nameKey="status" />}
            className="-translate-y-2 flex-wrap gap-2 data-[legend=true]:flex"
          />
        </PieChart>
      </ResponsiveContainer>
       {totalStudents > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Estudiantes Hoy</p>
          </div>
        )}
    </ChartContainer>
  )
}
