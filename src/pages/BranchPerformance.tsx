import { useState } from "react";
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
import { Line } from "react-chartjs-2";
import { useData } from "../context/DataContext";
import {
  filterByQuarter,
  filterByBranch,
  getLatestQuarter,
  getUniqueBranches,
  getUniqueQuarters,
  formatCurrency,
  formatNumber,
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

export default function BranchPerformance() {
  const { data, loading } = useData();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("branchProfit");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const latestQ = getLatestQuarter(data);
  const latest = filterByQuarter(data, latestQ);
  const branches = getUniqueBranches(data);
  const quarters = getUniqueQuarters(data);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortIcon = (field: string) =>
    sortField === field ? (sortDir === "desc" ? " ▼" : " ▲") : "";

  // Build table rows
  const tableRows = branches
    .map((name) => {
      const rec = latest.find((r) => r.branchName === name);
      if (!rec) return null;
      return rec;
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aVal = Number((a as any)[sortField]) || 0;
      const bVal = Number((b as any)[sortField]) || 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });

  // Drilldown chart
  const branchHistory = selectedBranch
    ? filterByBranch(data, selectedBranch)
    : [];

  const drilldownData = {
    labels: quarters,
    datasets: [
      {
        label: "Profit (K)",
        data: quarters.map(
          (q) => branchHistory.find((r) => r.quarter === q)?.branchProfit || 0
        ),
        borderColor: "#3b82f6",
        tension: 0.3,
      },
      {
        label: "Interest Income (K)",
        data: quarters.map(
          (q) => branchHistory.find((r) => r.quarter === q)?.interestIncome || 0
        ),
        borderColor: "#10b981",
        tension: 0.3,
      },
      {
        label: "Operating Cost (K)",
        data: quarters.map(
          (q) => branchHistory.find((r) => r.quarter === q)?.operatingCost || 0
        ),
        borderColor: "#ef4444",
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Branch Performance</h2>
        <p className="text-sm text-gray-500 mt-1">
          Financial KPIs for {latestQ}. Click a branch to drill down.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Branch</th>
                <th
                  className="text-right px-4 py-3 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort("branchProfit")}
                >
                  Profit (K){sortIcon("branchProfit")}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort("interestIncome")}
                >
                  Interest Inc (K){sortIcon("interestIncome")}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort("operatingCost")}
                >
                  Op Cost (K){sortIcon("operatingCost")}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort("savings")}
                >
                  Savings (K){sortIcon("savings")}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort("netNewMembers")}
                >
                  Net New{sortIcon("netNewMembers")}
                </th>
                <th
                  className="text-right px-4 py-3 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => handleSort("accountOpens")}
                >
                  Acct Opens{sortIcon("accountOpens")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableRows.map(
                (rec) =>
                  rec && (
                    <tr
                      key={rec.branchId}
                      className={`cursor-pointer transition-colors ${
                        selectedBranch === rec.branchName
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedBranch(rec.branchName)}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {rec.branchName}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(rec.branchProfit)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(rec.interestIncome)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(rec.operatingCost)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(rec.savings)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatNumber(rec.netNewMembers)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatNumber(rec.accountOpens)}
                      </td>
                    </tr>
                  )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBranch && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {selectedBranch} — Quarterly Trend
          </h3>
          <Line
            data={drilldownData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: false },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
