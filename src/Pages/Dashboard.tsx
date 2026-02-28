import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Link } from 'react-router-dom';
import { cn, createPageUrl } from '@/lib/utils';
import { 
  Calculator, Globe, Layers, Activity, Database, Search,
  Network, Server, Wifi, Shield, Terminal, ArrowRight,
  Zap, Lock, Cpu, FileText, List, Route
} from 'lucide-react';
import { Input } from '@/components/ui/SimpleUI.tsx';
import { Badge } from '@/components/ui/SimpleUI.tsx';
import { motion } from 'framer-motion';

const tools = [
  {
    category: 'Core Tools',
    icon: Calculator,
    color: 'from-cyan-500 to-blue-600',
    items: [
      { 
        name: 'Subnet Calculator', 
        path: 'SubnetCalculator', 
        description: 'Calculate IPv4/IPv6 subnets, network addresses, and host ranges',
        tags: ['IPv4', 'IPv6', 'CIDR']
      },
      { 
        name: 'VLSM Planner', 
        path: 'VLSMPlanner', 
        description: 'Variable Length Subnet Masking for efficient IP allocation',
        tags: ['Subnetting', 'Planning']
      },
      { 
        name: 'CIDR Aggregator', 
        path: 'CIDRAggregator', 
        description: 'Optimize routing tables by aggregating subnets into supernets',
        tags: ['CIDR', 'Routing', 'Optimization']
      },
      { 
        name: 'IP Utilities', 
        path: 'IPUtilities', 
        description: 'Address compression, EUI-64 generation, wildcard masks',
        tags: ['IPv6', 'MAC', 'Wildcard']
      },
      { 
        name: 'Binary Converter', 
        path: 'BinaryConverter', 
        description: 'Convert between decimal, binary, hex for IPs and numbers',
        tags: ['Binary', 'Hex', 'Conversion']
      },
    ]
  },
  {
    category: 'Planning',
    icon: Layers,
    color: 'from-violet-500 to-purple-600',
    items: [
      { 
        name: 'VLAN Planner', 
        path: 'VLANPlanner', 
        description: 'Design VLANs with vendor-specific configuration templates',
        tags: ['Cisco', 'Juniper', 'Config']
      },
      { 
        name: 'MTU Calculator', 
        path: 'MTUCalculator', 
        description: 'Calculate MTU, MSS, and fragmentation overhead',
        tags: ['MTU', 'Fragmentation']
      },
      { 
        name: 'Bandwidth Calculator', 
        path: 'BandwidthCalculator', 
        description: 'Calculate transfer times, link utilization, and capacity planning',
        tags: ['Bandwidth', 'Capacity', 'Performance']
      },
      { 
        name: 'QoS Calculator', 
        path: 'QoSCalculator', 
        description: 'Plan Quality of Service bandwidth allocation and queue management',
        tags: ['QoS', 'Traffic', 'Priority']
      },
      { 
        name: 'Packet Analyzer', 
        path: 'PacketAnalyzer', 
        description: 'Calculate protocol overhead and bandwidth usage',
        tags: ['Packets', 'Overhead', 'Analysis']
      },
      { 
        name: 'Routing Config', 
        path: 'RoutingCalculator', 
        description: 'Generate routing configurations for static and dynamic protocols',
        tags: ['Routing', 'OSPF', 'EIGRP']
      },
      { 
        name: 'WiFi Analyzer', 
        path: 'WifiAnalyzer', 
        description: 'Optimize WiFi channel selection and avoid interference',
        tags: ['WiFi', 'Wireless', 'Channels']
      },
      { 
        name: 'IPv6 Generator', 
        path: 'IPv6Generator', 
        description: 'Generate random IPv6 addresses for testing and development',
        tags: ['IPv6', 'Generator', 'Testing']
      },
    ]
  },
  {
    category: 'Testing',
    icon: Activity,
    color: 'from-emerald-500 to-teal-600',
    items: [
      { 
        name: 'Port Scanner', 
        path: 'PortScanner', 
        description: 'Reference for common ports and services',
        tags: ['Ports', 'Services']
      },
      { 
        name: 'DNS Lookup', 
        path: 'DNSLookup', 
        description: 'Query DNS records using DNS-over-HTTPS',
        tags: ['DNS', 'DoH', 'Records']
      },
      { 
        name: 'Ping Tool', 
        path: 'PingTool', 
        description: 'Network connectivity and latency testing guide',
        tags: ['ICMP', 'Latency']
      },
    ]
  },
  {
    category: 'Security',
    icon: Shield,
    color: 'from-rose-500 to-pink-600',
    items: [
      { 
        name: 'ACL/Firewall Builder', 
        path: 'ACLBuilder', 
        description: 'Generate access control lists for routers and firewalls',
        tags: ['ACL', 'Firewall', 'Security']
      },
      { 
        name: 'Password Tools', 
        path: 'PasswordTools', 
        description: 'Generate passwords and work with Cisco hashes',
        tags: ['Password', 'Hash', 'Cisco']
      },
    ]
  },
  {
    category: 'Visualization',
    icon: Network,
    color: 'from-teal-500 to-emerald-600',
    items: [
      { 
        name: 'Visual Subnet Map', 
        path: 'VisualSubnetMap', 
        description: 'Interactive visual representation of subnet allocation',
        tags: ['Visualization', 'Subnetting', 'Planning']
      },
    ]
  },
  {
    category: 'Reference',
    icon: Database,
    color: 'from-amber-500 to-orange-600',
    items: [
      { 
        name: 'MAC/OUI Lookup', 
        path: 'MACLookup', 
        description: 'Identify device manufacturers from MAC addresses',
        tags: ['MAC', 'Vendor', 'OUI']
      },
      { 
        name: 'Port Reference', 
        path: 'PortReference', 
        description: 'Comprehensive list of well-known ports and protocols',
        tags: ['TCP', 'UDP', 'Protocols']
      },
      { 
        name: 'Documentation', 
        path: 'Documentation', 
        description: 'Quick reference guide for networking concepts',
        tags: ['Docs', 'Learning', 'Reference']
      },
      { 
        name: 'Config Templates', 
        path: 'ConfigTemplates', 
        description: 'Ready-to-use configuration templates for common scenarios',
        tags: ['Templates', 'Cisco', 'Juniper']
      },
    ]
  },
  {
    category: 'Utilities',
    icon: Zap,
    color: 'from-indigo-500 to-purple-600',
    items: [
      { 
        name: 'Batch Processor', 
        path: 'BatchProcessor', 
        description: 'Process multiple IPs, subnets, or MAC addresses at once',
        tags: ['Batch', 'Bulk', 'CSV']
      },
      { 
        name: 'Troubleshooting', 
        path: 'Troubleshooting', 
        description: 'Step-by-step solutions for common network problems',
        tags: ['Help', 'Debug', 'Solutions']
      },
    ]
  }
];

const features = [
  { icon: Zap, title: '100% Client-Side', desc: 'All computations run in your browser' },
  { icon: Lock, title: 'Privacy First', desc: 'Zero data transmission or tracking' },
  { icon: Wifi, title: 'Offline Ready', desc: 'Works without internet connection' },
  { icon: Cpu, title: 'Fast & Lightweight', desc: 'No backend delays or dependencies' },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentTools, setRecentTools] = useState([]);
  const isDark = useTheme();

  useEffect(() => {
    const saved = localStorage.getItem('recentTools');
    if (saved) setRecentTools(JSON.parse(saved));
  }, []);

  const allTools = tools.flatMap(cat => 
    cat.items.map(item => ({ ...item, category: cat.category, color: cat.color }))
  );

  const filteredTools = searchQuery
    ? allTools.filter(tool => 
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : null;

  const saveRecentTool = (toolPath) => {
    const updated = [toolPath, ...recentTools.filter(t => t !== toolPath)].slice(0, 5);
    setRecentTools(updated);
    localStorage.setItem('recentTools', JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* Animated mesh gradient background */}
      <div className="fixed inset-0 gradient-animate opacity-[0.03] pointer-events-none -z-10" />
      {isDark ? (
        <>
          <div className="fixed top-20 right-20 w-[500px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
          <div className="fixed bottom-20 left-20 w-[500px] h-[500px] bg-blue-500/[0.06] rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
        </>
      ) : (
        <>
          <div className="fixed top-20 right-20 w-[400px] h-[400px] bg-cyan-300/[0.08] rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="fixed bottom-20 left-20 w-[400px] h-[400px] bg-blue-300/[0.08] rounded-full blur-[100px] pointer-events-none -z-10" />
        </>
      )}
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 md:py-12 relative"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-6 pulse-subtle"
        >
          <Network className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-400">Network Engineering Toolbox</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent",
            isDark
              ? "bg-gradient-to-r from-slate-50 via-cyan-200 to-blue-400"
              : "bg-gradient-to-r from-slate-900 via-cyan-600 to-blue-600"
          )}
        >
          Professional Network Tools
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "text-lg max-w-2xl mx-auto mb-8",
            isDark ? 'text-slate-400' : 'text-slate-600'
          )}
        >
          Fast, private, and always available. All tools run entirely in your browser with zero data transmission.
        </motion.p>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative max-w-xl mx-auto"
        >
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <Input
            type="text"
            placeholder="Search tools... (e.g., subnet, VLAN, DNS)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-12 pr-4 py-6 rounded-2xl text-lg border-2 transition-all focus:ring-2 focus:ring-cyan-500/50",
              isDark 
                ? 'bg-slate-900/50 border-slate-700 focus:border-cyan-500 focus:bg-slate-900' 
                : 'bg-white border-slate-200 focus:border-cyan-500',
              searchQuery && 'glow'
            )}
          />
        </motion.div>
      </motion.div>

      {/* Features Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={cn(
          "grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl",
          isDark 
            ? 'glass neon-border shadow-2xl shadow-cyan-500/5' 
            : 'glass-light neon-border-light shadow-lg'
        )}
      >
        {features.map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + (i * 0.05) }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 p-3 cursor-default"
          >
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "p-2 rounded-lg transition-all",
                isDark 
                  ? 'bg-slate-800/50 border border-slate-700/50' 
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200'
              )}
            >
              <feature.icon className={cn(
                "h-5 w-5",
                isDark ? "text-cyan-400" : "text-cyan-600"
              )} />
            </motion.div>
            <div>
              <p className="font-medium text-sm">{feature.title}</p>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search Results */}
      {filteredTools && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold">
            Search Results ({filteredTools.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard 
                key={tool.path} 
                tool={tool} 
                isDark={isDark}
                onLaunch={() => saveRecentTool(tool.path)}
              />
            ))}
          </div>
          {filteredTools.length === 0 && (
            <div className={`text-center py-12 rounded-2xl ${isDark ? 'bg-slate-900/50' : 'bg-slate-100'}`}>
              <Search className="h-12 w-12 mx-auto mb-4 text-slate-500" />
              <p className="text-lg font-medium">No tools found</p>
              <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>Try a different search term</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Recent Tools */}
      {!filteredTools && recentTools.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className={cn(
            "text-lg font-semibold flex items-center gap-2",
            isDark ? "text-slate-200" : "text-slate-800"
          )}>
            <Terminal className={cn("h-5 w-5", isDark ? "text-cyan-400" : "text-cyan-600")} />
            Recently Used
          </h2>
          <div className="flex flex-wrap gap-3">
            {recentTools.map((path, index) => {
              const tool = allTools.find(t => t.path === path);
              if (!tool) return null;
              return (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={createPageUrl(path)}
                    className={cn(
                      "group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:scale-105 relative overflow-hidden",
                      isDark 
                        ? 'glass border border-slate-700/50 hover:border-cyan-500/30 shadow-lg shadow-black/20' 
                        : 'glass-light border border-slate-200 hover:border-cyan-400/40 shadow-md hover:shadow-lg'
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
                    <span className={cn(
                      "relative font-medium text-sm",
                      isDark ? "text-slate-200 group-hover:text-cyan-300" : "text-slate-700 group-hover:text-cyan-700"
                    )}>{tool.name}</span>
                    <ArrowRight className={cn(
                      "h-4 w-4 transition-all group-hover:translate-x-1",
                      isDark ? "text-cyan-400" : "text-cyan-600"
                    )} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Tool Categories */}
      {!filteredTools && tools.map((category, catIndex) => (
        <motion.div 
          key={category.category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: catIndex * 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-br ${category.color}`}>
              <category.icon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">{category.category}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.items.map((tool) => (
              <ToolCard 
                key={tool.path} 
                tool={{ ...tool, color: category.color }} 
                isDark={isDark}
                onLaunch={() => saveRecentTool(tool.path)}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ToolCard({ tool, isDark, onLaunch }) {
  return (
    <Link
      to={createPageUrl(tool.path)}
      onClick={onLaunch}
    >
      <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "group relative p-6 rounded-2xl transition-all duration-300 overflow-hidden card-3d card-elevated",
          isDark 
            ? 'glass neon-border' 
            : 'glass-light neon-border-light'
        )}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="shimmer h-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold group-hover:text-cyan-400 transition-colors">
              {tool.name}
            </h3>
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ArrowRight className="h-5 w-5 text-cyan-400" />
            </motion.div>
          </div>
          <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500'} transition-colors`}>
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {tool.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className={cn(
                  "text-xs transition-all",
                  isDark 
                    ? 'bg-slate-800 text-slate-300 border-slate-700 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30' 
                    : 'bg-slate-100 text-slate-600 group-hover:bg-cyan-50 group-hover:border-cyan-400/50'
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}