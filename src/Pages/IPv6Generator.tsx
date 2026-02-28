import React, { useState, useEffect } from 'react';
import { Globe, Shuffle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

function generateRandomIPv6(prefix = '', type = 'global') {
  const randomHex = () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
  
  if (type === 'global') {
    // Generate global unicast (2000::/3)
    return `2001:${randomHex()}:${randomHex()}:${randomHex()}::${randomHex()}`;
  } else if (type === 'ula') {
    // Generate ULA (fc00::/7)
    return `fd${randomHex().substring(0, 2)}:${randomHex()}:${randomHex()}:${randomHex()}::${randomHex()}`;
  } else if (type === 'link-local') {
    // Generate link-local (fe80::/10)
    return `fe80::${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}`;
  } else if (type === 'custom' && prefix) {
    // Use custom prefix
    const parts = prefix.split(':');
    while (parts.length < 8) {
      parts.push(randomHex());
    }
    return parts.slice(0, 8).join(':');
  }
  
  return `2001:${randomHex()}:${randomHex()}:${randomHex()}::${randomHex()}`;
}

function generatePrivacyExtension(prefix) {
  // RFC 4941 privacy extensions
  const randomHex = () => Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
  const interfaceId = `${randomHex()}:${randomHex()}:${randomHex()}:${randomHex()}`;
  
  return `${prefix}${interfaceId}`;
}

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

export default function IPv6Generator() {
  const [isDark, setIsDark] = useState(true);
  const [addressType, setAddressType] = useState('global');
  const [customPrefix, setCustomPrefix] = useState('2001:db8::');
  const [generated, setGenerated] = useState([]);
  const [batchSize, setBatchSize] = useState(5);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const generate = (count = 1) => {
    const newAddresses = [];
    for (let i = 0; i < count; i++) {
      const address = generateRandomIPv6(
        addressType === 'custom' ? customPrefix : '',
        addressType
      );
      newAddresses.push({
        compressed: compressIPv6(address),
        expanded: expandIPv6(address),
        type: addressType,
        id: Date.now() + i
      });
    }
    setGenerated([...newAddresses, ...generated].slice(0, 50));
  };

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(''), 2000);
  };

  const exportAddresses = () => {
    const text = generated.map(a => a.compressed).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ipv6-addresses.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageWrapper
      title="IPv6 Address Generator"
      description="Generate random IPv6 addresses for testing and development"
      icon={Globe}
      tips={[
        'Generate global unicast, ULA (unique local), or link-local addresses',
        'Use custom prefixes for your network planning'
      ]}
    >
      <div className="space-y-6">
        {/* Generator Controls */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Address Type</Label>
            <Select value={addressType} onValueChange={setAddressType}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global Unicast (2000::/3)</SelectItem>
                <SelectItem value="ula">Unique Local (fc00::/7)</SelectItem>
                <SelectItem value="link-local">Link-Local (fe80::/10)</SelectItem>
                <SelectItem value="custom">Custom Prefix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {addressType === 'custom' && (
            <div>
              <Label>Custom Prefix</Label>
              <Input
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                placeholder="2001:db8::"
                className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
          )}

          <div>
            <Label>Batch Size</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
              className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => generate(1)} 
            className="bg-gradient-to-r from-cyan-500 to-blue-600"
          >
            <Shuffle className="h-4 w-4 mr-2" />
            Generate One
          </Button>
          <Button 
            onClick={() => generate(batchSize)} 
            variant="outline"
          >
            Generate {batchSize}
          </Button>
          {generated.length > 0 && (
            <>
              <Button onClick={exportAddresses} variant="outline">
                Export All
              </Button>
              <Button onClick={() => setGenerated([])} variant="outline">
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Address Type Info */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-2">
            {addressType === 'global' && 'Global Unicast Address (2000::/3)'}
            {addressType === 'ula' && 'Unique Local Address (fc00::/7)'}
            {addressType === 'link-local' && 'Link-Local Address (fe80::/10)'}
            {addressType === 'custom' && 'Custom Prefix Address'}
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {addressType === 'global' && 'Routable on the global Internet. Use for production services.'}
            {addressType === 'ula' && 'Private addresses for internal networks. Not routed on the Internet. Similar to RFC 1918 in IPv4.'}
            {addressType === 'link-local' && 'Only valid on a single link/network segment. Automatically configured on all IPv6 interfaces.'}
            {addressType === 'custom' && 'Generate addresses with your specified prefix for testing or network planning.'}
          </p>
        </div>

        {/* Generated Addresses */}
        {generated.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Generated Addresses</h3>
              <Badge variant="outline">{generated.length} addresses</Badge>
            </div>
            
            <div className="space-y-3">
              {generated.map((addr) => (
                <div 
                  key={addr.id}
                  className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className={`text-xs uppercase font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Compressed
                        </p>
                        <p className="font-mono text-cyan-400 break-all">
                          {addr.compressed}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Expanded
                        </p>
                        <p className={`font-mono text-sm break-all ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {addr.expanded}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyAddress(addr.compressed)}
                    >
                      {copied === addr.compressed ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reference */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-4">IPv6 Address Types Reference</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <p className="font-mono text-cyan-400 mb-2">2000::/3</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Global Unicast - Public Internet addresses
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <p className="font-mono text-cyan-400 mb-2">fc00::/7</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Unique Local - Private network addresses
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <p className="font-mono text-cyan-400 mb-2">fe80::/10</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Link-Local - Single network segment only
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <p className="font-mono text-cyan-400 mb-2">ff00::/8</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Multicast - Group communication
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <p className="font-mono text-cyan-400 mb-2">::1/128</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Loopback - Local host (like 127.0.0.1)
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <p className="font-mono text-cyan-400 mb-2">::/128</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Unspecified - No address assigned
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolPageWrapper>
  );
}