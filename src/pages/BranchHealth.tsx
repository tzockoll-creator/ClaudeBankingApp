import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Scatter } from "react-chartjs-2";
import { useData } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";
import {
  filterByQuarter,
  filterByBranch,
  getLatestQuarter,
  getUniqueBranches,
  getUniqueQuarters,
  calculateHealthScore,
  getHealthColor,
  formatNumber,
  formatPercent,
  COLORS,
} from "../utils/calculations";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function BranchHealth() {
  const { data, loading } = useData();

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const latestQ = getLatestQuarter(data);
  const prevQ = (() => {
    const qs = getUniqueQuarters(data);
    return qs.length >= 2 ? qs[qs.length - 2] : null;
  })();
  const latest = filterByQuarter(data, latestQ);
  const prev = prevQ ? filterByQuarter(data, prevQ) : [];
  const branches = getUniqueBranches(data);
  const quarters = getUniqueQuarters(data);

  // Health scores per branch
  const healthData = branches.map((name) => {
    const branchLatest = latest.filter((r) => r.branchName === name);
    const branchPrev = prev.filter((r) => r.branchName === name);
    const score = calculateHealthScore(branchLatest);
    const prevScore = branchPrev.length
      ? calculateHealthScore(branchPrev)
      : null;
    const rec = branchLatest[0];
    return {
      name,
      score,
      prevScore,
      trend:
        prevScore !== null
          ? score > prevScore
            ? ("up" as const)
            : score < prevScore
              ? ("down" as const)
              : ("flat" as const)
          : undefined,
      color: getHealthColor(score) as "green" | "yellow" | "red",
      complaintRate: rec?.complaintRate || 0,
      avgWaitTime: rec?.avgWaitTime || 0,
      netNewMembers: rec?.netNewMembers || 0,
    };
  });

  healthData.sort((a, b) => b.score - a.score);

  // Complaint rate vs wait time scatter
  const scatterData = {
    datasets: [
      {
        label: "Branches",
        data: healthData.map((b) => ({
          x: b.avgWaitTime,
          y: b.complaintRate,
        })),
        backgroundColor: healthData.map((b) =>
          b.color === "green"
            ? "#10b981"
            : b.color === "yellow"
              ? "#f59e0b"
              : "#ef4444"
        ),
        pointRadius: 8,
      },
    ],
  };

  // Quarter-over-quarter changes table
  const changes = branches
    .map((name) => {
      const curr = latest.find((r) => r.branchName === name);
      const previous = prev.find((r) => r.branchName === name);
      if (!curr || !previous) return null;
      return {
        name,
        profitChange: curr.branchProfit - previous.branchProfit,
        memberChange: curr.netNewMembers - previous.netNewMembers,
        waitChange: curr.avgWaitTime - previous.avgWaitTime,
        complaintChange: curr.complaintRate - previous.complaintRate,
      };
    })
    .filter(Boolean);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Branch Health</h2>
        <p className="text-sm text-gray-500 mt-1">
          Composite health scores based on profit, complaints, growth, and
          digital adoption
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {healthData.map((b) => (
          <div
            key={b.name}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-semibold text-gray-800 truncate pr-2">
                {b.name}
              </h4>
              <StatusBadge status={b.color} />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {b.score.toFixed(0)}
              </span>
              <span className="text-sm text-gray-400 mb-1">/100</span>
              {b.trend && (
                <span
                  className={`text-sm mb-1 ${
                    b.trend === "up"
                      ? "text-green-600"
                      : b.trend === "down"
                        ? "text-red-600"
                        : "text-gray-400"
                  }`}
                >
                  {b.trend === "up" ? "▲" : b.trend === "down" ? "▼" : "—"}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-500">
              <div>
                <span className="block text-gray-400">Complaints</span>
                {formatNumber(b.complaintRate)}/1K
              </div>
              <div>
                <span className="block text-gray-400">Wait</span>
                {b.avgWaitTime.toFixed(1)} min
              </div>
              <div>
                <span className="block text-gray-400">Net New</span>
                {formatNumber(b.netNewMembers)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Complaint Rate vs Wait Time
          </h3>
          <Scatter
            data={scatterData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  title: { display: true, text: "Avg Wait Time (min)" },
                },
                y: {
                  title: { display: true, text: "Complaint Rate per 1000" },
                },
              },
            }}
          />
        </div>

        {changes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-700 p-5 pb-2">
              Quarter-over-Quarter Changes ({prevQ} → {latestQ})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Branch</th>
                    <th className="text-right px-4 py-2 font-medium">
                      Profit Δ
                    </th>
                    <th className="text-right px-4 py-2 font-medium">
                      Members Δ
                    </th>
                    <th className="text-right px-4 py-2 font-medium">
                      Wait Δ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {changes.map(
                    (c) =>
                      c && (
                        <tr key={c.name}>
                          <td className="px-4 py-2 text-gray-800">{c.name}</td>
                          <td
                            className={`px-4 py-2 text-right ${c.profitChange >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {c.profitChange >= 0 ? "+" : ""}
                            {c.profitChange.toFixed(0)}K
                          </td>
                          <td
                            className={`px-4 py-2 text-right ${c.memberChange >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {c.memberChange >= 0 ? "+" : ""}
                            {c.memberChange}
                          </td>
                          <td
                            className={`px-4 py-2 text-right ${c.waitChange <= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {c.waitChange >= 0 ? "+" : ""}
                            {c.waitChange.toFixed(1)} min
                          </td>
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
