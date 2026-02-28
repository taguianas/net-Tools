import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue>({ value: '', onValueChange: () => {} });

function Tabs({ defaultValue, value: controlledValue, onValueChange, className, children }: {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const handleChange = (v: string) => {
    setInternalValue(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, onValueChange: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn(
      "inline-flex h-10 items-center justify-center rounded-md p-1 text-slate-500",
      "bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
      className
    )}>
      {children}
    </div>
  );
}

function TabsTrigger({ value, className, children }: { value: string; className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(TabsContext);
  const isActive = ctx.value === value;
  return (
    <button
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-slate-100"
          : "hover:bg-slate-200/60 dark:hover:bg-slate-700/60 dark:text-slate-400",
        className
      )}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, className, children }: { value: string; className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return (
    <div className={cn("mt-2 focus-visible:outline-none", className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
