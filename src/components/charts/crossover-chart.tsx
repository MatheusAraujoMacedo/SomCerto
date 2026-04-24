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

import { CrossoverSetting } from "@/types/audio";

interface CrossoverChartProps {
  className?: string;
  data?: CrossoverSetting[];
}

const colorMap: Record<string, string> = {
  "subwoofer": "#a855f7",
  "midrange": "#3b82f6",
  "driver": "#f59e0b",
  "tweeter": "#ec4899"
};

export function CrossoverChart({ className, data = [] }: CrossoverChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-[220px] rounded-lg border border-dashed border-white/[0.1] ${className}`}>
        <p className="text-sm text-gray-500">Adicione pelo menos um falante ao projeto para visualizar o gráfico de cortes.</p>
      </div>
    );
  }

  const chartData = data.map((item) => {
    const start = item.hpf || 20;
    const end = item.lpf || 20000;
    const color = colorMap[item.equipmentType] || "#6b7280";
    
    return {
      via: item.via,
      range: Math.max(end - start, 10), // Ensure at least some width
      start: start,
      color: color,
      label: `${start} Hz – ${end >= 1000 ? `${(end / 1000).toFixed(1)}k` : end} Hz`,
    };
  });

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
