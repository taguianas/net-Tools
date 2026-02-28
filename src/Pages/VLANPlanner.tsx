import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Download, Copy, Check, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import { saveTemplate } from '@/components/utils/storage';

const vendors = [
  { id: 'cisco', name: 'Cisco IOS' },
  { id: 'juniper', name: 'Juniper JunOS' },
  { id: 'arista', name: 'Arista EOS' },
  { id: 'hp', name: 'HP ProCurve' }
];

function generateCiscoConfig(vlans) {
  let config = '! VLAN Configuration\n';
  vlans.forEach(vlan => {
    config += `vlan ${vlan.id}\n`;
    config += `  name ${vlan.name.replace(/\s+/g, '_')}\n`;
    if (vlan.description) {
      config += `  ! ${vlan.description}\n`;
    }
    config += '!\n';
  });
  config += '\n! Interface VLAN Configuration\n';
  vlans.forEach(vlan => {
    if (vlan.gateway) {
      config += `interface Vlan${vlan.id}\n`;
      config += `  description ${vlan.name}\n`;
      config += `  ip address ${vlan.gateway} ${vlan.mask || '255.255.255.0'}\n`;
      config += `  no shutdown\n`;
      config += '!\n';
    }
  });
  return config;
}

function generateJuniperConfig(vlans) {
  let config = '# VLAN Configuration\n';
  config += 'vlans {\n';
  vlans.forEach(vlan => {
    config += `    ${vlan.name.replace(/\s+/g, '-').toLowerCase()} {\n`;
    config += `        vlan-id ${vlan.id};\n`;
    if (vlan.description) {
      config += `        description "${vlan.description}";\n`;
    }
    if (vlan.gateway) {
      config += `        l3-interface irb.${vlan.id};\n`;
    }
    config += '    }\n';
  });
  config += '}\n';
  
  vlans.filter(v => v.gateway).forEach(vlan => {
    config += `\n# IRB Interface for ${vlan.name}\n`;
    config += `interfaces {\n`;
    config += `    irb {\n`;
    config += `        unit ${vlan.id} {\n`;
    config += `            family inet {\n`;
    config += `                address ${vlan.gateway}/${vlan.cidr || '24'};\n`;
    config += `            }\n`;
    config += `        }\n`;
    config += `    }\n`;
    config += `}\n`;
  });
  return config;
}

function generateAristaConfig(vlans) {
  let config = '! VLAN Configuration\n';
  vlans.forEach(vlan => {
    config += `vlan ${vlan.id}\n`;
    config += `   name ${vlan.name.replace(/\s+/g, '_')}\n`;
    config += '!\n';
  });
  config += '\n! SVI Configuration\n';
  vlans.forEach(vlan => {
    if (vlan.gateway) {
      config += `interface Vlan${vlan.id}\n`;
      config += `   description ${vlan.name}\n`;
      config += `   ip address ${vlan.gateway}/${vlan.cidr || '24'}\n`;
      config += `   no shutdown\n`;
      config += '!\n';
    }
  });
  return config;
}

function generateHPConfig(vlans) {
  let config = '; VLAN Configuration\n';
  vlans.forEach(vlan => {
    config += `vlan ${vlan.id}\n`;
    config += `   name "${vlan.name}"\n`;
    if (vlan.gateway) {
      config += `   ip address ${vlan.gateway} ${vlan.mask || '255.255.255.0'}\n`;
    }
    config += '   exit\n';
  });
  return config;
}

export default function VLANPlanner() {
  const [isDark, setIsDark] = useState(true);
  const [vlans, setVlans] = useState([
    { id: 10, name: 'Management', description: 'Network management', gateway: '192.168.10.1', mask: '255.255.255.0', cidr: '24' },
    { id: 20, name: 'Users', description: 'End user devices', gateway: '192.168.20.1', mask: '255.255.255.0', cidr: '24' },
    { id: 30, name: 'Servers', description: 'Server network', gateway: '192.168.30.1', mask: '255.255.255.0', cidr: '24' }
  ]);
  const [vendor, setVendor] = useState('cisco');
  const [config, setConfig] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const saveAsTemplate = () => {
    const name = prompt('Enter template name:');
    if (name) {
      saveTemplate('VLANPlanner', { name, vlans, vendor });
      alert('Template saved!');
    }
  };

  const addVlan = () => {
    const maxId = vlans.reduce((max, v) => Math.max(max, v.id), 0);
    setVlans([...vlans, { 
      id: maxId + 10, 
      name: `VLAN${maxId + 10}`, 
      description: '', 
      gateway: '', 
      mask: '255.255.255.0',
      cidr: '24'
    }]);
  };

  const removeVlan = (id) => {
    setVlans(vlans.filter(v => v.id !== id));
  };

  const updateVlan = (id, field, value) => {
    setVlans(vlans.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const generateConfig = () => {
    let generatedConfig = '';
    switch (vendor) {
      case 'cisco':
        generatedConfig = generateCiscoConfig(vlans);
        break;
      case 'juniper':
        generatedConfig = generateJuniperConfig(vlans);
        break;
      case 'arista':
        generatedConfig = generateAristaConfig(vlans);
        break;
      case 'hp':
        generatedConfig = generateHPConfig(vlans);
        break;
      default:
        generatedConfig = generateCiscoConfig(vlans);
    }
    setConfig(generatedConfig);
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportConfig = () => {
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vlan-config-${vendor}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageWrapper
      title="VLAN Planner"
      description="Design VLANs and generate vendor-specific configuration templates"
      icon={Layers}
      tips={[
        'Define your VLANs with IDs, names, and optional gateway addresses.',
        'Generate configuration for Cisco, Juniper, Arista, or HP switches.'
      ]}
    >
      <Tabs defaultValue="plan" className="space-y-6">
        <TabsList className={isDark ? 'bg-slate-800' : ''}>
          <TabsTrigger value="plan">VLAN Plan</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-6">
          <div className="flex justify-between items-center">
            <Label className="text-lg">VLAN Definitions</Label>
            <Button variant="outline" size="sm" onClick={addVlan}>
              <Plus className="h-4 w-4 mr-2" />
              Add VLAN
            </Button>
          </div>

          <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white'}`}>
            <Table>
              <TableHeader>
                <TableRow className={isDark ? 'border-slate-700' : ''}>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Mask</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vlans.map((vlan) => (
                  <TableRow key={vlan.id} className={isDark ? 'border-slate-700' : ''}>
                    <TableCell>
                      <Input
                        type="number"
                        value={vlan.id}
                        onChange={(e) => updateVlan(vlan.id, 'id', parseInt(e.target.value))}
                        className={`w-20 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={vlan.name}
                        onChange={(e) => updateVlan(vlan.id, 'name', e.target.value)}
                        className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={vlan.description}
                        onChange={(e) => updateVlan(vlan.id, 'description', e.target.value)}
                        placeholder="Optional"
                        className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={vlan.gateway}
                        onChange={(e) => updateVlan(vlan.id, 'gateway', e.target.value)}
                        placeholder="Optional"
                        className={`font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={vlan.mask}
                        onChange={(e) => updateVlan(vlan.id, 'mask', e.target.value)}
                        className={`font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVlan(vlan.id)}
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
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Vendor</Label>
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
          </div>

          <div className="flex gap-4">
            <Button onClick={generateConfig} className="bg-gradient-to-r from-cyan-500 to-blue-600">
              Generate Configuration
            </Button>
            <Button variant="outline" onClick={saveAsTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>

          {config && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg">Generated Configuration</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyConfig}>
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportConfig}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
              <Textarea
                value={config}
                readOnly
                className={`font-mono text-sm min-h-[400px] ${isDark ? 'bg-slate-900 border-slate-700 text-cyan-400' : 'bg-slate-50'}`}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ToolPageWrapper>
  );
}