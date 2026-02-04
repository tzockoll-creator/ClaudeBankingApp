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
import {
  filterByQuarter,
  filterByBranch,
  getLatestQuarter,
  getUniqueBranches,
  getUniqueQuarters,
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

export default function DigitalTransformation() {
  const { data, loading } = useData();

  if (loading) return <div className="text-gray-500">Loading...</div>;

  const latestQ = getLatestQuarter(data);
  const latest = filterByQuarter(data, latestQ);
  const branches = getUniqueBranches(data);
  const quarters = getUniqueQuarters(data);

  // Adoption by branch (grouped bar)
  const adoptionData = {
    labels: branches.map((b) => b.replace(/ /g, "\n")),
    datasets: [
      {
        label: "Mobile App %",
        data: branches.map(
          (b) => latest.find((r) => r.branchName === b)?.mobileAppAdoption || 0
        ),
        backgroundColor: "#3b82f6",
        borderRadius: 3,
      },
      {
        label: "Mobile Deposit %",
        data: branches.map(
          (b) =>
            latest.find((r) => r.branchName === b)?.mobileDepositAdoption || 0
        ),
        backgroundColor: "#10b981",
        borderRadius: 3,
      },
      {
        label: "Bill Pay %",
        data: branches.map(
          (b) => latest.find((r) => r.branchName === b)?.billPayAdoption || 0
        ),
        backgroundColor: "#f59e0b",
        borderRadius: 3,
      },
    ],
  };

  // Teller share trend over quarters (line per branch)
  const tellerTrendData = {
    labels: quarters,
    datasets: branches.map((branch, i) => {
      const history = filterByBranch(data, branch);
      return {
        label: branch,
        data: quarters.map(
          (q) => history.find((r) => r.quarter === q)?.tellerSharePct || 0
        ),
        borderColor: COLORS[i % COLORS.length],
        backgroundColor: "transparent",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 2,
      };
    }),
  };

  // Leaders and laggards
  const adoptionRank = branches
    .map((name) => ({
      name,
      adoption: latest.find((r) => r.branchName === name)?.mobileAppAdoption || 0,
    }))
    .sort((a, b) => b.adoption - a.adoption);

  const leaders = adoptionRank.slice(0, 5);
  const laggards = adoptionRank.slice(-5).reverse();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Digital Transformation
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Digital adoption trends across all branches
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Digital Adoption by Branch ({latestQ})
        </h3>
        <Bar
          data={adoptionData}
          options={{
            responsive: true,
            plugins: { legend: { position: "top" } },
            scales: {
              x: { ticks: { font: { size: 10 }, maxRotation: 45 } },
              y: {
                beginAtZero: true,
                max: 100,
                title: { display: true, text: "%" },
              },
            },
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Leaders (Mobile App Adoption)
          </h3>
          <div className="space-y-3">
            {leaders.map((b, i) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{b.name}</span>
                    <span className="text-green-600 font-semibold">
                      {formatPercent(b.adoption)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${b.adoption}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Laggards (Mobile App Adoption)
          </h3>
          <div className="space-y-3">
            {laggards.map((b, i) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">
                  {adoptionRank.length - 4 + i}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{b.name}</span>
                    <span className="text-red-600 font-semibold">
                      {formatPercent(b.adoption)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                    <div
                      className="bg-red-400 h-2 rounded-full"
                      style={{ width: `${b.adoption}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Teller Share % Trend (declining = more digital)
        </h3>
        <Line
          data={tellerTrendData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "right", labels: { font: { size: 10 } } },
            },
            scales: {
              x: { grid: { display: false } },
              y: {
                title: { display: true, text: "Teller Share %" },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
