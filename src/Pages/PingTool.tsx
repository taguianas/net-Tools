import React, { useState, useEffect } from 'react';
import { Activity, Info, Terminal, ExternalLink, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const commands = {
  ping: {
    windows: 'ping -n 10 {host}',
    linux: 'ping -c 10 {host}',
    macos: 'ping -c 10 {host}',
    description: 'Send ICMP echo requests to test connectivity and measure latency'
  },
  traceroute: {
    windows: 'tracert {host}',
    linux: 'traceroute {host}',
    macos: 'traceroute {host}',
    description: 'Trace the route packets take to reach the destination'
  },
  mtr: {
    windows: 'pathping {host}',
    linux: 'mtr {host}',
    macos: 'mtr {host}',
    description: 'Combined ping and traceroute with continuous updates'
  },
  nslookup: {
    windows: 'nslookup {host}',
    linux: 'nslookup {host}',
    macos: 'nslookup {host}',
    description: 'Query DNS servers for domain information'
  },
  curl: {
    windows: 'curl -I {host}',
    linux: 'curl -I {host}',
    macos: 'curl -I {host}',
    description: 'Fetch HTTP headers from a web server'
  },
  netstat: {
    windows: 'netstat -an',
    linux: 'netstat -tuln',
    macos: 'netstat -an',
    description: 'Display active network connections'
  },
  arp: {
    windows: 'arp -a',
    linux: 'arp -a',
    macos: 'arp -a',
    description: 'Display the ARP cache table'
  },
  ifconfig: {
    windows: 'ipconfig /all',
    linux: 'ip addr',
    macos: 'ifconfig',
    description: 'Display network interface configuration'
  }
};

export default function PingTool() {
  const [isDark, setIsDark] = useState(true);
  const [host, setHost] = useState('8.8.8.8');
  const [os, setOs] = useState('linux');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Detect OS
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) setOs('windows');
    else if (userAgent.includes('mac')) setOs('macos');
    else setOs('linux');
  }, []);

  const getCommand = (cmdKey) => {
    const cmd = commands[cmdKey];
    return cmd[os].replace('{host}', host);
  };

  const copyCommand = (cmdKey) => {
    const cmd = getCommand(cmdKey);
    navigator.clipboard.writeText(cmd);
    setCopied(cmdKey);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <ToolPageWrapper
      title="Network Testing Guide"
      description="Command-line tools for network connectivity testing"
      icon={Activity}
      tips={[
        'Browser-based ping is not possible due to security restrictions.',
        'Use the commands below in your terminal for actual network testing.'
      ]}
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-100'
        }`}>
          <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className={isDark ? 'text-amber-100' : 'text-amber-800'}>
              <strong>Note:</strong> Web browsers cannot send ICMP packets or raw network requests due to security sandboxing. 
              This page provides ready-to-use commands for your operating system's terminal.
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Target Host / IP</Label>
            <Input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="8.8.8.8 or google.com"
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <div>
            <Label>Operating System</Label>
            <Tabs value={os} onValueChange={setOs} className="mt-1">
              <TabsList className={isDark ? 'bg-slate-800' : ''}>
                <TabsTrigger value="windows">Windows</TabsTrigger>
                <TabsTrigger value="linux">Linux</TabsTrigger>
                <TabsTrigger value="macos">macOS</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Commands Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(commands).map(([key, cmd]) => (
            <div 
              key={key}
              className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold capitalize">{key}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyCommand(key)}
                  className="h-8"
                >
                  {copied === key ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {cmd.description}
              </p>
              <div className={`p-3 rounded-lg font-mono text-sm ${
                isDark ? 'bg-slate-900 text-cyan-400' : 'bg-white text-cyan-600 border'
              }`}>
                <Terminal className="h-3 w-3 inline mr-2 opacity-50" />
                {getCommand(key)}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Reference */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-4">Quick Reference: Common Targets</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                DNS Servers
              </h4>
              <ul className={`text-sm space-y-1 font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                <li>8.8.8.8 (Google)</li>
                <li>8.8.4.4 (Google)</li>
                <li>1.1.1.1 (Cloudflare)</li>
                <li>1.0.0.1 (Cloudflare)</li>
                <li>9.9.9.9 (Quad9)</li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Testing Endpoints
              </h4>
              <ul className={`text-sm space-y-1 font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                <li>ping.eu</li>
                <li>speedtest.net</li>
                <li>fast.com</li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Useful Flags
              </h4>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <li><code className="text-cyan-400">-c N</code> Count (Linux/Mac)</li>
                <li><code className="text-cyan-400">-n N</code> Count (Windows)</li>
                <li><code className="text-cyan-400">-t</code> Continuous (Windows)</li>
                <li><code className="text-cyan-400">-i N</code> Interval seconds</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Interpreting Results */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-4">Interpreting Ping Results</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-100'}`}>
                <h4 className="font-medium text-green-400 mb-2">Good</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <strong>&lt; 50ms:</strong> Excellent latency<br />
                  <strong>0% loss:</strong> Stable connection
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-100'}`}>
                <h4 className="font-medium text-yellow-400 mb-2">Moderate</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <strong>50-150ms:</strong> Acceptable latency<br />
                  <strong>&lt;5% loss:</strong> Minor issues
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
                <h4 className="font-medium text-red-400 mb-2">Poor</h4>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <strong>&gt;150ms:</strong> High latency<br />
                  <strong>&gt;5% loss:</strong> Connectivity problems
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageWrapper>
  );
}