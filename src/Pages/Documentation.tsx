import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const docs = [
  {
    category: 'IP Addressing',
    topics: [
      {
        title: 'IPv4 Address Classes',
        content: `
**Class A:** 1.0.0.0 to 126.255.255.255 (Default mask: /8 or 255.0.0.0)
- First bit: 0
- Networks: 128 (0 and 127 reserved)
- Hosts per network: 16,777,214

**Class B:** 128.0.0.0 to 191.255.255.255 (Default mask: /16 or 255.255.0.0)
- First two bits: 10
- Networks: 16,384
- Hosts per network: 65,534

**Class C:** 192.0.0.0 to 223.255.255.255 (Default mask: /24 or 255.255.255.0)
- First three bits: 110
- Networks: 2,097,152
- Hosts per network: 254

**Class D:** 224.0.0.0 to 239.255.255.255 (Multicast)
**Class E:** 240.0.0.0 to 255.255.255.255 (Reserved)
        `,
        tags: ['IPv4', 'Basics']
      },
      {
        title: 'Private IP Ranges (RFC 1918)',
        content: `
**10.0.0.0/8**
- Range: 10.0.0.0 to 10.255.255.255
- Total addresses: 16,777,216
- Common use: Large enterprises

**172.16.0.0/12**
- Range: 172.16.0.0 to 172.31.255.255
- Total addresses: 1,048,576
- Common use: Medium enterprises

**192.168.0.0/16**
- Range: 192.168.0.0 to 192.168.255.255
- Total addresses: 65,536
- Common use: Home/small business networks
        `,
        tags: ['IPv4', 'Private', 'RFC1918']
      },
      {
        title: 'IPv6 Address Types',
        content: `
**Global Unicast (2000::/3)**
- Routable on the Internet
- Similar to public IPv4 addresses

**Unique Local (fc00::/7)**
- Private addresses (like RFC 1918)
- Not routed on the Internet
- fd00::/8 for locally assigned

**Link-Local (fe80::/10)**
- Valid only on local link
- Automatically configured
- Not routed

**Loopback (::1/128)**
- IPv6 equivalent of 127.0.0.1

**Multicast (ff00::/8)**
- Group communication
- Replaces broadcast in IPv4
        `,
        tags: ['IPv6', 'Addressing']
      },
      {
        title: 'Subnetting Quick Reference',
        content: `
**CIDR to Subnet Mask:**
/24 = 255.255.255.0 (256 addresses, 254 hosts)
/25 = 255.255.255.128 (128 addresses, 126 hosts)
/26 = 255.255.255.192 (64 addresses, 62 hosts)
/27 = 255.255.255.224 (32 addresses, 30 hosts)
/28 = 255.255.255.240 (16 addresses, 14 hosts)
/29 = 255.255.255.248 (8 addresses, 6 hosts)
/30 = 255.255.255.252 (4 addresses, 2 hosts)
/31 = 255.255.255.254 (2 addresses, point-to-point)
/32 = 255.255.255.255 (1 address, host route)

**Magic Number Trick:**
Subnet mask = 256 - last octet value
Example: /26 → 256 - 192 = 64 (block size)
        `,
        tags: ['Subnetting', 'CIDR', 'Quick Reference']
      }
    ]
  },
  {
    category: 'Protocols',
    topics: [
      {
        title: 'TCP vs UDP',
        content: `
**TCP (Transmission Control Protocol)**
- Connection-oriented
- Reliable delivery with acknowledgments
- Flow control and congestion control
- Ordered delivery
- Higher overhead
- Use cases: HTTP, SSH, FTP, email

**UDP (User Datagram Protocol)**
- Connectionless
- Best-effort delivery (no guarantees)
- No flow control
- Lower overhead
- Faster for real-time applications
- Use cases: DNS, VoIP, video streaming, gaming
        `,
        tags: ['TCP', 'UDP', 'Protocols']
      },
      {
        title: 'ICMP Types and Codes',
        content: `
**Common ICMP Types:**

**Type 0:** Echo Reply (ping response)
**Type 3:** Destination Unreachable
  - Code 0: Network unreachable
  - Code 1: Host unreachable
  - Code 2: Protocol unreachable
  - Code 3: Port unreachable
  - Code 4: Fragmentation needed but DF set

**Type 5:** Redirect
**Type 8:** Echo Request (ping)
**Type 11:** Time Exceeded
  - Code 0: TTL expired in transit
  - Code 1: Fragment reassembly time exceeded

**Type 30:** Traceroute
        `,
        tags: ['ICMP', 'Troubleshooting']
      },
      {
        title: 'DNS Record Types',
        content: `
**A:** IPv4 address
**AAAA:** IPv6 address
**CNAME:** Canonical name (alias)
**MX:** Mail exchange server (priority + server)
**NS:** Authoritative name server
**TXT:** Text record (SPF, DKIM, verification)
**SOA:** Start of authority (zone information)
**PTR:** Pointer (reverse DNS)
**SRV:** Service location
**CAA:** Certificate authority authorization
        `,
        tags: ['DNS', 'Records']
      }
    ]
  },
  {
    category: 'Routing',
    topics: [
      {
        title: 'Administrative Distance',
        content: `
**Lower value = More trusted route**

0   - Directly connected
1   - Static route
5   - EIGRP summary route
20  - External BGP (eBGP)
90  - Internal EIGRP
100 - IGRP
110 - OSPF
115 - IS-IS
120 - RIP
140 - EGP
160 - ODR
170 - External EIGRP
200 - Internal BGP (iBGP)
255 - Unknown (route not installed)
        `,
        tags: ['Routing', 'AD', 'Cisco']
      },
      {
        title: 'OSPF States',
        content: `
**Down:** Initial state, no Hello received
**Init:** Hello received, but not yet bidirectional
**2-Way:** Bidirectional communication established
**ExStart:** Master/slave relationship negotiated
**Exchange:** Database description packets exchanged
**Loading:** LSR (Link State Request) packets sent
**Full:** Fully adjacent, databases synchronized

**Note:** Only FULL neighbors exchange routing information
        `,
        tags: ['OSPF', 'Routing', 'States']
      }
    ]
  },
  {
    category: 'VLANs & Switching',
    topics: [
      {
        title: 'VLAN Ranges',
        content: `
**Normal Range VLANs (1-1005)**
- VLAN 1: Default VLAN (cannot be deleted)
- VLANs 2-1001: User-defined
- VLANs 1002-1005: Reserved for legacy protocols

**Extended Range VLANs (1006-4094)**
- Requires VTP transparent mode or VTP off
- Not stored in vlan.dat
- Must be configured manually

**Reserved:**
- VLAN 0, 4095: Reserved, not usable
        `,
        tags: ['VLAN', 'Switching']
      },
      {
        title: 'Spanning Tree Port States',
        content: `
**Disabled:** Port is shutdown
**Blocking:** Receiving BPDUs, not forwarding
**Listening:** Not forwarding, building topology (15s)
**Learning:** Not forwarding, learning MAC addresses (15s)
**Forwarding:** Normal operation, forwarding frames

**Total convergence time:** 30-50 seconds (Listening + Learning)

**RSTP States (faster):**
- Discarding (combines Disabled, Blocking, Listening)
- Learning
- Forwarding
        `,
        tags: ['STP', 'RSTP', 'Switching']
      }
    ]
  },
  {
    category: 'Security',
    topics: [
      {
        title: 'Well-Known Security Ports',
        content: `
**Common Attack Vectors:**
- 21 (FTP): Unencrypted file transfer
- 23 (Telnet): Unencrypted remote access
- 135-139 (NetBIOS/SMB): Windows file sharing
- 445 (SMB): WannaCry exploit vector
- 3389 (RDP): Brute force target

**Should Use Secure Alternatives:**
- Use SFTP (22) instead of FTP (21)
- Use SSH (22) instead of Telnet (23)
- Use HTTPS (443) instead of HTTP (80)
- Use IMAPS (993) instead of IMAP (143)
- Use SMTPS (465/587) instead of SMTP (25)
        `,
        tags: ['Security', 'Ports', 'Best Practices']
      }
    ]
  }
];

export default function Documentation() {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const filteredDocs = docs.map(category => ({
    ...category,
    topics: category.topics.filter(topic =>
      searchQuery === '' ||
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.topics.length > 0);

  const toggleTopic = (categoryIndex, topicIndex) => {
    const key = `${categoryIndex}-${topicIndex}`;
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedTopics(newExpanded);
  };

  return (
    <ToolPageWrapper
      title="Documentation & Reference"
      description="Quick reference guide for networking concepts and protocols"
      icon={BookOpen}
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className={`pl-10 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
          />
        </div>

        {/* Categories */}
        {filteredDocs.map((category, catIndex) => (
          <div key={category.category} className={`rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold">{category.category}</h2>
            </div>
            <div className="p-4 space-y-2">
              {category.topics.map((topic, topicIndex) => {
                const key = `${catIndex}-${topicIndex}`;
                const isExpanded = expandedTopics.has(key);
                
                return (
                  <div key={topicIndex}>
                    <button
                      onClick={() => toggleTopic(catIndex, topicIndex)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                        isDark 
                          ? 'bg-slate-900/50 hover:bg-slate-900' 
                          : 'bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        <span className="font-medium">{topic.title}</span>
                      </div>
                      <div className="flex gap-2">
                        {topic.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className={`mt-2 p-6 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                        <div className={`prose prose-sm max-w-none ${
                          isDark ? 'prose-invert' : ''
                        }`}>
                          {topic.content.split('\n').map((line, i) => {
                            if (!line.trim()) return <br key={i} />;
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <h4 key={i} className="font-bold text-cyan-400 mt-4 mb-2">{line.slice(2, -2)}</h4>;
                            }
                            if (line.startsWith('**')) {
                              const parts = line.split('**');
                              return (
                                <p key={i} className="mb-2">
                                  <strong className="text-cyan-400">{parts[1]}</strong>
                                  {parts[2]}
                                </p>
                              );
                            }
                            if (line.startsWith('- ')) {
                              return (
                                <li key={i} className={`ml-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                  {line.slice(2)}
                                </li>
                              );
                            }
                            return (
                              <p key={i} className={`mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {line}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <Search className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p className="text-lg font-medium">No documentation found</p>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Try a different search term</p>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}