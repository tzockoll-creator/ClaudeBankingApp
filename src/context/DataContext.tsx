import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { BranchRecord, RawAgentRecord } from "../types/branch";
import { parseRawRecord } from "../types/branch";
import sampleData from "../data/sampleData.json";

interface DataContextType {
  data: BranchRecord[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

const DataContext = createContext<DataContextType>({
  data: [],
  loading: true,
  error: null,
  lastUpdated: null,
  refresh: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BranchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const parsed = (sampleData as RawAgentRecord[]).map(parseRawRecord);
      setData(parsed);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load branch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DataContext.Provider
      value={{ data, loading, error, lastUpdated, refresh: loadData }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
