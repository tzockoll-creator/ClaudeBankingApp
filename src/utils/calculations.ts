import type { BranchRecord } from "../types/branch";

export function getUniqueBranches(data: BranchRecord[]): string[] {
  return [...new Set(data.map((r) => r.branchName))].sort();
}

export function getUniqueQuarters(data: BranchRecord[]): string[] {
  return [...new Set(data.map((r) => r.quarter))].sort();
}

export function getLatestQuarter(data: BranchRecord[]): string {
  const quarters = getUniqueQuarters(data);
  return quarters[quarters.length - 1];
}

export function filterByQuarter(
  data: BranchRecord[],
  quarter: string
): BranchRecord[] {
  return data.filter((r) => r.quarter === quarter);
}

export function filterByBranch(
  data: BranchRecord[],
  branchName: string
): BranchRecord[] {
  return data.filter((r) => r.branchName === branchName);
}

export function sumField(
  records: BranchRecord[],
  field: keyof BranchRecord
): number {
  return records.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
}

export function avgField(
  records: BranchRecord[],
  field: keyof BranchRecord
): number {
  if (records.length === 0) return 0;
  return sumField(records, field) / records.length;
}

export function calculateHealthScore(records: BranchRecord[]): number {
  if (records.length === 0) return 0;
  // Normalize each component to 0-100 scale, then average
  const avgProfit = avgField(records, "branchProfit");
  const avgComplaint = avgField(records, "complaintRate");
  const avgNetNew = avgField(records, "netNewMembers");
  const avgDigital = avgField(records, "mobileAppAdoption");

  // Profit score: assume max ~10000K
  const profitScore = Math.min((avgProfit / 10000) * 100, 100);
  // Complaint score: lower is better, assume max 5
  const complaintScore = Math.max(0, (1 - avgComplaint / 5) * 100);
  // Net new members: assume max 200
  const memberScore = Math.min((avgNetNew / 200) * 100, 100);
  // Digital adoption: already a percentage
  const digitalScore = avgDigital;

  return (profitScore + complaintScore + memberScore + digitalScore) / 4;
}

export function getHealthColor(score: number): string {
  if (score >= 65) return "green";
  if (score >= 45) return "yellow";
  return "red";
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}M`;
  }
  return `$${value.toFixed(0)}K`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Chart color palette
export const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#e11d48",
  "#a855f7",
  "#0ea5e9",
  "#22c55e",
];
