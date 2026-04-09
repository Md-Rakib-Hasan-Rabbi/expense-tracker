import { createContext, useMemo, useState } from 'react';

const AppStateContext = createContext(null);

function getCurrentMonthKey() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

export function AppStateProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [reportRange, setReportRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  });

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      selectedMonth,
      setSelectedMonth,
      reportRange,
      setReportRange,
    }),
    [sidebarOpen, selectedMonth, reportRange]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export { AppStateContext };
