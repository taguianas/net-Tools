import React, { useState, useEffect } from 'react';
import { List, Upload, Download, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

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

function calculateSubnet(ip, cidr) {
  const ipLong = ipToLong(ip);
  const mask = (~0 << (32 - cidr)) >>> 0;
  const network = (ipLong & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  
  return {
    network: longToIp(network),
    broadcast: longToIp(broadcast),
    firstHost: longToIp(network + 1),
    lastHost: longToIp(broadcast - 1),
    subnetMask: longToIp(mask),
    usableHosts: Math.pow(2, 32 - cidr) - 2
  };
}

function normalizeMac(mac) {
  const cleaned = mac.replace(/[:\-\.]/g, '').toUpperCase();
  if (cleaned.length < 6) return null;
  return cleaned.substring(0, 6).match(/.{2}/g).join(':');
}

export default function BatchProcessor() {
  const [isDark, setIsDark] = useState(true);
  const [operation, setOperation] = useState('subnet');
  const [inputText, setInputText] = useState('192.168.1.0/24\n10.0.0.0/8\n172.16.0.0/12');
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const processBatch = () => {
    setProcessing(true);
    setResults([]);

    setTimeout(() => {
      const lines = inputText.split('\n').filter(l => l.trim());
      const processed = [];

      if (operation === 'subnet') {
        lines.forEach((line, index) => {
          try {
            const [ip, cidr] = line.trim().split('/');
            if (ip && cidr) {
              const result = calculateSubnet(ip, parseInt(cidr));
              processed.push({
                index,
                input: line.trim(),
                ...result,
                success: true
              });
            } else {
              processed.push({ index, input: line.trim(), error: 'Invalid format', success: false });
            }
          } catch (e) {
            processed.push({ index, input: line.trim(), error: 'Calculation failed', success: false });
          }
        });
      } else if (operation === 'mac') {
        lines.forEach((line, index) => {
          const oui = normalizeMac(line.trim());
          if (oui) {
            processed.push({
              index,
              input: line.trim(),
              oui,
              formatted: line.trim().replace(/[:\-\.]/g, '').toUpperCase().match(/.{2}/g).join(':'),
              success: true
            });
          } else {
            processed.push({ index, input: line.trim(), error: 'Invalid MAC', success: false });
          }
        });
      } else if (operation === 'cidr') {
        lines.forEach((line, index) => {
          try {
            const ip = line.trim();
            const parts = ip.split('.').map(Number);
            if (parts.length === 4 && parts.every(p => p >= 0 && p <= 255)) {
              let cidr = 24; // Default
              if (parts[0] >= 1 && parts[0] <= 126) cidr = 8;
              else if (parts[0] >= 128 && parts[0] <= 191) cidr = 16;
              
              const result = calculateSubnet(ip, cidr);
              processed.push({
                index,
                input: ip,
                suggestedCidr: cidr,
                ...result,
                success: true
              });
            } else {
              processed.push({ index, input: line.trim(), error: 'Invalid IP', success: false });
            }
          } catch (e) {
            processed.push({ index, input: line.trim(), error: 'Processing failed', success: false });
          }
        });
      }

      setResults(processed);
      setProcessing(false);
    }, 500);
  };

  const exportResults = () => {
    let csv = '';
    
    if (operation === 'subnet') {
      csv = 'Input,Network,Broadcast,First Host,Last Host,Subnet Mask,Usable Hosts\n';
      results.filter(r => r.success).forEach(r => {
        csv += `${r.input},${r.network},${r.broadcast},${r.firstHost},${r.lastHost},${r.subnetMask},${r.usableHosts}\n`;
      });
    } else if (operation === 'mac') {
      csv = 'Input,OUI,Formatted\n';
      results.filter(r => r.success).forEach(r => {
        csv += `${r.input},${r.oui},${r.formatted}\n`;
      });
    } else if (operation === 'cidr') {
      csv = 'IP Address,Suggested CIDR,Network,Broadcast,Usable Hosts\n';
      results.filter(r => r.success).forEach(r => {
        csv += `${r.input},/${r.suggestedCidr},${r.network},${r.broadcast},${r.usableHosts}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-${operation}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setInputText(event.target?.result as string);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <ToolPageWrapper
      title="Batch Processor"
      description="Process multiple IP addresses, subnets, or MAC addresses at once"
      icon={List}
      tips={[
        'Enter one item per line for batch processing',
        'Export results to CSV for documentation or further analysis'
      ]}
    >
      <div className="space-y-6">
        {/* Operation Selection */}
        <div>
          <Label>Operation Type</Label>
          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subnet">Subnet Calculation (IP/CIDR)</SelectItem>
              <SelectItem value="mac">MAC Address Formatting</SelectItem>
              <SelectItem value="cidr">IP to Network (Auto CIDR)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Input Area */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>
              Input Data (one per line)
              {operation === 'subnet' && ' - Format: 192.168.1.0/24'}
              {operation === 'mac' && ' - Format: 00:1A:2B:3C:4D:5E'}
              {operation === 'cidr' && ' - Format: 192.168.1.0'}
            </Label>
            <Button variant="ghost" size="sm" onClick={loadFromFile}>
              <Upload className="h-4 w-4 mr-2" />
              Load File
            </Button>
          </div>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              operation === 'subnet' ? '192.168.1.0/24\n10.0.0.0/8\n172.16.0.0/12' :
              operation === 'mac' ? '00:1A:2B:3C:4D:5E\n00-1A-2B-3C-4D-5F\n001A2B3C4D60' :
              '192.168.1.0\n10.0.0.0\n172.16.0.0'
            }
            className={`mt-1 font-mono min-h-[200px] ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
          />
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={processBatch} 
            disabled={processing}
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            {processing ? (
              <>Processing...</>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Process Batch
              </>
            )}
          </Button>
          {results.length > 0 && (
            <Button variant="outline" onClick={exportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Results</h3>
              <div className="flex gap-4">
                <Badge variant="outline" className="text-green-400 border-green-500/30">
                  Success: {results.filter(r => r.success).length}
                </Badge>
                <Badge variant="outline" className="text-red-400 border-red-500/30">
                  Errors: {results.filter(r => !r.success).length}
                </Badge>
              </div>
            </div>

            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white border'}`}>
              <Table>
                <TableHeader>
                  <TableRow className={isDark ? 'border-slate-700' : ''}>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Input</TableHead>
                    {operation === 'subnet' && (
                      <>
                        <TableHead>Network</TableHead>
                        <TableHead>First Host</TableHead>
                        <TableHead>Last Host</TableHead>
                        <TableHead>Usable</TableHead>
                      </>
                    )}
                    {operation === 'mac' && (
                      <>
                        <TableHead>OUI</TableHead>
                        <TableHead>Formatted</TableHead>
                      </>
                    )}
                    {operation === 'cidr' && (
                      <>
                        <TableHead>Suggested CIDR</TableHead>
                        <TableHead>Network</TableHead>
                        <TableHead>Usable Hosts</TableHead>
                      </>
                    )}
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.index} className={isDark ? 'border-slate-700' : ''}>
                      <TableCell>{result.index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{result.input}</TableCell>
                      
                      {operation === 'subnet' && result.success && (
                        <>
                          <TableCell className="font-mono text-sm text-cyan-400">{result.network}</TableCell>
                          <TableCell className="font-mono text-sm">{result.firstHost}</TableCell>
                          <TableCell className="font-mono text-sm">{result.lastHost}</TableCell>
                          <TableCell>{result.usableHosts.toLocaleString()}</TableCell>
                        </>
                      )}
                      
                      {operation === 'mac' && result.success && (
                        <>
                          <TableCell className="font-mono text-sm">{result.oui}</TableCell>
                          <TableCell className="font-mono text-sm text-cyan-400">{result.formatted}</TableCell>
                        </>
                      )}
                      
                      {operation === 'cidr' && result.success && (
                        <>
                          <TableCell className="font-mono">/{result.suggestedCidr}</TableCell>
                          <TableCell className="font-mono text-sm text-cyan-400">{result.network}</TableCell>
                          <TableCell>{result.usableHosts.toLocaleString()}</TableCell>
                        </>
                      )}
                      
                      <TableCell>
                        {result.success ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            ✓ Success
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                            ✗ {result.error}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}