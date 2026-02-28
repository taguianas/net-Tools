import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({ open: false, setOpen: () => {} });

function Dialog({ open: controlledOpen, onOpenChange, children }: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => { setInternalOpen(v); onOpenChange?.(v); };
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ asChild, children }: { asChild?: boolean; children?: React.ReactNode }) {
  const { setOpen } = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: () => setOpen(true)
    });
  }
  return <button onClick={() => setOpen(true)}>{children}</button>;
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function DialogOverlay({ className }: { className?: string }) {
  const { setOpen } = React.useContext(DialogContext);
  return (
    <div
      className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
      onClick={() => setOpen(false)}
    />
  );
}

function DialogContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { open, setOpen } = React.useContext(DialogContext);
  if (!open) return null;
  return (
    <>
      <DialogOverlay />
      <div className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border p-6 shadow-lg",
        "border-slate-200 bg-white text-slate-900",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
        className
      )}>
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  );
}

function DialogHeader({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)}>{children}</div>;
}

function DialogTitle({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>;
}

function DialogDescription({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <p className={cn("text-sm text-slate-500 dark:text-slate-400", className)}>{children}</p>;
}

function DialogFooter({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)}>{children}</div>;
}

function DialogClose({ asChild, children, className }: { asChild?: boolean; children?: React.ReactNode; className?: string }) {
  const { setOpen } = React.useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: () => setOpen(false)
    });
  }
  return <button className={className} onClick={() => setOpen(false)}>{children}</button>;
}

export { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose }
