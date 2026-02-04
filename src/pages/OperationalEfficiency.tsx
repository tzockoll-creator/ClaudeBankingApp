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
import { Bar, Scatter } from "react-chartjs-2";
import { useData } from "../context/DataContext";
import {
  filterByQuarter,
  getLatestQuarter,
  getUniqueBranches,
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

export default function OperationalEfficiency() {
  const { data, loading } = useData();

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const latestQ = getLatestQuarter(data);
  const latest = filterByQuarter(data, latestQ);
  const branches = getUniqueBranches(data);

  // Staff utilization: transactions per staff member
  const staffData = branches
    .map((name) => {
      const rec = latest.find((r) => r.branchName === name);
      if (!rec) return null;
      return {
        name,
        txPerStaff: rec.staffCount > 0 ? rec.tellerTransactions / rec.staffCount : 0,
        staffCount: rec.staffCount,
        operatingCost: rec.operatingCost,
        branchProfit: rec.branchProfit,
        avgWaitTime: rec.avgWaitTime,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.txPerStaff - a!.txPerStaff);

  const txPerStaffChart = {
    labels: staffData.map((s) => s!.name),
    datasets: [
      {
        label: "Transactions per Staff",
        data: staffData.map((s) => s!.txPerStaff),
        backgroundColor: COLORS.slice(0, staffData.length),
        borderRadius: 4,
      },
    ],
  };

  // Wait time rankings
  const waitData = branches
    .map((name) => {
      const rec = latest.find((r) => r.branchName === name);
      return { name, wait: rec?.avgWaitTime || 0 };
    })
    .sort((a, b) => a.wait - b.wait);

  const waitChart = {
    labels: waitData.map((w) => w.name),
    datasets: [
      {
        label: "Avg Wait Time (min)",
        data: waitData.map((w) => w.wait),
        backgroundColor: waitData.map((w) =>
          w.wait <= 8 ? "#10b981" : w.wait <= 12 ? "#f59e0b" : "#ef4444"
        ),
        borderRadius: 4,
      },
    ],
  };

  // Efficiency matrix: cost vs profit scatter
  const efficiencyScatter = {
    datasets: [
      {
        label: "Branches",
        data: staffData.map((s) => ({
          x: s!.operatingCost,
          y: s!.branchProfit,
        })),
        backgroundColor: staffData.map((_, i) => COLORS[i % COLORS.length]),
        pointRadius: 10,
      },
    ],
  };

  // Cost per transaction
  const costEfficiency = branches
    .map((name) => {
      const rec = latest.find((r) => r.branchName === name);
      if (!rec || rec.tellerTransactions === 0) return null;
      return {
        name,
        costPerTx: (rec.operatingCost * 1000) / rec.tellerTransactions,
        profitMargin:
          rec.interestIncome > 0
            ? ((rec.branchProfit / rec.interestIncome) * 100)
            : 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.costPerTx - b!.costPerTx);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Operational Efficiency
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Staffing, costs, and operational metrics for {latestQ}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Transactions per Staff Member
          </h3>
          <Bar
            data={txPerStaffChart}
            options={{
              indexAxis: "y",
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { ticks: { font: { size: 11 } } },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Wait Time Rankings (lower is better)
          </h3>
          <Bar
            data={waitChart}
            options={{
              indexAxis: "y",
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  grid: { display: false },
                  title: { display: true, text: "Minutes" },
                },
                y: { ticks: { font: { size: 11 } } },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Efficiency Matrix: Operating Cost vs Profit
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            Bottom-right = high profit, low cost (ideal)
          </p>
          <Scatter
            data={efficiencyScatter}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  title: { display: true, text: "Operating Cost (K)" },
                },
                y: {
                  title: { display: true, text: "Branch Profit (K)" },
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-700 p-5 pb-2">
            Cost Efficiency Ranking
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">#</th>
                  <th className="text-left px-4 py-2 font-medium">Branch</th>
                  <th className="text-right px-4 py-2 font-medium">
                    Cost/Tx ($)
                  </th>
                  <th className="text-right px-4 py-2 font-medium">
                    Profit Margin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {costEfficiency.map(
                  (c, i) =>
                    c && (
                      <tr key={c.name}>
                        <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-2 text-gray-800">{c.name}</td>
                        <td className="px-4 py-2 text-right">
                          ${c.costPerTx.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {c.profitMargin.toFixed(1)}%
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
