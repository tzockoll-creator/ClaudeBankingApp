interface StatusBadgeProps {
  status: "green" | "yellow" | "red";
  label?: string;
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const colors = {
    green: "bg-green-100 text-green-800 border-green-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    red: "bg-red-100 text-red-800 border-red-300",
  };

  const dots = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status]}`}
    >
      <span className={`w-2 h-2 rounded-full ${dots[status]}`} />
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
