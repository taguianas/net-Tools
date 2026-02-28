import React, { useState, useEffect } from 'react';
import { Route, Plus, Trash2, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const protocols = [
  { id: 'static', name: 'Static', ad: 1 },
  { id: 'eigrp', name: 'EIGRP', ad: 90 },
  { id: 'ospf', name: 'OSPF', ad: 110 },
  { id: 'rip', name: 'RIP', ad: 120 },
  { id: 'bgp', name: 'BGP (iBGP)', ad: 200 },
  { id: 'ebgp', name: 'BGP (eBGP)', ad: 20 },
];

const vendors = [
  { id: 'cisco', name: 'Cisco IOS' },
  { id: 'juniper', name: 'Juniper JunOS' },
  { id: 'linux', name: 'Linux' },
];

function generateCiscoStatic(routes) {
  let config = '! Static Routes\n';
  routes.forEach(route => {
    config += `ip route ${route.network} ${route.mask} ${route.nextHop}`;
    if (route.distance) config += ` ${route.distance}`;
    if (route.name) config += ` name ${route.name}`;
    config += '\n';
  });
  return config;
}

function generateCiscoOSPF(ospfConfig) {
  let config = `! OSPF Configuration\nrouter ospf ${ospfConfig.processId || 1}\n`;
  config += `  router-id ${ospfConfig.routerId}\n`;
  ospfConfig.networks.forEach(net => {
    config += `  network ${net.network} ${net.wildcard} area ${net.area}\n`;
  });
  if (ospfConfig.passiveDefault) {
    config += '  passive-interface default\n';
    ospfConfig.activeInterfaces?.forEach(int => {
      config += `  no passive-interface ${int}\n`;
    });
  }
  config += '!\n';
  return config;
}

function generateCiscoEIGRP(eigrpConfig) {
  let config = `! EIGRP Configuration\nrouter eigrp ${eigrpConfig.asn || 1}\n`;
  eigrpConfig.networks.forEach(net => {
    config += `  network ${net.network} ${net.wildcard}\n`;
  });
  config += `  no auto-summary\n!\n`;
  return config;
}

function generateJuniperStatic(routes) {
  let config = '# Static Routes\n';
  routes.forEach(route => {
    config += `set routing-options static route ${route.network}/${route.cidr} next-hop ${route.nextHop}\n`;
  });
  return config;
}

function generateLinuxStatic(routes) {
  let config = '#!/bin/bash\n# Static Routes\n\n';
  routes.forEach(route => {
    config += `ip route add ${route.network}/${route.cidr} via ${route.nextHop}\n`;
  });
  return config;
}

export default function RoutingCalculator() {
  const [isDark, setIsDark] = useState(true);
  const [vendor, setVendor] = useState('cisco');
  const [protocol, setProtocol] = useState('static');
  const [routes, setRoutes] = useState([
    { id: 1, network: '10.0.0.0', mask: '255.0.0.0', cidr: '8', nextHop: '192.168.1.254', distance: '', name: '' }
  ]);
  const [ospfConfig, setOspfConfig] = useState({
    processId: '1',
    routerId: '1.1.1.1',
    networks: [
      { network: '192.168.1.0', wildcard: '0.0.0.255', area: '0' }
    ],
    passiveDefault: true,
    activeInterfaces: ['GigabitEthernet0/0']
  });
  const [eigrpConfig, setEigrpConfig] = useState({
    asn: '100',
    networks: [
      { network: '192.168.1.0', wildcard: '0.0.0.255' }
    ]
  });
  const [config, setConfig] = useState('');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const addRoute = () => {
    const maxId = routes.reduce((max, r) => Math.max(max, r.id), 0);
    setRoutes([...routes, {
      id: maxId + 1,
      network: '',
      mask: '255.255.255.0',
      cidr: '24',
      nextHop: '',
      distance: '',
      name: ''
    }]);
  };

  const removeRoute = (id) => {
    setRoutes(routes.filter(r => r.id !== id));
  };

  const updateRoute = (id, field, value) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const generateConfig = () => {
    let generated = '';

    if (protocol === 'static') {
      if (vendor === 'cisco') {
        generated = generateCiscoStatic(routes);
      } else if (vendor === 'juniper') {
        generated = generateJuniperStatic(routes);
      } else if (vendor === 'linux') {
        generated = generateLinuxStatic(routes);
      }
    } else if (protocol === 'ospf' && vendor === 'cisco') {
      generated = generateCiscoOSPF(ospfConfig);
    } else if (protocol === 'eigrp' && vendor === 'cisco') {
      generated = generateCiscoEIGRP(eigrpConfig);
    } else {
      generated = '! Protocol configuration template not available for this vendor\n';
    }

    setConfig(generated);
  };

  return (
    <ToolPageWrapper
      title="Routing Configuration"
      description="Generate routing configurations for static routes and dynamic protocols"
      icon={Route}
      tips={[
        'Configure static routes or dynamic routing protocols',
        'Supports Cisco, Juniper, and Linux platforms'
      ]}
    >
      <div className="space-y-6">
        {/* Settings */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Vendor/Platform</Label>
            <Select value={vendor} onValueChange={setVendor}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {vendors.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Routing Protocol</Label>
            <Select value={protocol} onValueChange={setProtocol}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static Routes</SelectItem>
                {vendor === 'cisco' && (
                  <>
                    <SelectItem value="ospf">OSPF</SelectItem>
                    <SelectItem value="eigrp">EIGRP</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Static Routes */}
        {protocol === 'static' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg">Static Routes</Label>
              <Button variant="outline" size="sm" onClick={addRoute}>
                <Plus className="h-4 w-4 mr-2" />
                Add Route
              </Button>
            </div>

            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white border'}`}>
              <Table>
                <TableHeader>
                  <TableRow className={isDark ? 'border-slate-700' : ''}>
                    <TableHead>Network</TableHead>
                    <TableHead>Mask/CIDR</TableHead>
                    <TableHead>Next Hop</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id} className={isDark ? 'border-slate-700' : ''}>
                      <TableCell>
                        <Input
                          value={route.network}
                          onChange={(e) => updateRoute(route.id, 'network', e.target.value)}
                          placeholder="10.0.0.0"
                          className={`font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={vendor === 'cisco' ? route.mask : route.cidr}
                          onChange={(e) => updateRoute(route.id, vendor === 'cisco' ? 'mask' : 'cidr', e.target.value)}
                          placeholder={vendor === 'cisco' ? '255.0.0.0' : '8'}
                          className={`font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={route.nextHop}
                          onChange={(e) => updateRoute(route.id, 'nextHop', e.target.value)}
                          placeholder="192.168.1.1"
                          className={`font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={route.distance}
                          onChange={(e) => updateRoute(route.id, 'distance', e.target.value)}
                          placeholder="Optional"
                          className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={route.name}
                          onChange={(e) => updateRoute(route.id, 'name', e.target.value)}
                          placeholder="Optional"
                          className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRoute(route.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* OSPF Config */}
        {protocol === 'ospf' && vendor === 'cisco' && (
          <div className={`p-6 rounded-xl space-y-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <h3 className="font-semibold text-lg">OSPF Configuration</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Process ID</Label>
                <Input
                  value={ospfConfig.processId}
                  onChange={(e) => setOspfConfig({...ospfConfig, processId: e.target.value})}
                  className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                />
              </div>
              <div>
                <Label>Router ID</Label>
                <Input
                  value={ospfConfig.routerId}
                  onChange={(e) => setOspfConfig({...ospfConfig, routerId: e.target.value})}
                  placeholder="1.1.1.1"
                  className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                />
              </div>
            </div>
          </div>
        )}

        {/* EIGRP Config */}
        {protocol === 'eigrp' && vendor === 'cisco' && (
          <div className={`p-6 rounded-xl space-y-4 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <h3 className="font-semibold text-lg">EIGRP Configuration</h3>
            <div>
              <Label>Autonomous System Number</Label>
              <Input
                value={eigrpConfig.asn}
                onChange={(e) => setEigrpConfig({...eigrpConfig, asn: e.target.value})}
                className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
          </div>
        )}

        <Button onClick={generateConfig} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          Generate Configuration
        </Button>

        {/* Generated Config */}
        {config && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg">Generated Configuration</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const blob = new Blob([config], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `routing-${protocol}-${vendor}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            <Textarea
              value={config}
              readOnly
              className={`font-mono text-sm min-h-[300px] ${
                isDark ? 'bg-slate-900 border-slate-700 text-cyan-400' : 'bg-slate-50'
              }`}
            />
          </div>
        )}

        {/* AD Reference */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-4">Administrative Distance Reference</h3>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {protocols.map(proto => (
              <div key={proto.id} className={`p-3 rounded-lg flex items-center justify-between ${
                isDark ? 'bg-slate-900/50' : 'bg-white'
              }`}>
                <span>{proto.name}</span>
                <Badge variant="outline">{proto.ad}</Badge>
              </div>
            ))}
          </div>
          <p className={`text-sm mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Lower AD = more trusted. Connected interfaces = 0, Static = 1
          </p>
        </div>
      </div>
    </ToolPageWrapper>
  );
}