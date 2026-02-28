import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Link } from 'react-router-dom';
import { Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFavorites, toggleFavorite, isFavorite } from '@/components/utils/storage';
import { cn, createPageUrl } from "@/lib/utils";

export default function FavoritesBar({ currentPath }) {
  const [favorites, setFavorites] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const isDark = useTheme();

  useEffect(() => {
    setFavorites(getFavorites());
    setIsFav(isFavorite(currentPath));
  }, [currentPath]);

  const handleToggle = () => {
    const newFavorites = toggleFavorite(currentPath);
    setFavorites(newFavorites);
    setIsFav(!isFav);
  };

  const allTools = [
    { name: 'Subnet Calculator', path: 'SubnetCalculator' },
    { name: 'VLSM Planner', path: 'VLSMPlanner' },
    { name: 'CIDR Aggregator', path: 'CIDRAggregator' },
    { name: 'IP Utilities', path: 'IPUtilities' },
    { name: 'Binary Converter', path: 'BinaryConverter' },
    { name: 'VLAN Planner', path: 'VLANPlanner' },
    { name: 'MTU Calculator', path: 'MTUCalculator' },
    { name: 'Bandwidth Calculator', path: 'BandwidthCalculator' },
    { name: 'QoS Calculator', path: 'QoSCalculator' },
    { name: 'Packet Analyzer', path: 'PacketAnalyzer' },
    { name: 'Routing Config', path: 'RoutingCalculator' },
    { name: 'WiFi Analyzer', path: 'WifiAnalyzer' },
    { name: 'IPv6 Generator', path: 'IPv6Generator' },
    { name: 'Port Scanner', path: 'PortScanner' },
    { name: 'DNS Lookup', path: 'DNSLookup' },
    { name: 'Ping Tool', path: 'PingTool' },
    { name: 'ACL Builder', path: 'ACLBuilder' },
    { name: 'Password Tools', path: 'PasswordTools' },
    { name: 'Visual Subnet Map', path: 'VisualSubnetMap' },
    { name: 'MAC Lookup', path: 'MACLookup' },
    { name: 'Port Reference', path: 'PortReference' },
    { name: 'Documentation', path: 'Documentation' },
    { name: 'Config Templates', path: 'ConfigTemplates' },
    { name: 'Batch Processor', path: 'BatchProcessor' },
    { name: 'Troubleshooting', path: 'Troubleshooting' },
    { name: 'About', path: 'About' },
    { name: 'Settings', path: 'Settings' },
  ];

  const favoriteTools = allTools.filter(tool => favorites.includes(tool.path));

  if (currentPath === '/dashboard' || currentPath === '/') return null;

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 border-b",
      isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"
    )}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={cn(
          isFav && "text-yellow-500 hover:text-yellow-600"
        )}
      >
        {isFav ? (
          <Star className="h-4 w-4 fill-current" />
        ) : (
          <StarOff className="h-4 w-4" />
        )}
      </Button>

      {favoriteTools.length > 0 && (
        <>
          <div className={cn("h-4 w-px", isDark ? "bg-slate-700" : "bg-slate-200")} />
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {favoriteTools.map(tool => (
              <Link
                key={tool.path}
                to={createPageUrl(tool.path)}
                className={cn(
                  "px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-colors",
                  currentPath === tool.path
                    ? isDark 
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-cyan-50 text-cyan-600"
                    : isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                )}
              >
                {tool.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}