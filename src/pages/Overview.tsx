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
import { Bar, Line } from "react-chartjs-2";
import { useData } from "../context/DataContext";
import KPICard from "../components/KPICard";
import BranchMap from "../components/BranchMap";
import {
  filterByQuarter,
  getLatestQuarter,
  getUniqueBranches,
  getUniqueQuarters,
  sumField,
  avgField,
  formatCurrency,
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

export default function Overview() {
  const { data, loading } = useData();

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const latestQ = getLatestQuarter(data);
  const latest = filterByQuarter(data, latestQ);
  const quarters = getUniqueQuarters(data);
  const branches = getUniqueBranches(data);

  const totalProfit = sumField(latest, "branchProfit");
  const totalMembers = sumField(latest, "netNewMembers");
  const avgDigital = avgField(latest, "mobileAppAdoption");
  const avgWait = avgField(latest, "avgWaitTime");

  // Previous quarter comparison
  const prevQ = quarters.length >= 2 ? quarters[quarters.length - 2] : null;
  const prevData = prevQ ? filterByQuarter(data, prevQ) : [];
  const prevProfit = prevData.length ? sumField(prevData, "branchProfit") : null;
  const profitTrend =
    prevProfit !== null
      ? totalProfit > prevProfit
        ? "up"
        : totalProfit < prevProfit
          ? "down"
          : ("flat" as const)
      : undefined;

  // Branch profit rankings for bar chart
  const branchProfits = branches
    .map((name) => ({
      name,
      profit: latest
        .filter((r) => r.branchName === name)
        .reduce((s, r) => s + r.branchProfit, 0),
    }))
    .sort((a, b) => b.profit - a.profit);

  const barData = {
    labels: branchProfits.map((b) => b.name),
    datasets: [
      {
        label: "Branch Profit (K)",
        data: branchProfits.map((b) => b.profit),
        backgroundColor: branchProfits.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 4,
      },
    ],
  };

  // Quarterly trend line
  const quarterlyProfits = quarters.map((q) =>
    sumField(filterByQuarter(data, q), "branchProfit")
  );

  const lineData = {
    labels: quarters,
    datasets: [
      {
        label: "Total Portfolio Profit (K)",
        data: quarterlyProfits,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Overview Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Latest quarter: {latestQ} &middot; {branches.length} branches
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          trend={profitTrend}
          subtitle={`${latestQ}`}
        />
        <KPICard
          title="Net New Members"
          value={formatNumber(totalMembers)}
          subtitle="Across all branches"
        />
        <KPICard
          title="Avg Mobile Adoption"
          value={formatPercent(avgDigital)}
          subtitle="Mobile app usage"
        />
        <KPICard
          title="Avg Wait Time"
          value={`${avgWait.toFixed(1)} min`}
          subtitle="Branch average"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Branch Profit Rankings ({latestQ})
          </h3>
          <Bar
            data={barData}
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
            Portfolio Profit Trend
          </h3>
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: false },
              },
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Branch Locations
        </h3>
        <BranchMap data={data} />
      </div>
    </div>
  );
}
