export interface BranchRecord {
  branchName: string;
  branchId: string;
  latitude: number | null;
  longitude: number | null;
  quarter: string;
  branchType: string;
  tellerTransactions: number;
  avgWaitTime: number;
  billPayAdoption: number;
  tellerSharePct: number;
  accountOpens: number;
  staffCount: number;
  closedAccounts: number;
  netNewMembers: number;
  savings: number;
  complaintRate: number;
  interestIncome: number;
  operatingCost: number;
  mobileDepositAdoption: number;
  mobileAppAdoption: number;
  branchProfit: number;
}

export interface RawAgentRecord {
  "branch (branch name)": string;
  "branch (branch id)": string;
  "branch (latitude)": number | null;
  "branch (longitude)": number | null;
  "quarter (quarter)": string;
  "branch type (branch type)": string;
  "total teller transactions": number;
  "average wait time (min)": number;
  "bill pay adoption percentage": number;
  "teller share percentage": number;
  "total branch account opens": number;
  "average staff count": number;
  "total closed accounts": number;
  "total net new members": number;
  "total savings (k)": number;
  "complaint rate per 1000": number;
  "total interest income (k)": number;
  "total operating cost (k)": number;
  "mobile deposit adoption percentage": number;
  "mobile app adoption (%)": number;
  "total branch profit (k)": number;
}

export function parseRawRecord(raw: RawAgentRecord): BranchRecord {
  return {
    branchName: raw["branch (branch name)"],
    branchId: raw["branch (branch id)"],
    latitude: raw["branch (latitude)"],
    longitude: raw["branch (longitude)"],
    quarter: raw["quarter (quarter)"],
    branchType: raw["branch type (branch type)"],
    tellerTransactions: raw["total teller transactions"],
    avgWaitTime: raw["average wait time (min)"],
    billPayAdoption: raw["bill pay adoption percentage"],
    tellerSharePct: raw["teller share percentage"],
    accountOpens: raw["total branch account opens"],
    staffCount: raw["average staff count"],
    closedAccounts: raw["total closed accounts"],
    netNewMembers: raw["total net new members"],
    savings: raw["total savings (k)"],
    complaintRate: raw["complaint rate per 1000"],
    interestIncome: raw["total interest income (k)"],
    operatingCost: raw["total operating cost (k)"],
    mobileDepositAdoption: raw["mobile deposit adoption percentage"],
    mobileAppAdoption: raw["mobile app adoption (%)"],
    branchProfit: raw["total branch profit (k)"],
  };
}
