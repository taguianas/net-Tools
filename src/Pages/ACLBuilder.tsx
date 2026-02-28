import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, Download, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const vendors = [
  { id: 'cisco', name: 'Cisco IOS' },
  { id: 'juniper', name: 'Juniper JunOS' },
  { id: 'iptables', name: 'Linux iptables' },
  { id: 'pf', name: 'BSD PF' },
  { id: 'fortigate', name: 'FortiGate' },
];

const actions = ['permit', 'deny'];
const protocols = ['ip', 'tcp', 'udp', 'icmp', 'esp', 'ah', 'gre'];

function generateCiscoACL(rules, aclNumber, aclName) {
  let config = aclName 
    ? `ip access-list extended ${aclName}\n`
    : `access-list ${aclNumber}\n`;
  
  rules.forEach((rule, index) => {
    const seq = (index + 1) * 10;
    let line = ` ${rule.action} ${rule.protocol}`;
    
    if (rule.sourceIp) {
      line += ` ${rule.sourceIp}`;
      if (rule.sourceWildcard) {
        line += ` ${rule.sourceWildcard}`;
      }
    } else {
      line += ' any';
    }
    
    if (rule.destIp) {
      line += ` ${rule.destIp}`;
      if (rule.destWildcard) {
        line += ` ${rule.destWildcard}`;
      }
    } else {
      line += ' any';
    }
    
    if ((rule.protocol === 'tcp' || rule.protocol === 'udp') && rule.destPort) {
      line += ` eq ${rule.destPort}`;
    }
    
    if (rule.log) {
      line += ' log';
    }
    
    config += aclName ? ` ${seq}${line}\n` : `${line}\n`;
  });
  
  return config;
}

function generateJuniperACL(rules, filterName) {
  let config = `firewall {\n    filter ${filterName} {\n`;
  
  rules.forEach((rule, index) => {
    config += `        term ${rule.name || `term-${index + 1}`} {\n`;
    config += `            from {\n`;
    
    if (rule.protocol !== 'ip') {
      config += `                protocol ${rule.protocol};\n`;
    }
    if (rule.sourceIp && rule.sourceIp !== 'any') {
      config += `                source-address {\n`;
      config += `                    ${rule.sourceIp}/${rule.sourceCidr || '32'};\n`;
      config += `                }\n`;
    }
    if (rule.destIp && rule.destIp !== 'any') {
      config += `                destination-address {\n`;
      config += `                    ${rule.destIp}/${rule.destCidr || '32'};\n`;
      config += `                }\n`;
    }
    if (rule.destPort) {
      config += `                destination-port ${rule.destPort};\n`;
    }
    
    config += `            }\n`;
    config += `            then {\n`;
    config += `                ${rule.action};\n`;
    if (rule.log) {
      config += `                log;\n`;
    }
    config += `            }\n`;
    config += `        }\n`;
  });
  
  config += `    }\n}\n`;
  return config;
}

function generateIptables(rules) {
  let config = '#!/bin/bash\n# iptables firewall rules\n\n';
  config += '# Flush existing rules\niptables -F\niptables -X\n\n';
  config += '# Default policies\niptables -P INPUT DROP\niptables -P FORWARD DROP\niptables -P OUTPUT ACCEPT\n\n';
  config += '# Allow loopback\niptables -A INPUT -i lo -j ACCEPT\n\n';
  config += '# Allow established connections\niptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n\n';
  config += '# Custom rules\n';
  
  rules.forEach((rule, index) => {
    let line = 'iptables -A INPUT';
    
    if (rule.protocol !== 'ip') {
      line += ` -p ${rule.protocol}`;
    }
    
    if (rule.sourceIp && rule.sourceIp !== 'any') {
      line += ` -s ${rule.sourceIp}`;
      if (rule.sourceCidr) {
        line += `/${rule.sourceCidr}`;
      }
    }
    
    if (rule.destIp && rule.destIp !== 'any') {
      line += ` -d ${rule.destIp}`;
      if (rule.destCidr) {
        line += `/${rule.destCidr}`;
      }
    }
    
    if (rule.destPort) {
      line += ` --dport ${rule.destPort}`;
    }
    
    line += ` -j ${rule.action.toUpperCase()}`;
    
    if (rule.log) {
      config += `${line.replace('-j', '-j LOG --log-prefix "[FW-LOG] " ; iptables -A INPUT')} ${line.split('-A INPUT')[1]}\n`;
    } else {
      config += `${line}\n`;
    }
  });
  
  return config;
}

export default function ACLBuilder() {
  const [isDark, setIsDark] = useState(true);
  const [vendor, setVendor] = useState('cisco');
  const [aclName, setAclName] = useState('ALLOW_TRAFFIC');
  const [aclNumber, setAclNumber] = useState('100');
  const [rules, setRules] = useState([
    { 
      id: 1, 
      name: 'allow-ssh', 
      action: 'permit', 
      protocol: 'tcp', 
      sourceIp: 'any', 
      sourceWildcard: '',
      sourceCidr: '',
      destIp: '', 
      destWildcard: '0.0.0.0',
      destCidr: '32',
      destPort: '22',
      log: false 
    }
  ]);
  const [config, setConfig] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const addRule = () => {
    const maxId = rules.reduce((max, r) => Math.max(max, r.id), 0);
    setRules([...rules, {
      id: maxId + 1,
      name: `rule-${maxId + 1}`,
      action: 'permit',
      protocol: 'tcp',
      sourceIp: 'any',
      sourceWildcard: '',
      sourceCidr: '',
      destIp: '',
      destWildcard: '0.0.0.0',
      destCidr: '32',
      destPort: '',
      log: false
    }]);
  };

  const removeRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id, field, value) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const generateConfig = () => {
    let generated = '';
    
    switch (vendor) {
      case 'cisco':
        generated = generateCiscoACL(rules, aclNumber, aclName);
        break;
      case 'juniper':
        generated = generateJuniperACL(rules, aclName);
        break;
      case 'iptables':
        generated = generateIptables(rules);
        break;
      case 'pf':
        generated = '# BSD PF configuration\n';
        rules.forEach(rule => {
          let line = `${rule.action === 'permit' ? 'pass' : 'block'}`;
          line += ` in on em0 proto ${rule.protocol}`;
          if (rule.sourceIp && rule.sourceIp !== 'any') {
            line += ` from ${rule.sourceIp}`;
          } else {
            line += ' from any';
          }
          if (rule.destIp && rule.destIp !== 'any') {
            line += ` to ${rule.destIp}`;
          } else {
            line += ' to any';
          }
          if (rule.destPort) {
            line += ` port ${rule.destPort}`;
          }
          if (rule.log) {
            line += ' log';
          }
          generated += `${line}\n`;
        });
        break;
      case 'fortigate':
        generated = 'config firewall policy\n';
        rules.forEach((rule, index) => {
          generated += `    edit ${index + 1}\n`;
          generated += `        set name "${rule.name}"\n`;
          generated += `        set srcintf "any"\n`;
          generated += `        set dstintf "any"\n`;
          generated += `        set srcaddr "${rule.sourceIp || 'all'}"\n`;
          generated += `        set dstaddr "${rule.destIp || 'all'}"\n`;
          generated += `        set action ${rule.action}\n`;
          generated += `        set schedule "always"\n`;
          generated += `        set service "${rule.protocol}${rule.destPort ? '-' + rule.destPort : ''}"\n`;
          if (rule.log) {
            generated += `        set logtraffic all\n`;
          }
          generated += `    next\n`;
        });
        generated += 'end\n';
        break;
    }
    
    setConfig(generated);
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportConfig = () => {
    const ext = vendor === 'iptables' ? 'sh' : 'txt';
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acl-${aclName}-${vendor}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageWrapper
      title="ACL/Firewall Builder"
      description="Generate access control lists for various network devices"
      icon={Shield}
      tips={[
        'Define rules with source, destination, protocol, and port',
        'Generate configurations for Cisco, Juniper, Linux, and more'
      ]}
    >
      <div className="space-y-6">
        {/* ACL Settings */}
        <div className="grid gap-4 md:grid-cols-3">
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
            <Label>ACL Name</Label>
            <Input
              value={aclName}
              onChange={(e) => setAclName(e.target.value)}
              className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          {vendor === 'cisco' && (
            <div>
              <Label>ACL Number (optional)</Label>
              <Input
                value={aclNumber}
                onChange={(e) => setAclNumber(e.target.value)}
                className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
          )}
        </div>

        {/* Rules */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg">Access Rules</Label>
            <Button variant="outline" size="sm" onClick={addRule}>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={rule.id} className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-mono">
                    #{index + 1}
                  </Badge>
                  <Input
                    value={rule.name}
                    onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                    placeholder="Rule name"
                    className={`flex-1 h-8 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRule(rule.id)}
                    className="text-red-400 hover:text-red-300 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-6">
                  <div>
                    <Select value={rule.action} onValueChange={(v) => updateRule(rule.id, 'action', v)}>
                      <SelectTrigger className={`h-9 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permit">Permit</SelectItem>
                        <SelectItem value="deny">Deny</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Select value={rule.protocol} onValueChange={(v) => updateRule(rule.id, 'protocol', v)}>
                      <SelectTrigger className={`h-9 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {protocols.map(p => (
                          <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Input
                      value={rule.sourceIp}
                      onChange={(e) => updateRule(rule.id, 'sourceIp', e.target.value)}
                      placeholder="Source (any)"
                      className={`h-9 font-mono text-sm ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>

                  <div>
                    <Input
                      value={rule.destIp}
                      onChange={(e) => updateRule(rule.id, 'destIp', e.target.value)}
                      placeholder="Dest (any)"
                      className={`h-9 font-mono text-sm ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>

                  <div>
                    <Input
                      value={rule.destPort}
                      onChange={(e) => updateRule(rule.id, 'destPort', e.target.value)}
                      placeholder="Port"
                      disabled={rule.protocol !== 'tcp' && rule.protocol !== 'udp'}
                      className={`h-9 font-mono text-sm ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rule.log}
                      onChange={(e) => updateRule(rule.id, 'log', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label className="text-sm">Log</Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={generateConfig} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          Generate Configuration
        </Button>

        {/* Generated Config */}
        {config && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
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

        {/* Templates */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-4">Common Rule Templates</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => setRules([
                { id: Date.now(), name: 'allow-ssh', action: 'permit', protocol: 'tcp', sourceIp: 'any', sourceWildcard: '', sourceCidr: '', destIp: '', destWildcard: '', destCidr: '', destPort: '22', log: true }
              ])}
              className="justify-start"
            >
              Allow SSH (TCP/22)
            </Button>
            <Button
              variant="outline"
              onClick={() => setRules([
                { id: Date.now(), name: 'allow-web', action: 'permit', protocol: 'tcp', sourceIp: 'any', sourceWildcard: '', sourceCidr: '', destIp: '', destWildcard: '', destCidr: '', destPort: '80', log: false },
                { id: Date.now() + 1, name: 'allow-https', action: 'permit', protocol: 'tcp', sourceIp: 'any', sourceWildcard: '', sourceCidr: '', destIp: '', destWildcard: '', destCidr: '', destPort: '443', log: false }
              ])}
              className="justify-start"
            >
              Allow Web (TCP/80, 443)
            </Button>
            <Button
              variant="outline"
              onClick={() => setRules([
                { id: Date.now(), name: 'allow-dns', action: 'permit', protocol: 'udp', sourceIp: 'any', sourceWildcard: '', sourceCidr: '', destIp: '', destWildcard: '', destCidr: '', destPort: '53', log: false }
              ])}
              className="justify-start"
            >
              Allow DNS (UDP/53)
            </Button>
            <Button
              variant="outline"
              onClick={() => setRules([
                { id: Date.now(), name: 'deny-telnet', action: 'deny', protocol: 'tcp', sourceIp: 'any', sourceWildcard: '', sourceCidr: '', destIp: '', destWildcard: '', destCidr: '', destPort: '23', log: true }
              ])}
              className="justify-start"
            >
              Block Telnet (TCP/23)
            </Button>
          </div>
        </div>
      </div>
    </ToolPageWrapper>
  );
}