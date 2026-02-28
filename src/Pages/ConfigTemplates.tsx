import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const templates = {
  cisco: {
    'Basic Switch Setup': `! Basic Cisco Switch Configuration
enable
configure terminal

! Set hostname
hostname SW-CORE-01

! Configure VLANs
vlan 10
  name MANAGEMENT
vlan 20
  name USERS
vlan 30
  name SERVERS
!

! Configure trunk port
interface GigabitEthernet0/1
  description UPLINK-TO-ROUTER
  switchport trunk encapsulation dot1q
  switchport mode trunk
  switchport trunk allowed vlan 10,20,30
  no shutdown
!

! Configure access port
interface range GigabitEthernet0/2-24
  switchport mode access
  switchport access vlan 20
  spanning-tree portfast
  no shutdown
!

! Enable SSH
ip domain-name company.local
crypto key generate rsa modulus 2048
line vty 0 15
  transport input ssh
  login local
!

! Create admin user
username admin privilege 15 secret YourSecurePassword

! Save configuration
end
write memory`,

    'Basic Router Setup': `! Basic Cisco Router Configuration
enable
configure terminal

! Set hostname
hostname RTR-CORE-01

! Configure interfaces
interface GigabitEthernet0/0
  description WAN-INTERFACE
  ip address dhcp
  no shutdown
!

interface GigabitEthernet0/1
  description LAN-INTERFACE
  ip address 192.168.1.1 255.255.255.0
  no shutdown
!

! Configure DHCP
ip dhcp pool LAN_POOL
  network 192.168.1.0 255.255.255.0
  default-router 192.168.1.1
  dns-server 8.8.8.8 8.8.4.4
  lease 7
!

ip dhcp excluded-address 192.168.1.1 192.168.1.10

! Configure NAT
access-list 1 permit 192.168.1.0 0.0.0.255
ip nat inside source list 1 interface GigabitEthernet0/0 overload

interface GigabitEthernet0/0
  ip nat outside
!
interface GigabitEthernet0/1
  ip nat inside
!

! Enable SSH
ip domain-name company.local
crypto key generate rsa modulus 2048
username admin privilege 15 secret YourSecurePassword
line vty 0 4
  transport input ssh
  login local
!

! Save
end
write memory`,

    'OSPF Configuration': `! OSPF Configuration
configure terminal

! Enable OSPF
router ospf 1
  router-id 1.1.1.1
  network 192.168.1.0 0.0.0.255 area 0
  network 10.0.0.0 0.255.255.255 area 0
  passive-interface default
  no passive-interface GigabitEthernet0/0
  no passive-interface GigabitEthernet0/1
!

! Configure interface costs (optional)
interface GigabitEthernet0/0
  ip ospf cost 10
  ip ospf priority 100
!

end
write memory`,

    'Security Hardening': `! Cisco Device Security Hardening
enable
configure terminal

! Disable unused services
no ip http server
no ip http secure-server
no cdp run
no service pad
no ip bootp server
no ip finger
no ip domain-lookup

! Enable password encryption
service password-encryption

! Set secure passwords
enable secret YourEnableSecret

! Configure banners
banner login ^
*************************************************************
UNAUTHORIZED ACCESS IS PROHIBITED
This system is for authorized use only.
*************************************************************
^

! Secure console
line console 0
  password YourConsolePassword
  login
  logging synchronous
  exec-timeout 5 0
!

! Secure VTY
line vty 0 15
  password YourVTYPassword
  login local
  exec-timeout 5 0
  transport input ssh
!

! Enable logging
logging buffered 51200
logging console critical
logging trap informational
logging source-interface Loopback0
logging host 192.168.1.100

! NTP configuration
ntp server 0.pool.ntp.org
ntp server 1.pool.ntp.org
ntp update-calendar

! AAA (if needed)
aaa new-model
aaa authentication login default local
aaa authorization exec default local

end
write memory`
  },
  juniper: {
    'Basic Configuration': `# Juniper JunOS Basic Configuration

# Set hostname
set system host-name R1

# Configure interfaces
set interfaces ge-0/0/0 unit 0 family inet address 192.168.1.1/24
set interfaces ge-0/0/1 unit 0 family inet address 10.0.0.1/24

# Configure routing
set routing-options static route 0.0.0.0/0 next-hop 192.168.1.254

# Configure VLANs
set vlans management vlan-id 10
set vlans users vlan-id 20
set vlans servers vlan-id 30

# Configure users
set system login user admin class super-user authentication plain-text-password

# Configure services
set system services ssh
set system services netconf ssh

# Commit configuration
commit and-quit`,

    'OSPF Configuration': `# Juniper OSPF Configuration

set protocols ospf area 0.0.0.0 interface ge-0/0/0.0
set protocols ospf area 0.0.0.0 interface ge-0/0/1.0
set protocols ospf area 0.0.0.0 interface lo0.0 passive

# Set router ID
set routing-options router-id 1.1.1.1

# Interface parameters
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 metric 10
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 100

commit and-quit`
  },
  linux: {
    'Static Routing': `#!/bin/bash
# Linux Static Routes

# Add temporary route
ip route add 192.168.2.0/24 via 192.168.1.254

# Add permanent route (add to /etc/network/interfaces on Debian/Ubuntu)
# Or create /etc/sysconfig/network-scripts/route-eth0 on RHEL/CentOS

# Example route file content:
# 192.168.2.0/24 via 192.168.1.254 dev eth0

# Show routing table
ip route show

# Delete route
ip route del 192.168.2.0/24`,

    'iptables Firewall': `#!/bin/bash
# Basic iptables firewall

# Flush existing rules
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# Default policies
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Allow established connections
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Allow SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Allow ping
iptables -A INPUT -p icmp --icmp-type echo-request -j ACCEPT

# Log dropped packets
iptables -A INPUT -j LOG --log-prefix "[IPTABLES-DROP]: "

# Save rules
iptables-save > /etc/iptables/rules.v4`,

    'Network Interface Config': `# /etc/network/interfaces (Debian/Ubuntu)

# Loopback
auto lo
iface lo inet loopback

# Static IP
auto eth0
iface eth0 inet static
    address 192.168.1.10
    netmask 255.255.255.0
    gateway 192.168.1.1
    dns-nameservers 8.8.8.8 8.8.4.4

# DHCP
auto eth1
iface eth1 inet dhcp

# VLAN interface
auto eth0.10
iface eth0.10 inet static
    address 192.168.10.1
    netmask 255.255.255.0
    vlan-raw-device eth0`
  }
};

export default function ConfigTemplates() {
  const [isDark, setIsDark] = useState(true);
  const [vendor, setVendor] = useState('cisco');
  const [selectedTemplate, setSelectedTemplate] = useState(Object.keys(templates.cisco)[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [customConfig, setCustomConfig] = useState('');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    setSelectedTemplate(Object.keys(templates[vendor])[0]);
  }, [vendor]);

  const currentTemplate = templates[vendor][selectedTemplate];

  const copyTemplate = () => {
    navigator.clipboard.writeText(currentTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTemplate = () => {
    const blob = new Blob([currentTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate.replace(/\s+/g, '-').toLowerCase()}-${vendor}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTemplates = Object.keys(templates[vendor]).filter(name =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ToolPageWrapper
      title="Configuration Templates"
      description="Ready-to-use configuration templates for common network scenarios"
      icon={FileText}
      tips={[
        'Select a vendor and template to get started',
        'Remember to customize placeholders like passwords and IP addresses'
      ]}
    >
      <div className="space-y-6">
        {/* Vendor Selection */}
        <Tabs value={vendor} onValueChange={setVendor}>
          <TabsList className={isDark ? 'bg-slate-800' : ''}>
            <TabsTrigger value="cisco">Cisco IOS</TabsTrigger>
            <TabsTrigger value="juniper">Juniper JunOS</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Templates */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className={`pl-10 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
          />
        </div>

        {/* Template List */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map(name => (
            <button
              key={name}
              onClick={() => setSelectedTemplate(name)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedTemplate === name
                  ? isDark
                    ? 'bg-cyan-500/20 border-2 border-cyan-500'
                    : 'bg-cyan-50 border-2 border-cyan-400'
                  : isDark
                    ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <p className="font-medium">{name}</p>
              <Badge variant="outline" className="mt-2 text-xs">
                {vendor.charAt(0).toUpperCase() + vendor.slice(1)}
              </Badge>
            </button>
          ))}
        </div>

        {/* Template Display */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{selectedTemplate}</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyTemplate}>
                {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <Textarea
            value={currentTemplate}
            readOnly
            className={`font-mono text-sm min-h-[500px] ${
              isDark ? 'bg-slate-900 border-slate-700 text-cyan-400' : 'bg-slate-50'
            }`}
          />
        </div>

        {/* Important Notes */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-100'
        }`}>
          <p className="text-sm text-amber-400 font-medium mb-2">⚠️ Important Notes</p>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-amber-100' : 'text-amber-800'}`}>
            <li>• Always replace placeholder passwords with strong, unique passwords</li>
            <li>• Customize IP addresses, interface names, and VLANs for your network</li>
            <li>• Test configurations in a lab environment before production deployment</li>
            <li>• Back up existing configurations before making changes</li>
            <li>• Review and understand each command before applying</li>
          </ul>
        </div>
      </div>
    </ToolPageWrapper>
  );
}