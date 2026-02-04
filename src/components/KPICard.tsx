interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "flat";
}

export default function KPICard({ title, value, subtitle, trend }: KPICardProps) {
  const trendIcon =
    trend === "up" ? "▲" : trend === "down" ? "▼" : trend === "flat" ? "—" : "";
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-gray-500";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && <span className={`text-sm ${trendColor} mb-0.5`}>{trendIcon}</span>}
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
