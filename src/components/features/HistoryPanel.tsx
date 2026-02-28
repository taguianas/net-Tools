import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { History, Trash2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getHistory, clearHistory } from '@/components/utils/storage';
import { cn } from '@/lib/utils';

export default function HistoryPanel({ toolName, onSelect }) {
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const isDark = useTheme();

  useEffect(() => {
    loadHistory();
  }, [toolName]);

  const loadHistory = () => {
    const h = getHistory(toolName);
    setHistory(h);
  };

  const handleClear = () => {
    if (confirm('Clear all history for this tool?')) {
      clearHistory(toolName);
      setHistory([]);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (history.length === 0) return null;

  return (
    <div className={cn(
      "fixed right-0 top-16 bottom-0 z-40 w-80 transition-transform duration-300",
      isDark ? "bg-slate-900 border-l border-slate-800" : "bg-white border-l border-slate-200",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-10 top-4 rounded-l-lg rounded-r-none"
      >
        {isOpen ? <X className="h-4 w-4" /> : <History className="h-4 w-4" />}
      </Button>

      {/* Content */}
      <div className="h-full flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-500" />
            <h3 className="font-semibold">History</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 className="h-4 w-4 text-red-400" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {history.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelect(item)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-colors",
                isDark 
                  ? "bg-slate-800 hover:bg-slate-700" 
                  : "bg-slate-50 hover:bg-slate-100"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <p className={cn(
                  "text-sm font-medium",
                  isDark ? "text-cyan-400" : "text-cyan-600"
                )}>
                  {item.label || 'Calculation'}
                </p>
                <span className={cn(
                  "text-xs",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}>
                  {formatDate(item.timestamp)}
                </span>
              </div>
              {item.summary && (
                <p className={cn(
                  "text-xs line-clamp-2",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}>
                  {item.summary}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}