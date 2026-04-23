"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const crossoverData = [
  {
    via: "Subwoofer",
    start: 30,
    end: 90,
    color: "#a855f7",
  },
  {
    via: "Médio",
    start: 125,
    end: 2250,
    color: "#3b82f6",
  },
  {
    via: "Driver",
    start: 1600,
    end: 10000,
    color: "#f59e0b",
  },
  {
    via: "Tweeter",
    start: 6500,
    end: 20000,
    color: "#ec4899",
  },
];

interface CrossoverChartProps {
  className?: string;
}

export function CrossoverChart({ className }: CrossoverChartProps) {
  const chartData = crossoverData.map((item) => ({
    via: item.via,
    range: item.end - item.start,
    start: item.start,
    color: item.color,
    label: `${item.start} Hz – ${item.end >= 1000 ? `${(item.end / 1000).toFixed(1)}k` : item.end} Hz`,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
          />
          <XAxis
            type="number"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(val) =>
              val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`
            }
            stroke="rgba(255,255,255,0.06)"
          />
          <YAxis
            type="category"
            dataKey="via"
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            width={70}
            stroke="rgba(255,255,255,0.06)"
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
            formatter={(_value: any, _name: any, props: any) => [
              props?.payload?.label || `${_value}`,
              "Faixa",
            ]}
          />
          <Bar dataKey="range" radius={[0, 4, 4, 0]} barSize={24}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
