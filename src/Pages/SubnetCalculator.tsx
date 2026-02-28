import React, { useState, useEffect } from 'react';
import { Calculator, Share2, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';
import { addToHistory, saveTemplate } from '@/components/utils/storage';

// IPv4 calculation functions
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

function calculateIPv4Subnet(ip, cidr) {
  const ipLong = ipToLong(ip);
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const network = (ipLong & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const firstHost = cidr >= 31 ? network : network + 1;
  const lastHost = cidr >= 31 ? broadcast : broadcast - 1;
  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;

  return {
    network: longToIp(network),
    broadcast: longToIp(broadcast),
    firstHost: longToIp(firstHost),
    lastHost: longToIp(lastHost),
    subnetMask: longToIp(mask),
    wildcardMask: longToIp(~mask >>> 0),
    totalHosts,
    usableHosts,
    cidr
  };
}

// IPv6 calculation functions
function expandIPv6(ip) {
  let parts = ip.split('::');
  let left = parts[0] ? parts[0].split(':') : [];
  let right = parts[1] ? parts[1].split(':') : [];
  let missing = 8 - left.length - right.length;
  let middle = Array(missing).fill('0000');
  let full = [...left, ...middle, ...right];
  return full.map(p => p.padStart(4, '0')).join(':');
}

function compressIPv6(ip) {
  const expanded = expandIPv6(ip);
  let parts = expanded.split(':');
  parts = parts.map(p => p.replace(/^0+/, '') || '0');
  
  let longestZeroStart = -1;
  let longestZeroLength = 0;
  let currentStart = -1;
  let currentLength = 0;

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '0') {
      if (currentStart === -1) currentStart = i;
      currentLength++;
    } else {
      if (currentLength > longestZeroLength) {
        longestZeroStart = currentStart;
        longestZeroLength = currentLength;
      }
      currentStart = -1;
      currentLength = 0;
    }
  }
  if (currentLength > longestZeroLength) {
    longestZeroStart = currentStart;
    longestZeroLength = currentLength;
  }

  if (longestZeroLength > 1) {
    parts.splice(longestZeroStart, longestZeroLength, '');
    if (longestZeroStart === 0) parts.unshift('');
    if (longestZeroStart + longestZeroLength === 8) parts.push('');
  }

  return parts.join(':');
}

function calculateIPv6Subnet(ip, prefix) {
  const expanded = expandIPv6(ip);
  const hexStr = expanded.replace(/:/g, '');
  
  const networkHex = hexStr.split('').map((char, i) => {
    const bitPosition = i * 4;
    if (bitPosition >= prefix) return '0';
    if (bitPosition + 4 <= prefix) return char;
    const bits = parseInt(char, 16);
    const mask = (0xF << (4 - (prefix - bitPosition))) & 0xF;
    return (bits & mask).toString(16);
  }).join('');

  const networkAddress = networkHex.match(/.{4}/g).join(':');
  const totalAddresses = BigInt(2) ** BigInt(128 - prefix);

  return {
    network: compressIPv6(networkAddress),
    expanded: expandIPv6(networkAddress),
    prefix,
    totalAddresses: totalAddresses.toString()
  };
}

export default function SubnetCalculator() {
  const [isDark, setIsDark] = useState(true);
  const [ipv4Input, setIpv4Input] = useState('192.168.1.0');
  const [ipv4Cidr, setIpv4Cidr] = useState('24');
  const [ipv4Result, setIpv4Result] = useState(null);
  const [ipv4Error, setIpv4Error] = useState('');

  const [ipv6Input, setIpv6Input] = useState('2001:db8::');
  const [ipv6Prefix, setIpv6Prefix] = useState('64');
  const [ipv6Result, setIpv6Result] = useState(null);
  const [ipv6Error, setIpv6Error] = useState('');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Check URL parameters for shared calculations
    const params = new URLSearchParams(window.location.search);
    if (params.get('ip')) setIpv4Input(params.get('ip'));
    if (params.get('cidr')) setIpv4Cidr(params.get('cidr'));
    if (params.get('ipv6')) setIpv6Input(params.get('ipv6'));
    if (params.get('prefix')) setIpv6Prefix(params.get('prefix'));
  }, []);

  const calculateIPv4 = () => {
    setIpv4Error('');
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipv4Input)) {
      setIpv4Error('Invalid IPv4 address format');
      return;
    }
    const parts = ipv4Input.split('.').map(Number);
    if (parts.some(p => p < 0 || p > 255)) {
      setIpv4Error('Each octet must be between 0-255');
      return;
    }
    const cidr = parseInt(ipv4Cidr);
    if (cidr < 0 || cidr > 32) {
      setIpv4Error('CIDR must be between 0-32');
      return;
    }
    const result = calculateIPv4Subnet(ipv4Input, cidr);
    setIpv4Result(result);
    
    // Save to history
    addToHistory('SubnetCalculator', {
      label: `${ipv4Input}/${cidr}`,
      summary: `Network: ${result.network}, Usable hosts: ${result.usableHosts}`,
      type: 'ipv4',
      ip: ipv4Input,
      cidr: cidr
    });
  };

  const shareIPv4 = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('ip', ipv4Input);
    url.searchParams.set('cidr', ipv4Cidr);
    navigator.clipboard.writeText(url.toString());
    alert('Shareable link copied to clipboard!');
  };

  const calculateIPv6 = () => {
    setIpv6Error('');
    try {
      const prefix = parseInt(ipv6Prefix);
      if (prefix < 0 || prefix > 128) {
        setIpv6Error('Prefix must be between 0-128');
        return;
      }
      setIpv6Result(calculateIPv6Subnet(ipv6Input, prefix));
    } catch {
      setIpv6Error('Invalid IPv6 address format');
    }
  };

  return (
    <ToolPageWrapper
      title="Subnet Calculator"
      description="Calculate IPv4 and IPv6 subnets, network addresses, and host ranges"
      icon={Calculator}
      tips={[
        'Enter an IP address and CIDR notation to calculate subnet details.',
        'Supports both IPv4 (/0-/32) and IPv6 (/0-/128) addresses.'
      ]}
    >
      <Tabs defaultValue="ipv4" className="space-y-6">
        <TabsList className={`grid w-full max-w-md grid-cols-2 ${isDark ? 'bg-slate-800' : ''}`}>
          <TabsTrigger value="ipv4">IPv4</TabsTrigger>
          <TabsTrigger value="ipv6">IPv6</TabsTrigger>
        </TabsList>

        <TabsContent value="ipv4" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="ipv4">IP Address</Label>
              <Input
                id="ipv4"
                value={ipv4Input}
                onChange={(e) => setIpv4Input(e.target.value)}
                placeholder="192.168.1.0"
                className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
            <div>
              <Label htmlFor="cidr">CIDR</Label>
              <Select value={ipv4Cidr} onValueChange={setIpv4Cidr}>
                <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 33 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>/{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {ipv4Error && (
            <p className="text-red-500 text-sm">{ipv4Error}</p>
          )}

          <div className="flex gap-4">
            <Button onClick={calculateIPv4} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
              Calculate Subnet
            </Button>
            {ipv4Result && (
              <Button variant="outline" onClick={shareIPv4}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>

          {ipv4Result && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ResultCard label="Network Address" value={`${ipv4Result.network}/${ipv4Result.cidr}`} />
              <ResultCard label="Subnet Mask" value={ipv4Result.subnetMask} />
              <ResultCard label="Wildcard Mask" value={ipv4Result.wildcardMask} />
              <ResultCard label="Broadcast Address" value={ipv4Result.broadcast} />
              <ResultCard label="First Host" value={ipv4Result.firstHost} />
              <ResultCard label="Last Host" value={ipv4Result.lastHost} />
              <ResultCard label="Total Addresses" value={ipv4Result.totalHosts.toLocaleString()} copyable={false} />
              <ResultCard label="Usable Hosts" value={ipv4Result.usableHosts.toLocaleString()} copyable={false} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="ipv6" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <Label htmlFor="ipv6">IPv6 Address</Label>
              <Input
                id="ipv6"
                value={ipv6Input}
                onChange={(e) => setIpv6Input(e.target.value)}
                placeholder="2001:db8::"
                className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
            <div>
              <Label htmlFor="prefix">Prefix</Label>
              <Select value={ipv6Prefix} onValueChange={setIpv6Prefix}>
                <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[8, 16, 24, 32, 48, 56, 64, 96, 112, 128].map(p => (
                    <SelectItem key={p} value={p.toString()}>/{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {ipv6Error && (
            <p className="text-red-500 text-sm">{ipv6Error}</p>
          )}

          <Button onClick={calculateIPv6} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
            Calculate Subnet
          </Button>

          {ipv6Result && (
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard label="Network Address (Compressed)" value={`${ipv6Result.network}/${ipv6Result.prefix}`} />
              <ResultCard label="Network Address (Expanded)" value={ipv6Result.expanded} />
              <ResultCard label="Total Addresses" value={ipv6Result.totalAddresses} copyable={false} />
              <ResultCard label="Prefix Length" value={`/${ipv6Result.prefix}`} copyable={false} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ToolPageWrapper>
  );
}