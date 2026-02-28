import React, { useState, useEffect } from 'react';
import { Globe, ArrowRightLeft, Hash, Shuffle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

// IPv6 compression/expansion
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

// EUI-64 generation
function generateEUI64(mac, prefix) {
  const macParts = mac.replace(/[:-]/g, '').match(/.{2}/g);
  if (!macParts || macParts.length !== 6) return null;

  // Insert FF:FE in the middle
  const eui64 = [
    ...macParts.slice(0, 3),
    'ff',
    'fe',
    ...macParts.slice(3)
  ];

  // Flip the 7th bit (universal/local bit)
  const firstByte = parseInt(eui64[0], 16);
  eui64[0] = ((firstByte ^ 0x02) >>> 0).toString(16).padStart(2, '0');

  // Format as IPv6 interface identifier
  const interfaceId = eui64.join('').match(/.{4}/g).join(':');
  
  // Clean prefix
  const cleanPrefix = prefix.replace(/\/\d+$/, '').replace(/::?$/, '');
  
  return `${cleanPrefix}:${interfaceId}`;
}

// Wildcard mask calculation
function calculateWildcard(subnetMask) {
  const parts = subnetMask.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return parts.map(p => 255 - p).join('.');
}

function calculateSubnetFromWildcard(wildcardMask) {
  const parts = wildcardMask.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return parts.map(p => 255 - p).join('.');
}

// IP format conversions
function ipToBinary(ip) {
  return ip.split('.').map(n => parseInt(n).toString(2).padStart(8, '0')).join('.');
}

function ipToHex(ip) {
  return ip.split('.').map(n => parseInt(n).toString(16).padStart(2, '0')).join(':');
}

function ipToDecimal(ip) {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export default function IPUtilities() {
  const [isDark, setIsDark] = useState(true);
  
  // IPv6 state
  const [ipv6Input, setIpv6Input] = useState('2001:0db8:0000:0000:0000:0000:0000:0001');
  const [ipv6Result, setIpv6Result] = useState(null);

  // EUI-64 state
  const [macInput, setMacInput] = useState('00:1A:2B:3C:4D:5E');
  const [prefixInput, setPrefixInput] = useState('2001:db8:1234:5678::');
  const [eui64Result, setEui64Result] = useState(null);

  // Wildcard state
  const [maskInput, setMaskInput] = useState('255.255.255.0');
  const [wildcardResult, setWildcardResult] = useState(null);
  const [maskMode, setMaskMode] = useState('subnet');

  // IP Conversion state
  const [convertInput, setConvertInput] = useState('192.168.1.1');
  const [convertResult, setConvertResult] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleIPv6Convert = () => {
    try {
      const compressed = compressIPv6(ipv6Input);
      const expanded = expandIPv6(ipv6Input);
      setIpv6Result({ compressed, expanded });
    } catch {
      setIpv6Result({ error: 'Invalid IPv6 address' });
    }
  };

  const handleEUI64 = () => {
    const result = generateEUI64(macInput, prefixInput);
    if (result) {
      setEui64Result({ 
        address: result,
        compressed: compressIPv6(result),
        expanded: expandIPv6(result)
      });
    } else {
      setEui64Result({ error: 'Invalid MAC address' });
    }
  };

  const handleWildcard = () => {
    if (maskMode === 'subnet') {
      const wildcard = calculateWildcard(maskInput);
      setWildcardResult(wildcard ? { subnet: maskInput, wildcard } : { error: 'Invalid subnet mask' });
    } else {
      const subnet = calculateSubnetFromWildcard(maskInput);
      setWildcardResult(subnet ? { subnet, wildcard: maskInput } : { error: 'Invalid wildcard mask' });
    }
  };

  const handleConvert = () => {
    try {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipRegex.test(convertInput)) throw new Error();
      
      setConvertResult({
        decimal: ipToDecimal(convertInput).toString(),
        binary: ipToBinary(convertInput),
        hex: ipToHex(convertInput)
      });
    } catch {
      setConvertResult({ error: 'Invalid IP address' });
    }
  };

  return (
    <ToolPageWrapper
      title="IP Utilities"
      description="IPv6 compression, EUI-64 generation, wildcard masks, and format conversions"
      icon={Globe}
      tips={['A collection of handy IP address utilities for daily network tasks.']}
    >
      <Tabs defaultValue="ipv6" className="space-y-6">
        <TabsList className={`grid w-full max-w-2xl grid-cols-4 ${isDark ? 'bg-slate-800' : ''}`}>
          <TabsTrigger value="ipv6">IPv6</TabsTrigger>
          <TabsTrigger value="eui64">EUI-64</TabsTrigger>
          <TabsTrigger value="wildcard">Wildcard</TabsTrigger>
          <TabsTrigger value="convert">Convert</TabsTrigger>
        </TabsList>

        {/* IPv6 Compression/Expansion */}
        <TabsContent value="ipv6" className="space-y-6">
          <div>
            <Label>IPv6 Address</Label>
            <Input
              value={ipv6Input}
              onChange={(e) => setIpv6Input(e.target.value)}
              placeholder="2001:db8::1"
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <Button onClick={handleIPv6Convert} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Convert
          </Button>
          {ipv6Result && !ipv6Result.error && (
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard label="Compressed" value={ipv6Result.compressed} />
              <ResultCard label="Expanded" value={ipv6Result.expanded} />
            </div>
          )}
          {ipv6Result?.error && <p className="text-red-500">{ipv6Result.error}</p>}
        </TabsContent>

        {/* EUI-64 */}
        <TabsContent value="eui64" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>MAC Address</Label>
              <Input
                value={macInput}
                onChange={(e) => setMacInput(e.target.value)}
                placeholder="00:1A:2B:3C:4D:5E"
                className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
            <div>
              <Label>IPv6 Prefix</Label>
              <Input
                value={prefixInput}
                onChange={(e) => setPrefixInput(e.target.value)}
                placeholder="2001:db8::"
                className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
          </div>
          <Button onClick={handleEUI64} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <Hash className="h-4 w-4 mr-2" />
            Generate EUI-64
          </Button>
          {eui64Result && !eui64Result.error && (
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard label="Full Address (Compressed)" value={eui64Result.compressed} />
              <ResultCard label="Full Address (Expanded)" value={eui64Result.expanded} />
            </div>
          )}
          {eui64Result?.error && <p className="text-red-500">{eui64Result.error}</p>}
        </TabsContent>

        {/* Wildcard Mask */}
        <TabsContent value="wildcard" className="space-y-6">
          <div className="flex gap-4 mb-4">
            <Button
              variant={maskMode === 'subnet' ? 'default' : 'outline'}
              onClick={() => setMaskMode('subnet')}
              size="sm"
            >
              Subnet → Wildcard
            </Button>
            <Button
              variant={maskMode === 'wildcard' ? 'default' : 'outline'}
              onClick={() => setMaskMode('wildcard')}
              size="sm"
            >
              Wildcard → Subnet
            </Button>
          </div>
          <div>
            <Label>{maskMode === 'subnet' ? 'Subnet Mask' : 'Wildcard Mask'}</Label>
            <Input
              value={maskInput}
              onChange={(e) => setMaskInput(e.target.value)}
              placeholder={maskMode === 'subnet' ? '255.255.255.0' : '0.0.0.255'}
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <Button onClick={handleWildcard} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <Shuffle className="h-4 w-4 mr-2" />
            Calculate
          </Button>
          {wildcardResult && !wildcardResult.error && (
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard label="Subnet Mask" value={wildcardResult.subnet} />
              <ResultCard label="Wildcard Mask" value={wildcardResult.wildcard} />
            </div>
          )}
          {wildcardResult?.error && <p className="text-red-500">{wildcardResult.error}</p>}
        </TabsContent>

        {/* IP Conversion */}
        <TabsContent value="convert" className="space-y-6">
          <div>
            <Label>IPv4 Address</Label>
            <Input
              value={convertInput}
              onChange={(e) => setConvertInput(e.target.value)}
              placeholder="192.168.1.1"
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <Button onClick={handleConvert} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Convert
          </Button>
          {convertResult && !convertResult.error && (
            <div className="grid gap-4 md:grid-cols-3">
              <ResultCard label="Decimal" value={convertResult.decimal} />
              <ResultCard label="Binary" value={convertResult.binary} />
              <ResultCard label="Hexadecimal" value={convertResult.hex} />
            </div>
          )}
          {convertResult?.error && <p className="text-red-500">{convertResult.error}</p>}
        </TabsContent>
      </Tabs>
    </ToolPageWrapper>
  );
}