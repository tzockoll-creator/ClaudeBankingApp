import { NavLink, Outlet } from "react-router-dom";
import { useData } from "../context/DataContext";

const navItems = [
  { to: "/", label: "Overview", icon: "📊" },
  { to: "/performance", label: "Branch Performance", icon: "💰" },
  { to: "/digital", label: "Digital Transformation", icon: "📱" },
  { to: "/health", label: "Branch Health", icon: "🏥" },
  { to: "/efficiency", label: "Operational Efficiency", icon: "⚙️" },
];

export default function Layout() {
  const { lastUpdated, refresh, loading } = useData();

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-lg font-bold">Banking Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Branch Performance Hub</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-slate-700 text-white border-r-2 border-blue-400"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={refresh}
            disabled={loading}
            className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white transition-colors cursor-pointer"
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
          {lastUpdated && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          <p className="text-xs text-slate-600 mt-1 text-center">
            15 Branches &middot; 8 Quarters
          </p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
