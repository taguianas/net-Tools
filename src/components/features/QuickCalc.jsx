import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Calculator, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function ipToLong(ip) {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function longToIp(long) {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
}

function quickCalc(input) {
  const cidrMatch = input.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
  if (cidrMatch) {
    const [, ip, cidr] = cidrMatch;
    const c = parseInt(cidr);
    const mask = (~0 << (32 - c)) >>> 0;
    const network = (ipToLong(ip) & mask) >>> 0;
    const hosts = Math.pow(2, 32 - c) - 2;
    return `${longToIp(network)}/${cidr} → ${hosts.toLocaleString()} hosts`;
  }

  const ipMatch = input.match(/^(\d+\.\d+\.\d+\.\d+)$/);
  if (ipMatch) {
    const binary = input.split('.').map(n => parseInt(n).toString(2).padStart(8, '0')).join('.');
    return `Binary: ${binary}`;
  }

  return null;
}

export default function QuickCalc() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const isDark = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const calc = quickCalc(input);
    setResult(calc || '');
  }, [input]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg border transition-colors",
          isDark
            ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-cyan-500/50"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-cyan-400/50"
        )}
      >
        <Calculator className="h-4 w-4 text-cyan-500" />
        Quick Calc
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-40 w-80 rounded-xl shadow-2xl p-4",
      isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-cyan-500" />
          <span className="font-semibold">Quick Calculator</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="192.168.1.0/24 or IP..."
        className={`mb-2 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
        autoFocus
      />

      {result && (
        <div className={`p-3 rounded-lg font-mono text-sm ${
          isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-50 text-cyan-600'
        }`}>
          {result}
        </div>
      )}

      <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Tip: ⌘ / to toggle
      </p>
    </div>
  );
}