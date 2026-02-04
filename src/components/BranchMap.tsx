import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import type { BranchRecord } from "../types/branch";
import {
  filterByQuarter,
  getLatestQuarter,
  formatCurrency,
  getUniqueBranches,
} from "../utils/calculations";

interface BranchMapProps {
  data: BranchRecord[];
}

export default function BranchMap({ data }: BranchMapProps) {
  const latestQ = getLatestQuarter(data);
  const latest = filterByQuarter(data, latestQ);
  const branches = getUniqueBranches(data);

  // Get one record per branch with valid coordinates
  const branchPoints = branches
    .map((name) => {
      const rec = latest.find(
        (r) => r.branchName === name && r.latitude && r.longitude
      );
      return rec;
    })
    .filter(Boolean) as BranchRecord[];

  if (branchPoints.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        No location data available for map
      </div>
    );
  }

  const center: [number, number] = [
    branchPoints.reduce((s, r) => s + (r.latitude || 0), 0) /
      branchPoints.length,
    branchPoints.reduce((s, r) => s + (r.longitude || 0), 0) /
      branchPoints.length,
  ];

  const maxProfit = Math.max(...branchPoints.map((r) => r.branchProfit));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: 400, width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {branchPoints.map((rec) => (
          <CircleMarker
            key={rec.branchId}
            center={[rec.latitude!, rec.longitude!]}
            radius={8 + (rec.branchProfit / maxProfit) * 12}
            fillColor={rec.branchProfit > 5000 ? "#10b981" : rec.branchProfit > 3000 ? "#f59e0b" : "#ef4444"}
            fillOpacity={0.7}
            stroke={true}
            weight={2}
            color="#fff"
          >
            <Tooltip>
              <strong>{rec.branchName}</strong>
              <br />
              Profit: {formatCurrency(rec.branchProfit)}
              <br />
              Staff: {rec.staffCount}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
