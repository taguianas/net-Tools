import React, { useState, useEffect } from 'react';
import { Gauge, Clock, HardDrive } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

const bandwidthUnits = [
  { value: 'bps', label: 'bps', multiplier: 1 },
  { value: 'Kbps', label: 'Kbps', multiplier: 1000 },
  { value: 'Mbps', label: 'Mbps', multiplier: 1000000 },
  { value: 'Gbps', label: 'Gbps', multiplier: 1000000000 },
  { value: 'Tbps', label: 'Tbps', multiplier: 1000000000000 },
];

const sizeUnits = [
  { value: 'B', label: 'Bytes', multiplier: 1 },
  { value: 'KB', label: 'KB', multiplier: 1024 },
  { value: 'MB', label: 'MB', multiplier: 1024 * 1024 },
  { value: 'GB', label: 'GB', multiplier: 1024 * 1024 * 1024 },
  { value: 'TB', label: 'TB', multiplier: 1024 * 1024 * 1024 * 1024 },
];

function formatTime(seconds) {
  if (seconds < 1) return `${(seconds * 1000).toFixed(2)} ms`;
  if (seconds < 60) return `${seconds.toFixed(2)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(2)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} hours`;
  return `${(seconds / 86400).toFixed(2)} days`;
}

function formatBandwidth(bps) {
  if (bps < 1000) return `${bps.toFixed(2)} bps`;
  if (bps < 1000000) return `${(bps / 1000).toFixed(2)} Kbps`;
  if (bps < 1000000000) return `${(bps / 1000000).toFixed(2)} Mbps`;
  if (bps < 1000000000000) return `${(bps / 1000000000).toFixed(2)} Gbps`;
  return `${(bps / 1000000000000).toFixed(2)} Tbps`;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes.toFixed(2)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
}

export default function BandwidthCalculator() {
  const [isDark, setIsDark] = useState(true);
  
  // Transfer Time Calculator
  const [fileSize, setFileSize] = useState('100');
  const [fileSizeUnit, setFileSizeUnit] = useState('MB');
  const [bandwidth, setBandwidth] = useState('100');
  const [bandwidthUnit, setBandwidthUnit] = useState('Mbps');
  const [overhead, setOverhead] = useState(10);
  const [transferResult, setTransferResult] = useState(null);
  
  // Link Utilization Calculator
  const [linkSpeed, setLinkSpeed] = useState('1000');
  const [linkSpeedUnit, setLinkSpeedUnit] = useState('Mbps');
  const [actualThroughput, setActualThroughput] = useState('750');
  const [throughputUnit, setThroughputUnit] = useState('Mbps');
  const [utilizationResult, setUtilizationResult] = useState(null);
  
  // Required Bandwidth Calculator
  const [users, setUsers] = useState('50');
  const [bandwidthPerUser, setBandwidthPerUser] = useState('5');
  const [perUserUnit, setPerUserUnit] = useState('Mbps');
  const [concurrency, setConcurrency] = useState(70);
  const [requiredResult, setRequiredResult] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const calculateTransferTime = () => {
    const sizeUnit = sizeUnits.find(u => u.value === fileSizeUnit);
    const bwUnit = bandwidthUnits.find(u => u.value === bandwidthUnit);
    
    const bytes = parseFloat(fileSize) * sizeUnit.multiplier;
    const bps = parseFloat(bandwidth) * bwUnit.multiplier;
    
    // Convert bytes to bits
    const bits = bytes * 8;
    
    // Apply overhead
    const effectiveBps = bps * (1 - overhead / 100);
    
    // Calculate time
    const seconds = bits / effectiveBps;
    
    setTransferResult({
      time: formatTime(seconds),
      seconds: seconds,
      effectiveBandwidth: formatBandwidth(effectiveBps),
      actualSize: formatSize(bytes),
      throughput: formatSize(bytes / seconds) + '/s'
    });
  };

  const calculateUtilization = () => {
    const linkUnit = bandwidthUnits.find(u => u.value === linkSpeedUnit);
    const throughUnit = bandwidthUnits.find(u => u.value === throughputUnit);
    
    const linkBps = parseFloat(linkSpeed) * linkUnit.multiplier;
    const throughBps = parseFloat(actualThroughput) * throughUnit.multiplier;
    
    const utilization = (throughBps / linkBps) * 100;
    const available = linkBps - throughBps;
    
    let status = 'healthy';
    if (utilization > 90) status = 'critical';
    else if (utilization > 70) status = 'warning';
    
    setUtilizationResult({
      utilization: utilization.toFixed(2),
      available: formatBandwidth(available),
      status,
      linkCapacity: formatBandwidth(linkBps),
      currentThroughput: formatBandwidth(throughBps)
    });
  };

  const calculateRequiredBandwidth = () => {
    const perUnit = bandwidthUnits.find(u => u.value === perUserUnit);
    const perUserBps = parseFloat(bandwidthPerUser) * perUnit.multiplier;
    
    const numUsers = parseFloat(users);
    const concurrentUsers = numUsers * (concurrency / 100);
    
    const requiredBps = concurrentUsers * perUserBps;
    
    // Add 20% headroom for peaks
    const withHeadroom = requiredBps * 1.2;
    
    setRequiredResult({
      required: formatBandwidth(requiredBps),
      recommended: formatBandwidth(withHeadroom),
      concurrentUsers: Math.ceil(concurrentUsers),
      perUser: formatBandwidth(perUserBps)
    });
  };

  return (
    <ToolPageWrapper
      title="Bandwidth Calculator"
      description="Calculate transfer times, link utilization, and bandwidth requirements"
      icon={Gauge}
      tips={[
        'Account for protocol overhead (typically 10-20%) for accurate calculations',
        'Consider peak usage times when planning capacity'
      ]}
    >
      <Tabs defaultValue="transfer" className="space-y-6">
        <TabsList className={isDark ? 'bg-slate-800' : ''}>
          <TabsTrigger value="transfer">Transfer Time</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="required">Required BW</TabsTrigger>
        </TabsList>

        {/* Transfer Time */}
        <TabsContent value="transfer" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>File Size</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                />
                <Select value={fileSizeUnit} onValueChange={setFileSizeUnit}>
                  <SelectTrigger className={`w-24 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeUnits.map(u => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Bandwidth</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  value={bandwidth}
                  onChange={(e) => setBandwidth(e.target.value)}
                  className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                />
                <Select value={bandwidthUnit} onValueChange={setBandwidthUnit}>
                  <SelectTrigger className={`w-24 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bandwidthUnits.map(u => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <Label className="mb-4 block">Protocol Overhead: {overhead}%</Label>
            <Slider
              value={[overhead]}
              onValueChange={(v) => setOverhead(v[0])}
              min={0}
              max={30}
              step={1}
              className="mb-2"
            />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Typical values: TCP 10-15%, UDP 5-10%, VPN 15-25%
            </p>
          </div>

          <Button onClick={calculateTransferTime} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <Clock className="h-4 w-4 mr-2" />
            Calculate Time
          </Button>

          {transferResult && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ResultCard 
                label="Transfer Time" 
                value={transferResult.time}
                copyable={false}
                className={`${isDark ? 'bg-green-500/10 border-2 border-green-500/30' : 'bg-green-50 border-2 border-green-200'}`}
              />
              <ResultCard label="Effective Bandwidth" value={transferResult.effectiveBandwidth} />
              <ResultCard label="Average Throughput" value={transferResult.throughput} />
            </div>
          )}
        </TabsContent>

        {/* Utilization */}
        <TabsContent value="utilization" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Link Speed (Capacity)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  value={linkSpeed}
                  onChange={(e) => setLinkSpeed(e.target.value)}
                  className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                />
                <Select value={linkSpeedUnit} onValueChange={setLinkSpeedUnit}>
                  <SelectTrigger className={`w-24 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bandwidthUnits.map(u => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Current Throughput</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  value={actualThroughput}
                  onChange={(e) => setActualThroughput(e.target.value)}
                  className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                />
                <Select value={throughputUnit} onValueChange={setThroughputUnit}>
                  <SelectTrigger className={`w-24 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bandwidthUnits.map(u => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button onClick={calculateUtilization} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <Gauge className="h-4 w-4 mr-2" />
            Calculate Utilization
          </Button>

          {utilizationResult && (
            <div>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <ResultCard 
                  label="Utilization" 
                  value={`${utilizationResult.utilization}%`}
                  copyable={false}
                  className={
                    utilizationResult.status === 'critical' ? 
                      (isDark ? 'bg-red-500/10 border-2 border-red-500/30' : 'bg-red-50 border-2 border-red-200') :
                    utilizationResult.status === 'warning' ?
                      (isDark ? 'bg-yellow-500/10 border-2 border-yellow-500/30' : 'bg-yellow-50 border-2 border-yellow-200') :
                      (isDark ? 'bg-green-500/10 border-2 border-green-500/30' : 'bg-green-50 border-2 border-green-200')
                  }
                />
                <ResultCard label="Available Bandwidth" value={utilizationResult.available} />
                <ResultCard label="Link Capacity" value={utilizationResult.linkCapacity} />
              </div>

              <div className={`p-4 rounded-xl ${
                utilizationResult.status === 'critical' ? 
                  (isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200') :
                utilizationResult.status === 'warning' ?
                  (isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200') :
                  (isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200')
              }`}>
                <p className="font-semibold mb-2">
                  {utilizationResult.status === 'critical' && '⚠️ Critical - Link near capacity'}
                  {utilizationResult.status === 'warning' && '⚡ Warning - High utilization'}
                  {utilizationResult.status === 'healthy' && '✅ Healthy - Normal utilization'}
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {utilizationResult.status === 'critical' && 'Consider upgrading link or optimizing traffic'}
                  {utilizationResult.status === 'warning' && 'Monitor closely and plan for capacity increase'}
                  {utilizationResult.status === 'healthy' && 'Link has sufficient capacity'}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Required Bandwidth */}
        <TabsContent value="required" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Number of Users</Label>
              <Input
                type="number"
                value={users}
                onChange={(e) => setUsers(e.target.value)}
                className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>

            <div>
              <Label>Bandwidth per User</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  value={bandwidthPerUser}
                  onChange={(e) => setBandwidthPerUser(e.target.value)}
                  className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                />
                <Select value={perUserUnit} onValueChange={setPerUserUnit}>
                  <SelectTrigger className={`w-24 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bandwidthUnits.slice(1, 4).map(u => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <Label className="mb-4 block">Peak Concurrency: {concurrency}%</Label>
            <Slider
              value={[concurrency]}
              onValueChange={(v) => setConcurrency(v[0])}
              min={10}
              max={100}
              step={5}
              className="mb-2"
            />
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Percentage of users active simultaneously during peak hours
            </p>
          </div>

          <Button onClick={calculateRequiredBandwidth} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <HardDrive className="h-4 w-4 mr-2" />
            Calculate Required Bandwidth
          </Button>

          {requiredResult && (
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard 
                label="Minimum Required" 
                value={requiredResult.required}
                className={isDark ? 'bg-slate-800/50' : 'bg-white'}
              />
              <ResultCard 
                label="Recommended (with 20% headroom)" 
                value={requiredResult.recommended}
                className={isDark ? 'bg-green-500/10 border-2 border-green-500/30' : 'bg-green-50 border-2 border-green-200'}
              />
              <ResultCard 
                label="Peak Concurrent Users" 
                value={requiredResult.concurrentUsers.toString()}
                copyable={false}
              />
              <ResultCard 
                label="Bandwidth per User" 
                value={requiredResult.perUser}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ToolPageWrapper>
  );
}