import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Download, Save, FolderOpen, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import { saveTemplate, getTemplates, addToHistory } from '@/components/utils/storage';

function ipToLong(ip) {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function longToIp(long) {
  return [
    (long >>> 24) & 255,
    (long >>> 16) & 255,
    (long >>> 8) & 255,
    long & 255
  ].join('.');
}

function getCidrForHosts(hosts) {
  const neededBits = Math.ceil(Math.log2(hosts + 2));
  return 32 - neededBits;
}

function calculateSubnet(networkLong, cidr) {
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const network = (networkLong & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const size = Math.pow(2, 32 - cidr);

  return {
    network: longToIp(network),
    broadcast: longToIp(broadcast),
    firstHost: longToIp(network + 1),
    lastHost: longToIp(broadcast - 1),
    mask: longToIp(mask),
    cidr,
    size,
    usableHosts: size - 2,
    nextNetwork: broadcast + 1
  };
}

export default function VLSMPlanner() {
  const [isDark, setIsDark] = useState(true);
  const [baseNetwork, setBaseNetwork] = useState('192.168.0.0');
  const [baseCidr, setBaseCidr] = useState('16');
  const [subnets, setSubnets] = useState([
    { id: 1, name: 'Subnet A', hosts: 100 },
    { id: 2, name: 'Subnet B', hosts: 50 },
    { id: 3, name: 'Subnet C', hosts: 25 }
  ]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setTemplates(getTemplates('VLSMPlanner'));
  }, []);

  const addSubnet = () => {
    const maxId = subnets.reduce((max, s) => Math.max(max, s.id), 0);
    setSubnets([...subnets, { id: maxId + 1, name: `Subnet ${String.fromCharCode(65 + subnets.length)}`, hosts: 10 }]);
  };

  const removeSubnet = (id) => {
    setSubnets(subnets.filter(s => s.id !== id));
  };

  const updateSubnet = (id, field, value) => {
    setSubnets(subnets.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculateVLSM = () => {
    setError('');
    setResults([]);

    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(baseNetwork)) {
      setError('Invalid base network address');
      return;
    }

    const baseNetworkLong = ipToLong(baseNetwork);
    const baseMask = parseInt(baseCidr);
    const availableHosts = Math.pow(2, 32 - baseMask);
    
    const sortedSubnets = [...subnets].sort((a, b) => b.hosts - a.hosts);
    const totalNeeded = sortedSubnets.reduce((sum, s) => {
      const cidr = getCidrForHosts(s.hosts);
      return sum + Math.pow(2, 32 - cidr);
    }, 0);

    if (totalNeeded > availableHosts) {
      setError(`Not enough address space. Need ${totalNeeded} addresses, have ${availableHosts}`);
      return;
    }

    const allocatedSubnets = [];
    let currentNetwork = baseNetworkLong;

    for (const subnet of sortedSubnets) {
      const cidr = getCidrForHosts(subnet.hosts);
      const subnetInfo = calculateSubnet(currentNetwork, cidr);
      
      allocatedSubnets.push({
        ...subnet,
        ...subnetInfo,
        allocated: subnet.hosts,
        utilization: ((subnet.hosts / subnetInfo.usableHosts) * 100).toFixed(1)
      });

      currentNetwork = subnetInfo.nextNetwork;
    }

    const sorted = allocatedSubnets.sort((a, b) => ipToLong(a.network) - ipToLong(b.network));
    setResults(sorted);
    
    // Save to history
    addToHistory('VLSMPlanner', {
      label: `${baseNetwork}/${baseCidr}`,
      summary: `${sortedSubnets.length} subnets, ${sorted.length} allocated`,
      baseNetwork,
      baseCidr,
      subnets: sortedSubnets
    });
  };

  const saveAsTemplate = () => {
    const name = prompt('Enter template name:');
    if (name) {
      saveTemplate('VLSMPlanner', {
        name,
        baseNetwork,
        baseCidr,
        subnets
      });
      setTemplates(getTemplates('VLSMPlanner'));
      alert('Template saved!');
    }
  };

  const loadTemplate = (template) => {
    setBaseNetwork(template.baseNetwork);
    setBaseCidr(template.baseCidr);
    setSubnets(template.subnets);
    setShowTemplates(false);
  };

  const exportResults = () => {
    const text = results.map(r => 
      `${r.name}: ${r.network}/${r.cidr} (${r.firstHost} - ${r.lastHost})`
    ).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vlsm-plan.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageWrapper
      title="VLSM Planner"
      description="Variable Length Subnet Masking for efficient IP address allocation"
      icon={Layers}
      tips={[
        'Enter your base network and define subnets by required host count.',
        'Subnets are automatically sized and allocated from largest to smallest.'
      ]}
    >
      <div className="space-y-6">
        {/* Base Network Input */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Base Network</Label>
            <Input
              value={baseNetwork}
              onChange={(e) => setBaseNetwork(e.target.value)}
              placeholder="192.168.0.0"
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <div>
            <Label>CIDR</Label>
            <Input
              type="number"
              min="8"
              max="30"
              value={baseCidr}
              onChange={(e) => setBaseCidr(e.target.value)}
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
        </div>

        {/* Subnet Requirements */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg">Subnet Requirements</Label>
            <Button variant="outline" size="sm" onClick={addSubnet}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subnet
            </Button>
          </div>

          <div className="space-y-2">
            {subnets.map((subnet) => (
              <div key={subnet.id} className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <Input
                  value={subnet.name}
                  onChange={(e) => updateSubnet(subnet.id, 'name', e.target.value)}
                  className={`max-w-[200px] ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                  placeholder="Subnet name"
                />
                <div className="flex items-center gap-2">
                  <Label className="whitespace-nowrap">Hosts:</Label>
                  <Input
                    type="number"
                    min="1"
                    value={subnet.hosts}
                    onChange={(e) => updateSubnet(subnet.id, 'hosts', parseInt(e.target.value) || 1)}
                    className={`w-24 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSubnet(subnet.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="flex gap-4 flex-wrap">
          <Button onClick={calculateVLSM} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
            Calculate VLSM
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={exportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button variant="outline" onClick={saveAsTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          {templates.length > 0 && (
            <Button variant="outline" onClick={() => setShowTemplates(!showTemplates)}>
              <FolderOpen className="h-4 w-4 mr-2" />
              Templates ({templates.length})
            </Button>
          )}
        </div>

        {/* Templates List */}
        {showTemplates && templates.length > 0 && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <h3 className="font-semibold mb-3">Saved Templates</h3>
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTemplate(template)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isDark ? 'bg-slate-900/50 hover:bg-slate-900' : 'bg-white hover:bg-slate-100'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-medium">{template.name}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {template.baseNetwork}/{template.baseCidr} - {template.subnets.length} subnets
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white'}`}>
            <Table>
              <TableHeader>
                <TableRow className={isDark ? 'border-slate-700 hover:bg-slate-800/50' : ''}>
                  <TableHead>Subnet</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead>Broadcast</TableHead>
                  <TableHead>Mask</TableHead>
                  <TableHead className="text-right">Utilization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id} className={isDark ? 'border-slate-700 hover:bg-slate-800/50' : ''}>
                    <TableCell className="font-medium">{result.name}</TableCell>
                    <TableCell className="font-mono text-cyan-400">{result.network}/{result.cidr}</TableCell>
                    <TableCell className="font-mono text-sm">{result.firstHost} - {result.lastHost}</TableCell>
                    <TableCell className="font-mono text-sm">{result.broadcast}</TableCell>
                    <TableCell className="font-mono text-sm">{result.mask}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parseFloat(result.utilization) > 80 
                          ? 'bg-green-500/20 text-green-400' 
                          : parseFloat(result.utilization) > 50 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}>
                        {result.utilization}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}