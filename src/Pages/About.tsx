import React from 'react';
import { Info, Shield, Zap, Lock, Wifi, Code, Heart, User } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

export default function About() {
  const isDark = useTheme();

  const features = [
    {
      icon: Zap,
      title: '100% Client-Side',
      description: 'All computations run entirely in your browser. No server required, no waiting for API responses.'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Zero data transmission. Your network data never leaves your device. No tracking, no analytics, no telemetry.'
    },
    {
      icon: Wifi,
      title: 'Offline Capable',
      description: 'Works without internet once loaded. Perfect for air-gapped networks and restricted environments.'
    },
    {
      icon: Shield,
      title: 'Open Architecture',
      description: 'Transparent codebase. Review, audit, and verify the code yourself. No hidden functionality.'
    },
    {
      icon: Code,
      title: 'Modern Stack',
      description: 'Built with React, modern JavaScript, and follows web standards. Fast, responsive, and accessible.'
    },
    {
      icon: Heart,
      title: 'Made for Engineers',
      description: 'Designed by network professionals for network professionals. Real tools for real work.'
    }
  ];

  const tools = [
    'Subnet Calculator (IPv4/IPv6)',
    'VLSM Planner & CIDR Aggregator',
    'IP Utilities & Binary Converter',
    'VLAN & MTU Calculator',
    'Bandwidth & QoS Calculator',
    'Packet Overhead Analyzer',
    'Routing Configuration Generator',
    'WiFi Channel Analyzer',
    'IPv6 Address Generator',
    'DNS Lookup (DoH)',
    'Port & Protocol Reference',
    'MAC/OUI Lookup',
    'ACL/Firewall Builder',
    'Password & Hash Tools',
    'Visual Subnet Mapping',
    'Config Templates',
    'Batch Processor',
    'Troubleshooting Guide',
    'Documentation & Reference'
  ];

  return (
    <ToolPageWrapper
      title="About NetTools"
      description="Professional network engineering toolbox for privacy-conscious professionals"
      icon={Info}
    >
      <div className="space-y-8">
        {/* Hero */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-6">
            <Shield className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">Privacy-First Engineering</span>
          </div>
          <p className={`text-lg max-w-3xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            NetTools is a comprehensive network engineering toolbox that runs entirely in your browser. 
            No backend servers, no data transmission, no compromises on privacy.
          </p>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div key={i} className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tools List */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h2 className="text-2xl font-bold mb-6">Included Tools</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-500" />
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{tool}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technology */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-2 text-cyan-400">Frontend</h3>
              <ul className={`space-y-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <li>• React 18</li>
                <li>• Tailwind CSS</li>
                <li>• shadcn/ui Components</li>
                <li>• Lucide Icons</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-cyan-400">Features</h3>
              <ul className={`space-y-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <li>• Local Storage API</li>
                <li>• DNS-over-HTTPS</li>
                <li>• Crypto API (RNG)</li>
                <li>• Service Worker Ready</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-cyan-400">Standards</h3>
              <ul className={`space-y-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <li>• WCAG 2.1 Compliant</li>
                <li>• Progressive Web App</li>
                <li>• Responsive Design</li>
                <li>• Zero Dependencies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Statement */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
          <h2 className="text-2xl font-bold mb-4 text-green-400">Privacy Commitment</h2>
          <div className={`space-y-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <p>
              <strong>NetTools is built with privacy as the foundation.</strong> Every single calculation, 
              conversion, and operation happens entirely within your browser using JavaScript.
            </p>
            <ul className={`space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <li>✓ <strong>No backend servers</strong> - Runs purely client-side</li>
              <li>✓ <strong>No data transmission</strong> - Your inputs never leave your device</li>
              <li>✓ <strong>No analytics or tracking</strong> - We don't know who you are or what you calculate</li>
              <li>✓ <strong>No cookies</strong> - Only localStorage for your preferences (stays local)</li>
              <li>✓ <strong>No external API calls</strong> - Except optional DNS lookups (DoH) which you control</li>
              <li>✓ <strong>Open source ready</strong> - Code can be audited and verified</li>
            </ul>
            <p className="pt-4">
              Perfect for security-conscious organizations, air-gapped networks, and anyone who values privacy.
            </p>
          </div>
        </div>

        {/* Use Cases */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h2 className="text-2xl font-bold mb-6">Ideal For</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <h3 className="font-semibold mb-2 text-cyan-400">Network Engineers</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Quick calculations for subnet planning, VLAN design, and capacity planning during network design and deployment.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <h3 className="font-semibold mb-2 text-cyan-400">IT Professionals</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Troubleshooting tools, port references, and configuration templates for daily network administration.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <h3 className="font-semibold mb-2 text-cyan-400">Security Teams</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ACL builders, firewall rule generators, and security-focused tools with zero data leakage.
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <h3 className="font-semibold mb-2 text-cyan-400">Students & Educators</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Learning tools with documentation, examples, and references for networking education.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className="text-4xl font-bold text-cyan-400 mb-2">22+</p>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Professional Tools</p>
          </div>
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className="text-4xl font-bold text-cyan-400 mb-2">0</p>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Data Transmitted</p>
          </div>
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className="text-4xl font-bold text-cyan-400 mb-2">100%</p>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Free & Open</p>
          </div>
        </div>

        {/* Author */}
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-cyan-500/20' : 'bg-slate-50 border-cyan-200'}`}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <User className="h-6 w-6 text-cyan-400" />
            Author
          </h2>
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 flex-shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold">Anas TAGUI</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Designer &amp; Developer of NetTools
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Built this toolbox to give network engineers a fast, private, and offline-capable workspace —
                no cloud dependencies, no data collection, just the tools you need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolPageWrapper>
  );
}