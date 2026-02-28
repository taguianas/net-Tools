import React, { useState, useEffect } from 'react';
import { Search, Shield, Info, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const commonPorts = [
  { port: 20, protocol: 'TCP', service: 'FTP Data', description: 'File Transfer Protocol data transfer', security: 'medium' },
  { port: 21, protocol: 'TCP', service: 'FTP Control', description: 'File Transfer Protocol commands', security: 'medium' },
  { port: 22, protocol: 'TCP', service: 'SSH', description: 'Secure Shell', security: 'high' },
  { port: 23, protocol: 'TCP', service: 'Telnet', description: 'Unencrypted text communications', security: 'low' },
  { port: 25, protocol: 'TCP', service: 'SMTP', description: 'Simple Mail Transfer Protocol', security: 'medium' },
  { port: 53, protocol: 'TCP/UDP', service: 'DNS', description: 'Domain Name System', security: 'high' },
  { port: 67, protocol: 'UDP', service: 'DHCP Server', description: 'Dynamic Host Configuration', security: 'medium' },
  { port: 68, protocol: 'UDP', service: 'DHCP Client', description: 'Dynamic Host Configuration', security: 'medium' },
  { port: 69, protocol: 'UDP', service: 'TFTP', description: 'Trivial File Transfer Protocol', security: 'low' },
  { port: 80, protocol: 'TCP', service: 'HTTP', description: 'Hypertext Transfer Protocol', security: 'medium' },
  { port: 110, protocol: 'TCP', service: 'POP3', description: 'Post Office Protocol v3', security: 'low' },
  { port: 123, protocol: 'UDP', service: 'NTP', description: 'Network Time Protocol', security: 'medium' },
  { port: 137, protocol: 'UDP', service: 'NetBIOS Name', description: 'NetBIOS Name Service', security: 'low' },
  { port: 138, protocol: 'UDP', service: 'NetBIOS Datagram', description: 'NetBIOS Datagram Service', security: 'low' },
  { port: 139, protocol: 'TCP', service: 'NetBIOS Session', description: 'NetBIOS Session Service', security: 'low' },
  { port: 143, protocol: 'TCP', service: 'IMAP', description: 'Internet Message Access Protocol', security: 'low' },
  { port: 161, protocol: 'UDP', service: 'SNMP', description: 'Simple Network Management Protocol', security: 'medium' },
  { port: 162, protocol: 'UDP', service: 'SNMP Trap', description: 'SNMP Trap messages', security: 'medium' },
  { port: 389, protocol: 'TCP', service: 'LDAP', description: 'Lightweight Directory Access Protocol', security: 'medium' },
  { port: 443, protocol: 'TCP', service: 'HTTPS', description: 'HTTP over TLS/SSL', security: 'high' },
  { port: 445, protocol: 'TCP', service: 'SMB', description: 'Server Message Block', security: 'medium' },
  { port: 465, protocol: 'TCP', service: 'SMTPS', description: 'SMTP over SSL', security: 'high' },
  { port: 514, protocol: 'UDP', service: 'Syslog', description: 'System Logging Protocol', security: 'medium' },
  { port: 587, protocol: 'TCP', service: 'SMTP Submission', description: 'Email message submission', security: 'high' },
  { port: 636, protocol: 'TCP', service: 'LDAPS', description: 'LDAP over SSL', security: 'high' },
  { port: 993, protocol: 'TCP', service: 'IMAPS', description: 'IMAP over SSL', security: 'high' },
  { port: 995, protocol: 'TCP', service: 'POP3S', description: 'POP3 over SSL', security: 'high' },
  { port: 1433, protocol: 'TCP', service: 'MSSQL', description: 'Microsoft SQL Server', security: 'medium' },
  { port: 1521, protocol: 'TCP', service: 'Oracle', description: 'Oracle Database', security: 'medium' },
  { port: 3306, protocol: 'TCP', service: 'MySQL', description: 'MySQL Database', security: 'medium' },
  { port: 3389, protocol: 'TCP', service: 'RDP', description: 'Remote Desktop Protocol', security: 'medium' },
  { port: 5432, protocol: 'TCP', service: 'PostgreSQL', description: 'PostgreSQL Database', security: 'medium' },
  { port: 5900, protocol: 'TCP', service: 'VNC', description: 'Virtual Network Computing', security: 'medium' },
  { port: 6379, protocol: 'TCP', service: 'Redis', description: 'Redis Database', security: 'medium' },
  { port: 8080, protocol: 'TCP', service: 'HTTP Proxy', description: 'HTTP Proxy/Alternative', security: 'medium' },
  { port: 8443, protocol: 'TCP', service: 'HTTPS Alt', description: 'HTTPS Alternative', security: 'high' },
  { port: 27017, protocol: 'TCP', service: 'MongoDB', description: 'MongoDB Database', security: 'medium' },
];

const portCategories = {
  web: [80, 443, 8080, 8443],
  email: [25, 110, 143, 465, 587, 993, 995],
  database: [1433, 1521, 3306, 5432, 6379, 27017],
  remote: [22, 23, 3389, 5900],
  file: [20, 21, 69, 139, 445],
  dns: [53],
  infrastructure: [67, 68, 123, 161, 162, 389, 514, 636]
};

export default function PortScanner() {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const filteredPorts = commonPorts.filter(port => {
    const matchesSearch = searchQuery === '' || 
      port.port.toString().includes(searchQuery) ||
      port.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      port.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' ||
      (portCategories[selectedCategory] && portCategories[selectedCategory].includes(port.port));

    return matchesSearch && matchesCategory;
  });

  const getSecurityBadge = (security) => {
    const styles = {
      high: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    const labels = {
      high: 'Secure',
      medium: 'Moderate',
      low: 'Insecure'
    };
    return (
      <Badge className={`${styles[security]} border`}>
        <Shield className="h-3 w-3 mr-1" />
        {labels[security]}
      </Badge>
    );
  };

  return (
    <ToolPageWrapper
      title="Port Reference"
      description="Reference guide for common network ports and services"
      icon={Search}
      tips={[
        'Search by port number, service name, or description.',
        'Security ratings indicate whether the protocol uses encryption by default.'
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
              <strong>Note:</strong> Browser-based port scanning is not possible due to security restrictions. 
              This tool provides a reference guide for common ports. For actual port scanning, use command-line tools like <code className="px-1 rounded bg-black/20">nmap</code>.
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ports, services..."
              className={`pl-10 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className={`grid grid-cols-4 ${isDark ? 'bg-slate-800' : ''}`}>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="web">Web</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="remote">Remote</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Ports</p>
            <p className="text-2xl font-bold text-cyan-400">{commonPorts.length}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Shown</p>
            <p className="text-2xl font-bold">{filteredPorts.length}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Secure Protocols</p>
            <p className="text-2xl font-bold text-green-400">
              {commonPorts.filter(p => p.security === 'high').length}
            </p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Insecure Protocols</p>
            <p className="text-2xl font-bold text-red-400">
              {commonPorts.filter(p => p.security === 'low').length}
            </p>
          </div>
        </div>

        {/* Ports Table */}
        <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white'}`}>
          <Table>
            <TableHeader>
              <TableRow className={isDark ? 'border-slate-700 hover:bg-slate-800/50' : ''}>
                <TableHead className="w-20">Port</TableHead>
                <TableHead className="w-24">Protocol</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Security</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPorts.map((port) => (
                <TableRow key={port.port} className={isDark ? 'border-slate-700 hover:bg-slate-800/50' : ''}>
                  <TableCell className="font-mono font-bold text-cyan-400">{port.port}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={isDark ? 'border-slate-600' : ''}>
                      {port.protocol}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{port.service}</TableCell>
                  <TableCell className={`hidden md:table-cell ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {port.description}
                  </TableCell>
                  <TableCell>{getSecurityBadge(port.security)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredPorts.length === 0 && (
          <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <Search className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p className="text-lg font-medium">No ports found</p>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Try a different search term</p>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}