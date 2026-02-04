import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import BranchPerformance from "./pages/BranchPerformance";
import DigitalTransformation from "./pages/DigitalTransformation";
import BranchHealth from "./pages/BranchHealth";
import OperationalEfficiency from "./pages/OperationalEfficiency";

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/performance" element={<BranchPerformance />} />
            <Route path="/digital" element={<DigitalTransformation />} />
            <Route path="/health" element={<BranchHealth />} />
            <Route path="/efficiency" element={<OperationalEfficiency />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}
