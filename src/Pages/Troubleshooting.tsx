import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const scenarios = [
  {
    category: 'Connectivity Issues',
    problems: [
      {
        symptom: 'Cannot ping default gateway',
        steps: [
          'Check physical cable connection',
          'Verify interface is up: show ip interface brief',
          'Check IP configuration: ipconfig /all or ip addr',
          'Verify subnet mask matches gateway subnet',
          'Check for VLAN mismatch',
          'Disable firewall temporarily to test',
          'Check ARP table: arp -a or ip neigh show'
        ],
        commands: [
          'ping 192.168.1.1',
          'show ip interface brief',
          'show interfaces status',
          'show arp | include 192.168.1.1'
        ]
      },
      {
        symptom: 'Can ping gateway but not Internet',
        steps: [
          'Verify default route exists: route print or ip route',
          'Check DNS configuration',
          'Test with IP address instead of hostname',
          'Verify NAT configuration on router',
          'Check routing table on gateway',
          'Verify firewall rules allow outbound traffic'
        ],
        commands: [
          'ping 8.8.8.8',
          'tracert 8.8.8.8',
          'nslookup google.com',
          'show ip route'
        ]
      },
      {
        symptom: 'Intermittent connectivity',
        steps: [
          'Check for duplex mismatch: show interfaces',
          'Monitor interface errors: show interfaces counters errors',
          'Check for broadcast storms',
          'Verify STP is converged',
          'Monitor CPU and memory usage',
          'Check for hardware issues (cable, NIC)',
          'Review logs for pattern: show logging'
        ],
        commands: [
          'show interfaces GigabitEthernet0/1',
          'show interfaces counters errors',
          'show spanning-tree',
          'show processes cpu'
        ]
      }
    ]
  },
  {
    category: 'Performance Issues',
    problems: [
      {
        symptom: 'High latency',
        steps: [
          'Run traceroute to identify where delay occurs',
          'Check link utilization: show interfaces',
          'Verify QoS configuration if applicable',
          'Check for duplex mismatch',
          'Monitor CPU usage on network devices',
          'Check for routing loops',
          'Verify MTU settings'
        ],
        commands: [
          'tracert destination',
          'show interfaces | include load',
          'show processes cpu sorted',
          'ping -f -l 1472 destination (test MTU)'
        ]
      },
      {
        symptom: 'Packet loss',
        steps: [
          'Check interface error counters',
          'Verify cables and hardware',
          'Check for buffer overruns',
          'Monitor link utilization',
          'Check for broadcast/multicast storms',
          'Verify QoS queue depths',
          'Check for duplex mismatch'
        ],
        commands: [
          'show interfaces counters',
          'show interfaces | include CRC',
          'show interfaces | include drops',
          'show interfaces | include collisions'
        ]
      }
    ]
  },
  {
    category: 'Configuration Issues',
    problems: [
      {
        symptom: 'VLAN not working',
        steps: [
          'Verify VLAN exists: show vlan',
          'Check port assignment: show vlan brief',
          'Verify trunk configuration between switches',
          'Check allowed VLAN list on trunks',
          'Verify native VLAN matches on both ends',
          'Check STP is forwarding for the VLAN',
          'Verify VTP mode and domain (if using VTP)'
        ],
        commands: [
          'show vlan brief',
          'show interfaces trunk',
          'show interfaces switchport',
          'show spanning-tree vlan 10'
        ]
      },
      {
        symptom: 'Routing not working',
        steps: [
          'Verify routes exist: show ip route',
          'Check routing protocol status',
          'Verify network statements in routing protocol',
          'Check for ACLs blocking traffic',
          'Verify next-hop reachability',
          'Check administrative distance',
          'Verify no route filtering is applied'
        ],
        commands: [
          'show ip route',
          'show ip protocols',
          'show ip ospf neighbor (if OSPF)',
          'show ip bgp summary (if BGP)'
        ]
      }
    ]
  },
  {
    category: 'Security Issues',
    problems: [
      {
        symptom: 'Port security violations',
        steps: [
          'Check violation mode: show port-security',
          'Identify violating MAC: show port-security address',
          'Review max MAC addresses allowed',
          'Clear violation if legitimate: shutdown/no shutdown',
          'Or: clear port-security sticky interface X',
          'Review and update allowed MAC addresses',
          'Consider changing violation mode'
        ],
        commands: [
          'show port-security interface Gi0/1',
          'show port-security address',
          'clear port-security all'
        ]
      },
      {
        symptom: 'ACL not blocking traffic',
        steps: [
          'Verify ACL exists and is applied',
          'Check ACL direction (in vs out)',
          'Review ACL order (most specific first)',
          'Check for implicit deny at end',
          'Verify source/dest addresses and wildcards',
          'Enable ACL logging to verify hits',
          'Use show access-lists to see hit counts'
        ],
        commands: [
          'show access-lists',
          'show ip interface | include access list',
          'show access-lists 100 | include matches'
        ]
      }
    ]
  }
];

export default function Troubleshooting() {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleItem = (categoryIndex, problemIndex) => {
    const key = `${categoryIndex}-${problemIndex}`;
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const filteredScenarios = scenarios.map(category => ({
    ...category,
    problems: category.problems.filter(problem =>
      searchQuery === '' ||
      problem.symptom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.steps.some(step => step.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(category => category.problems.length > 0);

  return (
    <ToolPageWrapper
      title="Troubleshooting Guide"
      description="Common network problems and step-by-step solutions"
      icon={AlertCircle}
    >
      <div className="space-y-6">
        {/* Search */}
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search symptoms or issues..."
          className={isDark ? 'bg-slate-800 border-slate-700' : ''}
        />

        {/* Scenarios */}
        {filteredScenarios.map((category, catIndex) => (
          <div key={category.category} className={`rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-500" />
                {category.category}
              </h2>
            </div>
            <div className="p-4 space-y-2">
              {category.problems.map((problem, probIndex) => {
                const key = `${catIndex}-${probIndex}`;
                const isExpanded = expandedItems.has(key);
                
                return (
                  <div key={probIndex}>
                    <button
                      onClick={() => toggleItem(catIndex, probIndex)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg transition-all ${
                        isDark 
                          ? 'bg-slate-900/50 hover:bg-slate-900' 
                          : 'bg-white hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        <span className="font-medium text-left">{problem.symptom}</span>
                      </div>
                      <Badge variant="outline" className={isDark ? 'border-slate-600' : ''}>
                        {problem.steps.length} steps
                      </Badge>
                    </button>
                    
                    {isExpanded && (
                      <div className={`mt-2 p-6 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                        <h4 className="font-semibold mb-3 text-cyan-400">Troubleshooting Steps</h4>
                        <ol className="space-y-2 mb-6">
                          {problem.steps.map((step, i) => (
                            <li key={i} className={`flex gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
                              }`}>
                                {i + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>

                        {problem.commands && problem.commands.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 text-cyan-400">Useful Commands</h4>
                            <div className="space-y-2">
                              {problem.commands.map((cmd, i) => (
                                <div key={i} className={`p-3 rounded-lg font-mono text-sm ${
                                  isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-cyan-600'
                                }`}>
                                  {cmd}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredScenarios.length === 0 && (
          <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-slate-500" />
            <p className="text-lg font-medium">No scenarios found</p>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Try a different search term</p>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}