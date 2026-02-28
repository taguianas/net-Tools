import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  value: '', onValueChange: () => {}, open: false, setOpen: () => {}
});

function Select({ value: controlledValue, onValueChange, defaultValue, children }: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children?: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const [open, setOpen] = React.useState(false);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const handleChange = (v: string) => {
    setInternalValue(v);
    onValueChange?.(v);
    setOpen(false);
  };
  return (
    <SelectContext.Provider value={{ value, onValueChange: handleChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
}

function SelectContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { open } = React.useContext(SelectContext);
  if (!open) return null;
  return (
    <div className={cn(
      "absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-md",
      "dark:border-slate-700 dark:bg-slate-900",
      className
    )}>
      {children}
    </div>
  );
}

function SelectItem({ value, className, children }: { value: string; className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(SelectContext);
  return (
    <div
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none",
        "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        ctx.value === value
          ? "bg-slate-100 font-medium dark:bg-slate-800 dark:text-slate-100"
          : "dark:text-slate-200",
        className
      )}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
