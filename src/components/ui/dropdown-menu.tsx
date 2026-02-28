import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({ open: false, setOpen: () => {} });

function DropdownMenu({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (!open) return;
    const handler = () => setOpen(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [open]);
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({ asChild, children }: { asChild?: boolean; children?: React.ReactNode }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, { onClick: handleClick });
  }
  return <button onClick={handleClick}>{children}</button>;
}

function DropdownMenuContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { open } = React.useContext(DropdownMenuContext);
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute right-0 z-50 mt-1 min-w-[8rem] rounded-md border p-1 shadow-md",
        "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
        className
      )}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ className, onClick, children }: { className?: string; onClick?: () => void; children?: React.ReactNode }) {
  const { setOpen } = React.useContext(DropdownMenuContext);
  return (
    <div
      className={cn(
        "flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:text-slate-200",
        className
      )}
      onClick={() => { onClick?.(); setOpen(false); }}
    >
      {children}
    </div>
  );
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
