import React, { useState } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ResultCard({ label, value, copyable = true, className = '' }) {
  const [copied, setCopied] = useState(false);
  const isDark = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    // Toast notification handled by Sonner via Toaster in Layout
  };

  return (
    <div className={cn(
      "p-4 rounded-xl transition-all hover:scale-[1.02] cursor-default relative overflow-hidden group",
      isDark 
        ? "bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800/40 hover:border-cyan-500/30 shadow-lg shadow-black/20" 
        : "bg-white/60 hover:bg-white border border-slate-200/60 hover:border-cyan-400/30 shadow-sm hover:shadow-md",
      className
    )}>
      <div className="flex items-center justify-between mb-1">
        <span className={cn("text-xs font-medium uppercase tracking-wider", 
          isDark ? "text-slate-500" : "text-slate-400"
        )}>
          {label}
        </span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className={cn(
              "h-6 px-2 text-xs transition-all",
              copied && "bg-green-500/20 text-green-500"
            )}
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      <p className={cn("font-mono text-lg font-medium break-all transition-colors",
        isDark ? "text-cyan-400" : "text-cyan-600"
      )}>
        {value || '—'}
      </p>
    </div>
  );
}