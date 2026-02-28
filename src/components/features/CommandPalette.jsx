import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { useNavigate } from 'react-router-dom';
import { Search, Command } from 'lucide-react';
import { cn, createPageUrl } from "@/lib/utils";
import { Input } from '@/components/ui/input';

const allTools = [
  { name: 'Subnet Calculator', path: 'SubnetCalculator', category: 'Core' },
  { name: 'VLSM Planner', path: 'VLSMPlanner', category: 'Core' },
  { name: 'CIDR Aggregator', path: 'CIDRAggregator', category: 'Core' },
  { name: 'IP Utilities', path: 'IPUtilities', category: 'Core' },
  { name: 'Binary Converter', path: 'BinaryConverter', category: 'Core' },
  { name: 'VLAN Planner', path: 'VLANPlanner', category: 'Planning' },
  { name: 'MTU Calculator', path: 'MTUCalculator', category: 'Planning' },
  { name: 'Bandwidth Calculator', path: 'BandwidthCalculator', category: 'Planning' },
  { name: 'QoS Calculator', path: 'QoSCalculator', category: 'Planning' },
  { name: 'Packet Analyzer', path: 'PacketAnalyzer', category: 'Planning' },
  { name: 'Routing Config', path: 'RoutingCalculator', category: 'Planning' },
  { name: 'WiFi Analyzer', path: 'WifiAnalyzer', category: 'Planning' },
  { name: 'IPv6 Generator', path: 'IPv6Generator', category: 'Planning' },
  { name: 'Port Scanner', path: 'PortScanner', category: 'Testing' },
  { name: 'DNS Lookup', path: 'DNSLookup', category: 'Testing' },
  { name: 'Ping Tool', path: 'PingTool', category: 'Testing' },
  { name: 'ACL Builder', path: 'ACLBuilder', category: 'Security' },
  { name: 'Password Tools', path: 'PasswordTools', category: 'Security' },
  { name: 'Visual Subnet Map', path: 'VisualSubnetMap', category: 'Visualization' },
  { name: 'MAC Lookup', path: 'MACLookup', category: 'Reference' },
  { name: 'Port Reference', path: 'PortReference', category: 'Reference' },
  { name: 'Documentation', path: 'Documentation', category: 'Reference' },
  { name: 'Config Templates', path: 'ConfigTemplates', category: 'Reference' },
  { name: 'Batch Processor', path: 'BatchProcessor', category: 'Utilities' },
  { name: 'Troubleshooting', path: 'Troubleshooting', category: 'Utilities' },
  { name: 'About', path: 'About', category: 'Info' },
  { name: 'Settings', path: 'Settings', category: 'Settings' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const isDark = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setSelected(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = allTools.filter(tool =>
    tool.name.toLowerCase().includes(query.toLowerCase()) ||
    tool.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (selected >= filtered.length) {
      setSelected(Math.max(0, filtered.length - 1));
    }
  }, [filtered.length, selected]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      navigate(createPageUrl(filtered[selected].path));
      setIsOpen(false);
      setQuery('');
      setSelected(0);
    }
  };

  const handleSelect = (tool) => {
    navigate(createPageUrl(tool.path));
    setIsOpen(false);
    setQuery('');
    setSelected(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      
      <div className={cn(
        "relative w-full max-w-2xl rounded-2xl shadow-2xl",
        isDark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
      )}>
        <div className={cn("flex items-center gap-3 p-4 border-b", isDark ? "border-slate-800" : "border-slate-200")}>
          <Search className="h-5 w-5 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools..."
            className={cn(
              "flex-1 border-0 focus-visible:ring-0 text-lg",
              isDark ? "bg-transparent" : "bg-transparent"
            )}
            autoFocus
          />
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <kbd className={cn("px-2 py-1 rounded", isDark ? "bg-slate-800" : "bg-slate-100")}>
              ↑↓
            </kbd>
            <span>navigate</span>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No tools found</p>
            </div>
          ) : (
            filtered.map((tool, index) => (
              <button
                key={tool.path}
                onClick={() => handleSelect(tool)}
                onMouseEnter={() => setSelected(index)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                  selected === index
                    ? isDark 
                      ? "bg-slate-800 text-cyan-400"
                      : "bg-slate-100 text-cyan-600"
                    : isDark
                      ? "hover:bg-slate-800/50"
                      : "hover:bg-slate-50"
                )}
              >
                <div>
                  <p className="font-medium">{tool.name}</p>
                  <p className={cn("text-sm", isDark ? "text-slate-500" : "text-slate-400")}>
                    {tool.category}
                  </p>
                </div>
                {selected === index && (
                  <kbd className={cn("px-2 py-1 rounded text-xs", isDark ? "bg-slate-700" : "bg-slate-200")}>
                    ↵
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        <div className={cn(
          "flex items-center justify-between p-3 border-t text-xs",
          isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
        )}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Command className="h-3 w-3" />
              <span>+</span>
              <kbd className={cn("px-1.5 py-0.5 rounded", isDark ? "bg-slate-800" : "bg-slate-100")}>K</kbd>
              <span>to open</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className={cn("px-1.5 py-0.5 rounded", isDark ? "bg-slate-800" : "bg-slate-100")}>ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}