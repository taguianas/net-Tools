import React, { useState, useEffect } from 'react';
import { Server, Search, Download, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const portDatabase = [
  // Well-Known Ports (0-1023)
  { port: 7, protocol: 'TCP/UDP', service: 'Echo', category: 'System', description: 'Echo Protocol' },
  { port: 20, protocol: 'TCP', service: 'FTP-DATA', category: 'File Transfer', description: 'FTP data transfer' },
  { port: 21, protocol: 'TCP', service: 'FTP', category: 'File Transfer', description: 'FTP control (command)' },
  { port: 22, protocol: 'TCP', service: 'SSH', category: 'Remote Access', description: 'Secure Shell' },
  { port: 23, protocol: 'TCP', service: 'Telnet', category: 'Remote Access', description: 'Telnet (unencrypted)' },
  { port: 25, protocol: 'TCP', service: 'SMTP', category: 'Email', description: 'Simple Mail Transfer Protocol' },
  { port: 37, protocol: 'TCP/UDP', service: 'Time', category: 'System', description: 'Time Protocol' },
  { port: 53, protocol: 'TCP/UDP', service: 'DNS', category: 'DNS', description: 'Domain Name System' },
  { port: 67, protocol: 'UDP', service: 'DHCP', category: 'Network', description: 'DHCP Server' },
  { port: 68, protocol: 'UDP', service: 'DHCP', category: 'Network', description: 'DHCP Client' },
  { port: 69, protocol: 'UDP', service: 'TFTP', category: 'File Transfer', description: 'Trivial File Transfer Protocol' },
  { port: 80, protocol: 'TCP', service: 'HTTP', category: 'Web', description: 'Hypertext Transfer Protocol' },
  { port: 88, protocol: 'TCP/UDP', service: 'Kerberos', category: 'Security', description: 'Kerberos authentication' },
  { port: 110, protocol: 'TCP', service: 'POP3', category: 'Email', description: 'Post Office Protocol v3' },
  { port: 119, protocol: 'TCP', service: 'NNTP', category: 'Email', description: 'Network News Transfer Protocol' },
  { port: 123, protocol: 'UDP', service: 'NTP', category: 'System', description: 'Network Time Protocol' },
  { port: 135, protocol: 'TCP', service: 'MS-RPC', category: 'Windows', description: 'Microsoft RPC' },
  { port: 137, protocol: 'UDP', service: 'NetBIOS-NS', category: 'Windows', description: 'NetBIOS Name Service' },
  { port: 138, protocol: 'UDP', service: 'NetBIOS-DGM', category: 'Windows', description: 'NetBIOS Datagram Service' },
  { port: 139, protocol: 'TCP', service: 'NetBIOS-SSN', category: 'Windows', description: 'NetBIOS Session Service' },
  { port: 143, protocol: 'TCP', service: 'IMAP', category: 'Email', description: 'Internet Message Access Protocol' },
  { port: 161, protocol: 'UDP', service: 'SNMP', category: 'Network', description: 'Simple Network Management Protocol' },
  { port: 162, protocol: 'UDP', service: 'SNMP-Trap', category: 'Network', description: 'SNMP Trap' },
  { port: 179, protocol: 'TCP', service: 'BGP', category: 'Routing', description: 'Border Gateway Protocol' },
  { port: 194, protocol: 'TCP', service: 'IRC', category: 'Communication', description: 'Internet Relay Chat' },
  { port: 389, protocol: 'TCP', service: 'LDAP', category: 'Directory', description: 'Lightweight Directory Access Protocol' },
  { port: 443, protocol: 'TCP', service: 'HTTPS', category: 'Web', description: 'HTTP over TLS/SSL' },
  { port: 445, protocol: 'TCP', service: 'SMB', category: 'File Transfer', description: 'Server Message Block' },
  { port: 464, protocol: 'TCP/UDP', service: 'Kpasswd', category: 'Security', description: 'Kerberos password change' },
  { port: 465, protocol: 'TCP', service: 'SMTPS', category: 'Email', description: 'SMTP over SSL' },
  { port: 500, protocol: 'UDP', service: 'ISAKMP', category: 'VPN', description: 'IPsec IKE' },
  { port: 514, protocol: 'UDP', service: 'Syslog', category: 'System', description: 'System Logging Protocol' },
  { port: 515, protocol: 'TCP', service: 'LPD', category: 'Printing', description: 'Line Printer Daemon' },
  { port: 520, protocol: 'UDP', service: 'RIP', category: 'Routing', description: 'Routing Information Protocol' },
  { port: 543, protocol: 'TCP', service: 'Klogin', category: 'Remote Access', description: 'Kerberos login' },
  { port: 544, protocol: 'TCP', service: 'Kshell', category: 'Remote Access', description: 'Kerberos shell' },
  { port: 546, protocol: 'TCP/UDP', service: 'DHCPv6', category: 'Network', description: 'DHCPv6 client' },
  { port: 547, protocol: 'TCP/UDP', service: 'DHCPv6', category: 'Network', description: 'DHCPv6 server' },
  { port: 587, protocol: 'TCP', service: 'Submission', category: 'Email', description: 'Email message submission' },
  { port: 636, protocol: 'TCP', service: 'LDAPS', category: 'Directory', description: 'LDAP over SSL' },
  { port: 853, protocol: 'TCP', service: 'DoT', category: 'DNS', description: 'DNS over TLS' },
  { port: 873, protocol: 'TCP', service: 'rsync', category: 'File Transfer', description: 'rsync file synchronization' },
  { port: 993, protocol: 'TCP', service: 'IMAPS', category: 'Email', description: 'IMAP over SSL' },
  { port: 995, protocol: 'TCP', service: 'POP3S', category: 'Email', description: 'POP3 over SSL' },
  
  // Registered Ports (1024-49151)
  { port: 1080, protocol: 'TCP', service: 'SOCKS', category: 'Proxy', description: 'SOCKS proxy' },
  { port: 1194, protocol: 'UDP', service: 'OpenVPN', category: 'VPN', description: 'OpenVPN' },
  { port: 1433, protocol: 'TCP', service: 'MSSQL', category: 'Database', description: 'Microsoft SQL Server' },
  { port: 1434, protocol: 'UDP', service: 'MSSQL', category: 'Database', description: 'MS SQL Server Browser' },
  { port: 1521, protocol: 'TCP', service: 'Oracle', category: 'Database', description: 'Oracle Database' },
  { port: 1701, protocol: 'UDP', service: 'L2TP', category: 'VPN', description: 'Layer 2 Tunneling Protocol' },
  { port: 1723, protocol: 'TCP', service: 'PPTP', category: 'VPN', description: 'Point-to-Point Tunneling' },
  { port: 1812, protocol: 'UDP', service: 'RADIUS', category: 'Security', description: 'RADIUS Authentication' },
  { port: 1813, protocol: 'UDP', service: 'RADIUS', category: 'Security', description: 'RADIUS Accounting' },
  { port: 2049, protocol: 'TCP/UDP', service: 'NFS', category: 'File Transfer', description: 'Network File System' },
  { port: 2082, protocol: 'TCP', service: 'cPanel', category: 'Web', description: 'cPanel default' },
  { port: 2083, protocol: 'TCP', service: 'cPanel SSL', category: 'Web', description: 'cPanel SSL' },
  { port: 2181, protocol: 'TCP', service: 'ZooKeeper', category: 'Database', description: 'Apache ZooKeeper' },
  { port: 2222, protocol: 'TCP', service: 'SSH Alt', category: 'Remote Access', description: 'DirectAdmin SSH' },
  { port: 3000, protocol: 'TCP', service: 'Dev Server', category: 'Development', description: 'Common dev server port' },
  { port: 3128, protocol: 'TCP', service: 'Squid', category: 'Proxy', description: 'Squid HTTP Proxy' },
  { port: 3268, protocol: 'TCP', service: 'LDAP GC', category: 'Directory', description: 'AD Global Catalog' },
  { port: 3306, protocol: 'TCP', service: 'MySQL', category: 'Database', description: 'MySQL Database' },
  { port: 3389, protocol: 'TCP', service: 'RDP', category: 'Remote Access', description: 'Remote Desktop Protocol' },
  { port: 4443, protocol: 'TCP', service: 'HTTPS Alt', category: 'Web', description: 'HTTPS Alternative' },
  { port: 4500, protocol: 'UDP', service: 'IPsec NAT-T', category: 'VPN', description: 'IPsec NAT Traversal' },
  { port: 5000, protocol: 'TCP', service: 'UPnP', category: 'Network', description: 'UPnP / Flask default' },
  { port: 5060, protocol: 'TCP/UDP', service: 'SIP', category: 'VoIP', description: 'Session Initiation Protocol' },
  { port: 5061, protocol: 'TCP', service: 'SIP-TLS', category: 'VoIP', description: 'SIP over TLS' },
  { port: 5432, protocol: 'TCP', service: 'PostgreSQL', category: 'Database', description: 'PostgreSQL Database' },
  { port: 5672, protocol: 'TCP', service: 'AMQP', category: 'Messaging', description: 'RabbitMQ' },
  { port: 5900, protocol: 'TCP', service: 'VNC', category: 'Remote Access', description: 'Virtual Network Computing' },
  { port: 5985, protocol: 'TCP', service: 'WinRM', category: 'Windows', description: 'Windows Remote Management' },
  { port: 5986, protocol: 'TCP', service: 'WinRM-S', category: 'Windows', description: 'WinRM over HTTPS' },
  { port: 6379, protocol: 'TCP', service: 'Redis', category: 'Database', description: 'Redis Database' },
  { port: 6443, protocol: 'TCP', service: 'K8s API', category: 'Container', description: 'Kubernetes API Server' },
  { port: 6666, protocol: 'TCP', service: 'IRC Alt', category: 'Communication', description: 'IRC Alternative' },
  { port: 6667, protocol: 'TCP', service: 'IRC', category: 'Communication', description: 'IRC default' },
  { port: 8000, protocol: 'TCP', service: 'HTTP Alt', category: 'Web', description: 'HTTP Alternative' },
  { port: 8080, protocol: 'TCP', service: 'HTTP Proxy', category: 'Web', description: 'HTTP Proxy / Alt' },
  { port: 8443, protocol: 'TCP', service: 'HTTPS Alt', category: 'Web', description: 'HTTPS Alternative' },
  { port: 8888, protocol: 'TCP', service: 'HTTP Alt', category: 'Development', description: 'HTTP Alt / Jupyter' },
  { port: 9000, protocol: 'TCP', service: 'PHP-FPM', category: 'Web', description: 'PHP FastCGI Process Manager' },
  { port: 9090, protocol: 'TCP', service: 'Prometheus', category: 'Monitoring', description: 'Prometheus web UI' },
  { port: 9092, protocol: 'TCP', service: 'Kafka', category: 'Messaging', description: 'Apache Kafka' },
  { port: 9200, protocol: 'TCP', service: 'Elasticsearch', category: 'Database', description: 'Elasticsearch HTTP' },
  { port: 9300, protocol: 'TCP', service: 'Elasticsearch', category: 'Database', description: 'Elasticsearch Transport' },
  { port: 9418, protocol: 'TCP', service: 'Git', category: 'Development', description: 'Git protocol' },
  { port: 10000, protocol: 'TCP', service: 'Webmin', category: 'Web', description: 'Webmin Admin' },
  { port: 11211, protocol: 'TCP', service: 'Memcached', category: 'Database', description: 'Memcached' },
  { port: 27017, protocol: 'TCP', service: 'MongoDB', category: 'Database', description: 'MongoDB Database' },
  { port: 27018, protocol: 'TCP', service: 'MongoDB', category: 'Database', description: 'MongoDB Shard Server' },
  { port: 27019, protocol: 'TCP', service: 'MongoDB', category: 'Database', description: 'MongoDB Config Server' },
  { port: 50000, protocol: 'TCP', service: 'DB2', category: 'Database', description: 'IBM DB2' },
  { port: 51413, protocol: 'TCP/UDP', service: 'BitTorrent', category: 'P2P', description: 'BitTorrent default' },
];

const categories = ['All', ...new Set(portDatabase.map(p => p.category))].sort();

export default function PortReference() {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('port');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const filteredPorts = portDatabase
    .filter(port => {
      const matchesSearch = searchQuery === '' ||
        port.port.toString().includes(searchQuery) ||
        port.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.protocol.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || port.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'port') return (a.port - b.port) * modifier;
      if (sortBy === 'service') return a.service.localeCompare(b.service) * modifier;
      return 0;
    });

  const getCategoryBadge = (category) => {
    const colors = {
      'Web': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Email': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Database': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'Remote Access': 'bg-red-500/20 text-red-400 border-red-500/30',
      'File Transfer': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Network': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'Security': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'VPN': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'DNS': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      'Windows': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Routing': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'System': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      'Development': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      'Container': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
      'Monitoring': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
      'Messaging': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      'VoIP': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const exportData = () => {
    const csv = 'Port,Protocol,Service,Category,Description\n' + 
      filteredPorts.map(p => 
        `${p.port},${p.protocol},${p.service},${p.category},"${p.description}"`
      ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'port-reference.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageWrapper
      title="Port Reference"
      description="Comprehensive list of well-known ports and protocols"
      icon={Server}
      tips={[
        'Search by port number, service name, or protocol.',
        'Filter by category to narrow down results.'
      ]}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2 relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ports, services, protocols..."
              className={`pl-10 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button variant="outline" onClick={exportData} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Ports</p>
            <p className="text-2xl font-bold text-cyan-400">{portDatabase.length}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Filtered</p>
            <p className="text-2xl font-bold">{filteredPorts.length}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Categories</p>
            <p className="text-2xl font-bold">{categories.length - 1}</p>
          </div>
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>TCP Ports</p>
            <p className="text-2xl font-bold">
              {portDatabase.filter(p => p.protocol.includes('TCP')).length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white border'}`}>
          <Table>
            <TableHeader>
              <TableRow className={isDark ? 'border-slate-700' : ''}>
                <TableHead 
                  className="w-24 cursor-pointer"
                  onClick={() => {
                    if (sortBy === 'port') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('port'); setSortOrder('asc'); }
                  }}
                >
                  Port {sortBy === 'port' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="w-24">Protocol</TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => {
                    if (sortBy === 'service') setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('service'); setSortOrder('asc'); }
                  }}
                >
                  Service {sortBy === 'service' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPorts.map((port) => (
                <TableRow key={`${port.port}-${port.protocol}`} className={isDark ? 'border-slate-700 hover:bg-slate-800/50' : ''}>
                  <TableCell className="font-mono font-bold text-cyan-400">{port.port}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={isDark ? 'border-slate-600' : ''}>
                      {port.protocol}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{port.service}</TableCell>
                  <TableCell>
                    <Badge className={`${getCategoryBadge(port.category)} border`}>
                      {port.category}
                    </Badge>
                  </TableCell>
                  <TableCell className={`hidden md:table-cell ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {port.description}
                  </TableCell>
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