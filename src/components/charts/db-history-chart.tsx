"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DbMeasurement } from "@/types/audio";

interface DbHistoryChartProps {
  data: DbMeasurement[];
  className?: string;
}

export function DbHistoryChart({ data, className }: DbHistoryChartProps) {
  const chartData = data.map((d, i) => ({
    time: i,
    dB: d.value,
  }));

  if (chartData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[200px] ${className}`}>
        <p className="text-sm text-gray-500">Inicie uma medição para ver o gráfico.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="dbGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            dataKey="time"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            stroke="rgba(255,255,255,0.06)"
            tickFormatter={(val) => `${val}s`}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 10 }}
            stroke="rgba(255,255,255,0.06)"
            domain={[0, 140]}
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a2130",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "#e5e7eb",
              fontSize: "12px",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value} dB`, "Nível"]}
          />
          <Area
            type="monotone"
            dataKey="dB"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#dbGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
