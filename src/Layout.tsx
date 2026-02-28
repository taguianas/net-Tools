import React, { useState, useLayoutEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn, createPageUrl } from "@/lib/utils";
import { useTheme } from '@/lib/useTheme';
import { Toaster } from 'sonner';
import CommandPalette from './components/features/CommandPalette'; // Removed .jsx extension for cleanliness
import FavoritesBar from './components/features/FavoritesBar';
import QuickCalc from './components/features/QuickCalc';
import PWAInstallPrompt from './components/features/PWAInstallPrompt';
import ConnectionStatus from './components/features/ConnectionStatus';
import { 
  Network, Sun, Moon, Menu, X, Home, Calculator, 
  Globe, Shield, Activity, Settings, Layers, Search,
  Server, Wifi, Database, Terminal, Zap, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navCategories = [
  {
    name: 'Dashboard',
    icon: Home,
    path: 'Dashboard'
  },
  {
    name: 'Core Tools',
    icon: Calculator,
    items: [
      { name: 'Subnet Calculator', path: 'SubnetCalculator' },
      { name: 'VLSM Planner', path: 'VLSMPlanner' },
      { name: 'CIDR Aggregator', path: 'CIDRAggregator' },
      { name: 'IP Utilities', path: 'IPUtilities' },
      { name: 'Binary Converter', path: 'BinaryConverter' },
    ]
  },
  {
    name: 'Planning',
    icon: Layers,
    items: [
      { name: 'VLAN Planner', path: 'VLANPlanner' },
      { name: 'MTU Calculator', path: 'MTUCalculator' },
      { name: 'Bandwidth Calculator', path: 'BandwidthCalculator' },
      { name: 'QoS Calculator', path: 'QoSCalculator' },
      { name: 'Packet Analyzer', path: 'PacketAnalyzer' },
      { name: 'Routing Config', path: 'RoutingCalculator' },
      { name: 'WiFi Analyzer', path: 'WifiAnalyzer' },
      { name: 'IPv6 Generator', path: 'IPv6Generator' },
    ]
  },
  {
    name: 'Testing',
    icon: Activity,
    items: [
      { name: 'Port Scanner', path: 'PortScanner' },
      { name: 'DNS Lookup', path: 'DNSLookup' },
      { name: 'Ping Tool', path: 'PingTool' },
    ]
  },
  {
    name: 'Security',
    icon: Shield,
    items: [
      { name: 'ACL/Firewall Builder', path: 'ACLBuilder' },
      { name: 'Password Tools', path: 'PasswordTools' },
    ]
  },
  {
    name: 'Visualization',
    icon: Network,
    items: [
      { name: 'Visual Subnet Map', path: 'VisualSubnetMap' },
    ]
  },
  {
    name: 'Reference',
    icon: Database,
    items: [
      { name: 'MAC/OUI Lookup', path: 'MACLookup' },
      { name: 'Port Reference', path: 'PortReference' },
      { name: 'Documentation', path: 'Documentation' },
      { name: 'Config Templates', path: 'ConfigTemplates' },
    ]
  },
  {
    name: 'Utilities',
    icon: Zap,
    items: [
      { name: 'Batch Processor', path: 'BatchProcessor' },
      { name: 'Troubleshooting', path: 'Troubleshooting' },
    ]
  },
  {
    name: 'Settings',
    icon: Settings,
    path: 'Settings'
  },
  {
    name: 'About',
    icon: Info,
    path: 'About'
  }
];

export default function Layout() {
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Core Tools');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize theme from localStorage/system preference once, before first paint
  useLayoutEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  // Reactively observe the dark class — updates whenever anything changes it
  const isDark = useTheme();

  const toggleTheme = () => {
    const newDark = !isDark;
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  // Helper to check if a path is active
  const isActive = (path: string) => {
    const pageUrl = createPageUrl(path);
    // Handle home page/dashboard specifically if needed
    if (path === 'Dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    return location.pathname === pageUrl;
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", 
      isDark ? "bg-[#050811] text-slate-50" : "bg-slate-50 text-slate-900"
    )}>
      <CommandPalette />
      
      {/* Background Effects */}
      {isDark ? (
        <>
          <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.08] rounded-full blur-[140px] pointer-events-none animate-pulse" />
          <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/[0.08] rounded-full blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/[0.04] rounded-full blur-[160px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-cyan-400/[0.05] rounded-full blur-[140px] pointer-events-none" />
          <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/[0.05] rounded-full blur-[140px] pointer-events-none" />
        </>
      )}
      
      <style>{`
        :root { --accent: #06b6d4; --accent-glow: rgba(6, 182, 212, 0.3); }
        .dark { --bg-primary: #050811; --bg-secondary: #0a0f1e; --border: #1e293b; }
        :not(.dark) { --bg-primary: #ffffff; --bg-secondary: #fafbfc; --border: #e2e8f0; }
        .nav-item-active {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05));
          border-left: 3px solid var(--accent);
          box-shadow: inset 0 0 20px rgba(6, 182, 212, 0.1);
        }
      `}</style>

      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between",
        "border-b backdrop-blur-xl transition-all duration-500",
        isDark ? "bg-[#0a0f1e]/85 border-slate-800/40 shadow-lg shadow-black/20" : "bg-white/90 border-slate-200/60 shadow-sm"
      )}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
              <Network className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">NetTools</h1>
              <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Network Engineering Toolbox</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
             <div className={cn("hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all", isDark ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200")}>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            100% Client-Side
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 bottom-0 w-64 z-40 overflow-y-auto transition-all duration-300 border-r backdrop-blur-xl",
        isDark ? "bg-[#0a0f1e]/95 border-slate-800/40 shadow-2xl shadow-black/30" : "bg-white/95 border-slate-200/60 shadow-lg",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <nav className="p-3 space-y-1">
          {navCategories.map((category) => (
            <div key={category.name}>
              {category.path ? (
                <Link
                  to={createPageUrl(category.path)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive(category.path) && "nav-item-active",
                    isDark ? "hover:bg-cyan-500/10 text-slate-200" : "hover:bg-cyan-50 text-slate-700"
                  )}
                >
                  <category.icon className={cn("h-5 w-5", isActive(category.path) ? "text-cyan-400" : (isDark ? "text-slate-400" : "text-slate-500"))} />
                  <span className="font-medium">{category.name}</span>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all",
                      isDark ? "hover:bg-cyan-500/10 text-slate-200" : "hover:bg-cyan-50 text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <category.icon className={cn("h-5 w-5", isDark ? "text-slate-400" : "text-slate-500")} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <svg className={cn("h-4 w-4 transition-transform", expandedCategory === category.name && "rotate-180", isDark ? "text-slate-400" : "text-slate-500")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedCategory === category.name && category.items && (
                    <div className={cn("ml-4 pl-4 border-l space-y-1 mt-1", isDark ? "border-slate-700/50" : "border-slate-300")}>
                      {category.items.map((item) => (
                        <Link
                          key={item.path}
                          to={createPageUrl(item.path)}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "block px-3 py-2 rounded-lg text-sm transition-all",
                            isActive(item.path)
                              ? isDark ? "text-cyan-400 bg-cyan-500/15 border border-cyan-500/20 font-medium" : "text-cyan-700 bg-cyan-50 border border-cyan-200 font-medium"
                              : isDark ? "text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10" : "text-slate-600 hover:text-cyan-700 hover:bg-cyan-50"
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Favorites Bar */}
      <div className="lg:pl-64 pt-16 fixed left-0 right-0 z-30">
        <FavoritesBar currentPath={location.pathname} />
      </div>

      {/* FIX 2: Replaced {children} with <Outlet /> to render nested routes */}
      <main className="lg:pl-64 pt-16 min-h-screen" style={{ paddingTop: location.pathname !== '/' && location.pathname !== '/dashboard' ? '7rem' : '4rem' }}>
        <div className="p-4 md:p-6 lg:p-8">
           <Outlet />
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <QuickCalc />
      <PWAInstallPrompt />
      <ConnectionStatus />
      <Toaster theme={isDark ? 'dark' : 'light'} position="bottom-right" richColors closeButton />
    </div>
  );
}