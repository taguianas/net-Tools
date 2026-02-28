import React, { useState, useEffect } from 'react';
import { Ruler, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

const protocols = [
  { id: 'ethernet', name: 'Ethernet', mtu: 1500, overhead: 0 },
  { id: 'pppoe', name: 'PPPoE', mtu: 1492, overhead: 8 },
  { id: 'gre', name: 'GRE Tunnel', mtu: 1476, overhead: 24 },
  { id: 'ipsec-esp', name: 'IPsec ESP', mtu: 1438, overhead: 62 },
  { id: 'ipsec-ah', name: 'IPsec AH', mtu: 1468, overhead: 32 },
  { id: 'vxlan', name: 'VXLAN', mtu: 1450, overhead: 50 },
  { id: 'mpls-1', name: 'MPLS (1 label)', mtu: 1496, overhead: 4 },
  { id: 'mpls-2', name: 'MPLS (2 labels)', mtu: 1492, overhead: 8 },
  { id: 'gtp', name: 'GTP-U (LTE)', mtu: 1440, overhead: 60 },
  { id: 'wireguard', name: 'WireGuard', mtu: 1420, overhead: 80 },
];

const ipVersions = [
  { id: 'ipv4', name: 'IPv4', headerSize: 20, tcpHeader: 20, udpHeader: 8 },
  { id: 'ipv6', name: 'IPv6', headerSize: 40, tcpHeader: 20, udpHeader: 8 },
];

export default function MTUCalculator() {
  const [isDark, setIsDark] = useState(true);
  const [baseMtu, setBaseMtu] = useState(1500);
  const [selectedProtocol, setSelectedProtocol] = useState('ethernet');
  const [ipVersion, setIpVersion] = useState('ipv4');
  const [customOverhead, setCustomOverhead] = useState(0);
  const [payloadSize, setPayloadSize] = useState(1400);
  const [results, setResults] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const calculateMTU = () => {
    const protocol = protocols.find(p => p.id === selectedProtocol);
    const ip = ipVersions.find(v => v.id === ipVersion);
    
    const totalOverhead = protocol.overhead + customOverhead;
    const effectiveMtu = baseMtu - totalOverhead;
    const tcpMss = effectiveMtu - ip.headerSize - ip.tcpHeader;
    const udpPayload = effectiveMtu - ip.headerSize - ip.udpHeader;

    // Fragmentation calculation
    const fragmentsNeeded = Math.ceil(payloadSize / (effectiveMtu - ip.headerSize));
    const lastFragmentSize = payloadSize % (effectiveMtu - ip.headerSize) || (effectiveMtu - ip.headerSize);
    const fragmentOverhead = (fragmentsNeeded - 1) * ip.headerSize;

    setResults({
      effectiveMtu,
      tcpMss,
      udpPayload,
      totalOverhead,
      protocolOverhead: protocol.overhead,
      ipHeaderSize: ip.headerSize,
      tcpHeaderSize: ip.tcpHeader,
      udpHeaderSize: ip.udpHeader,
      fragmentsNeeded,
      lastFragmentSize,
      fragmentOverhead,
      totalWithFragmentation: payloadSize + fragmentOverhead + ip.headerSize
    });
  };

  const protocol = protocols.find(p => p.id === selectedProtocol);

  return (
    <ToolPageWrapper
      title="MTU Calculator"
      description="Calculate MTU, MSS, and fragmentation overhead for various protocols"
      icon={Ruler}
      tips={[
        'Select your encapsulation protocol and IP version to calculate effective MTU.',
        'The tool accounts for protocol overhead and calculates TCP MSS automatically.'
      ]}
    >
      <div className="space-y-6">
        {/* Input Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Base MTU</Label>
            <Input
              type="number"
              value={baseMtu}
              onChange={(e) => setBaseMtu(parseInt(e.target.value) || 1500)}
              className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>

          <div>
            <Label>Encapsulation Protocol</Label>
            <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {protocols.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} (-{p.overhead} bytes)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>IP Version</Label>
            <Select value={ipVersion} onValueChange={setIpVersion}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ipVersions.map(v => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} ({v.headerSize} byte header)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Additional Overhead (bytes)</Label>
            <Input
              type="number"
              value={customOverhead}
              onChange={(e) => setCustomOverhead(parseInt(e.target.value) || 0)}
              className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
        </div>

        {/* Payload Size Slider */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <Label className="mb-4 block">Test Payload Size: {payloadSize} bytes</Label>
          <Slider
            value={[payloadSize]}
            onValueChange={(v) => setPayloadSize(v[0])}
            min={100}
            max={9000}
            step={100}
            className="my-4"
          />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Adjust to see fragmentation behavior for different payload sizes
          </p>
        </div>

        <Button onClick={calculateMTU} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          Calculate
        </Button>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Main Results */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <ResultCard label="Effective MTU" value={`${results.effectiveMtu} bytes`} />
              <ResultCard label="TCP MSS" value={`${results.tcpMss} bytes`} />
              <ResultCard label="Max UDP Payload" value={`${results.udpPayload} bytes`} />
              <ResultCard label="Total Overhead" value={`${results.totalOverhead} bytes`} />
            </div>

            {/* Overhead Breakdown */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-cyan-500" />
                Overhead Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Protocol ({protocol?.name})</span>
                  <span className="font-mono">{results.protocolOverhead} bytes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>IP Header ({ipVersion.toUpperCase()})</span>
                  <span className="font-mono">{results.ipHeaderSize} bytes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>TCP Header</span>
                  <span className="font-mono">{results.tcpHeaderSize} bytes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>UDP Header</span>
                  <span className="font-mono">{results.udpHeaderSize} bytes</span>
                </div>
                {customOverhead > 0 && (
                  <div className="flex justify-between items-center">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Custom Overhead</span>
                    <span className="font-mono">{customOverhead} bytes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fragmentation Analysis */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <h3 className="font-semibold mb-4">Fragmentation Analysis (for {payloadSize} byte payload)</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Fragments Needed</p>
                  <p className={`text-2xl font-bold ${results.fragmentsNeeded > 1 ? 'text-amber-400' : 'text-green-400'}`}>
                    {results.fragmentsNeeded}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Last Fragment Size</p>
                  <p className="text-2xl font-bold">{results.lastFragmentSize} bytes</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Fragmentation Overhead</p>
                  <p className={`text-2xl font-bold ${results.fragmentOverhead > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                    {results.fragmentOverhead} bytes
                  </p>
                </div>
              </div>
              {results.fragmentsNeeded > 1 && (
                <p className={`mt-4 text-sm ${isDark ? 'text-amber-400/80' : 'text-amber-600'}`}>
                  ⚠️ This payload will be fragmented. Consider reducing payload size or increasing MTU.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}