import React, { useState, useEffect } from 'react';
import { Package, Layers as LayersIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

const protocols = [
  { id: 'ethernet', name: 'Ethernet II', header: 14, trailer: 4 },
  { id: '8021q', name: '802.1Q (VLAN)', header: 18, trailer: 4 },
  { id: 'pppoe', name: 'PPPoE', header: 22, trailer: 4 },
];

const l3Protocols = [
  { id: 'ipv4', name: 'IPv4', header: 20, options: true },
  { id: 'ipv6', name: 'IPv6', header: 40, options: false },
];

const l4Protocols = [
  { id: 'tcp', name: 'TCP', header: 20, options: true },
  { id: 'udp', name: 'UDP', header: 8, options: false },
  { id: 'icmp', name: 'ICMP', header: 8, options: false },
];

const tunnelProtocols = [
  { id: 'none', name: 'None', overhead: 0 },
  { id: 'gre', name: 'GRE', overhead: 24 },
  { id: 'ipsec', name: 'IPsec ESP', overhead: 62 },
  { id: 'vxlan', name: 'VXLAN', overhead: 50 },
  { id: 'wireguard', name: 'WireGuard', overhead: 80 },
];

export default function PacketAnalyzer() {
  const [isDark, setIsDark] = useState(true);
  const [l2Protocol, setL2Protocol] = useState('ethernet');
  const [l3Protocol, setL3Protocol] = useState('ipv4');
  const [l4Protocol, setL4Protocol] = useState('tcp');
  const [tunnel, setTunnel] = useState('none');
  const [payloadSize, setPayloadSize] = useState(1400);
  const [ipOptions, setIpOptions] = useState(0);
  const [tcpOptions, setTcpOptions] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const analyze = () => {
    const l2 = protocols.find(p => p.id === l2Protocol);
    const l3 = l3Protocols.find(p => p.id === l3Protocol);
    const l4 = l4Protocols.find(p => p.id === l4Protocol);
    const tun = tunnelProtocols.find(p => p.id === tunnel);

    const l2Overhead = l2.header + l2.trailer;
    const l3Overhead = l3.header + ipOptions;
    const l4Overhead = l4.header + (l4Protocol === 'tcp' ? tcpOptions : 0);
    const tunnelOverhead = tun.overhead;

    const totalOverhead = l2Overhead + l3Overhead + l4Overhead + tunnelOverhead;
    const totalPacketSize = totalOverhead + payloadSize;
    const efficiency = ((payloadSize / totalPacketSize) * 100).toFixed(2);

    // Calculate bandwidth usage for different packet rates
    const pps1000 = (totalPacketSize * 8 * 1000) / 1000000; // Mbps
    const pps10000 = (totalPacketSize * 8 * 10000) / 1000000;
    const pps100000 = (totalPacketSize * 8 * 100000) / 1000000;

    setResult({
      l2Overhead,
      l3Overhead,
      l4Overhead,
      tunnelOverhead,
      totalOverhead,
      payloadSize,
      totalPacketSize,
      efficiency,
      bandwidth: {
        pps1000: pps1000.toFixed(2),
        pps10000: pps10000.toFixed(2),
        pps100000: pps100000.toFixed(2)
      }
    });
  };

  return (
    <ToolPageWrapper
      title="Packet Overhead Analyzer"
      description="Calculate protocol overhead and bandwidth usage for different encapsulations"
      icon={Package}
      tips={[
        'Select your protocol stack to see total overhead',
        'Useful for bandwidth planning and MTU optimization'
      ]}
    >
      <div className="space-y-6">
        {/* Protocol Selection */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Layer 2 (Data Link)</Label>
            <Select value={l2Protocol} onValueChange={setL2Protocol}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {protocols.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Layer 3 (Network)</Label>
            <Select value={l3Protocol} onValueChange={setL3Protocol}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {l3Protocols.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Layer 4 (Transport)</Label>
            <Select value={l4Protocol} onValueChange={setL4Protocol}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {l4Protocols.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tunnel/VPN</Label>
            <Select value={tunnel} onValueChange={setTunnel}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tunnelProtocols.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-4 md:grid-cols-3">
          {l3Protocol === 'ipv4' && (
            <div>
              <Label>IP Options: {ipOptions} bytes</Label>
              <Slider
                value={[ipOptions]}
                onValueChange={(v) => setIpOptions(v[0])}
                min={0}
                max={40}
                step={4}
                className="mt-2"
              />
            </div>
          )}

          {l4Protocol === 'tcp' && (
            <div>
              <Label>TCP Options: {tcpOptions} bytes</Label>
              <Slider
                value={[tcpOptions]}
                onValueChange={(v) => setTcpOptions(v[0])}
                min={0}
                max={40}
                step={4}
                className="mt-2"
              />
            </div>
          )}

          <div>
            <Label>Payload Size: {payloadSize} bytes</Label>
            <Slider
              value={[payloadSize]}
              onValueChange={(v) => setPayloadSize(v[0])}
              min={1}
              max={9000}
              step={100}
              className="mt-2"
            />
          </div>
        </div>

        <Button onClick={analyze} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          Analyze Packet
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <ResultCard label="Total Packet Size" value={`${result.totalPacketSize} bytes`} copyable={false} />
              <ResultCard label="Total Overhead" value={`${result.totalOverhead} bytes`} copyable={false} />
              <ResultCard label="Payload" value={`${result.payloadSize} bytes`} copyable={false} />
              <ResultCard 
                label="Efficiency" 
                value={`${result.efficiency}%`} 
                copyable={false}
                className={
                  parseFloat(result.efficiency) > 90 
                    ? isDark ? 'bg-green-500/10' : 'bg-green-50'
                    : parseFloat(result.efficiency) > 75
                      ? isDark ? 'bg-yellow-500/10' : 'bg-yellow-50'
                      : isDark ? 'bg-red-500/10' : 'bg-red-50'
                }
              />
            </div>

            {/* Overhead Breakdown */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <h3 className="font-semibold mb-4">Overhead Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Layer 2 ({protocols.find(p => p.id === l2Protocol)?.name})</span>
                  <span className="font-mono">{result.l2Overhead} bytes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Layer 3 ({l3Protocols.find(p => p.id === l3Protocol)?.name})</span>
                  <span className="font-mono">{result.l3Overhead} bytes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Layer 4 ({l4Protocols.find(p => p.id === l4Protocol)?.name})</span>
                  <span className="font-mono">{result.l4Overhead} bytes</span>
                </div>
                {result.tunnelOverhead > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Tunnel ({tunnelProtocols.find(p => p.id === tunnel)?.name})</span>
                    <span className="font-mono">{result.tunnelOverhead} bytes</span>
                  </div>
                )}
                <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <span className="font-semibold">Total Overhead</span>
                  <span className="font-mono font-bold text-cyan-400">{result.totalOverhead} bytes</span>
                </div>
              </div>
            </div>

            {/* Bandwidth Usage */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <h3 className="font-semibold mb-4">Bandwidth Usage at Different Packet Rates</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>1,000 pps</p>
                  <p className="text-2xl font-bold text-cyan-400">{result.bandwidth.pps1000} Mbps</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>10,000 pps</p>
                  <p className="text-2xl font-bold text-cyan-400">{result.bandwidth.pps10000} Mbps</p>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>100,000 pps</p>
                  <p className="text-2xl font-bold text-cyan-400">{result.bandwidth.pps100000} Mbps</p>
                </div>
              </div>
              <p className={`text-sm mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Note: Actual throughput may be lower due to inter-frame gaps, preambles, and processing delays
              </p>
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}