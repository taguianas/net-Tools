import React, { useState, useEffect } from 'react';
import { Gauge, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

const bandwidthUnits = [
  { value: 'Kbps', label: 'Kbps', multiplier: 1000 },
  { value: 'Mbps', label: 'Mbps', multiplier: 1000000 },
  { value: 'Gbps', label: 'Gbps', multiplier: 1000000000 },
];

const queueTypes = [
  { value: 'priority', label: 'Priority Queue (PQ)' },
  { value: 'cbwfq', label: 'Class-Based WFQ' },
  { value: 'wfq', label: 'Weighted Fair Queue' },
  { value: 'fifo', label: 'FIFO' },
];

function formatBandwidth(bps) {
  if (bps < 1000000) return `${(bps / 1000).toFixed(2)} Kbps`;
  if (bps < 1000000000) return `${(bps / 1000000).toFixed(2)} Mbps`;
  return `${(bps / 1000000000).toFixed(2)} Gbps`;
}

export default function QoSCalculator() {
  const [isDark, setIsDark] = useState(true);
  const [linkSpeed, setLinkSpeed] = useState('100');
  const [linkUnit, setLinkUnit] = useState('Mbps');
  const [classes, setClasses] = useState([
    { id: 1, name: 'Voice', priority: 1, bandwidth: 20, minLatency: '10ms', jitter: '5ms' },
    { id: 2, name: 'Video', priority: 2, bandwidth: 30, minLatency: '20ms', jitter: '10ms' },
    { id: 3, name: 'Critical Data', priority: 3, bandwidth: 25, minLatency: '50ms', jitter: 'N/A' },
    { id: 4, name: 'Best Effort', priority: 4, bandwidth: 25, minLatency: 'N/A', jitter: 'N/A' },
  ]);
  const [results, setResults] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const addTrafficClass = () => {
    const maxId = classes.reduce((max, c) => Math.max(max, c.id), 0);
    setClasses([...classes, {
      id: maxId + 1,
      name: `Class ${maxId + 1}`,
      priority: maxId + 1,
      bandwidth: 10,
      minLatency: 'N/A',
      jitter: 'N/A'
    }]);
  };

  const removeTrafficClass = (id) => {
    if (classes.length > 1) {
      setClasses(classes.filter(c => c.id !== id));
    }
  };

  const updateClass = (id, field, value) => {
    setClasses(classes.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calculateQoS = () => {
    const unit = bandwidthUnits.find(u => u.value === linkUnit);
    const totalBps = parseFloat(linkSpeed) * unit.multiplier;
    
    const totalAllocated = classes.reduce((sum, c) => sum + parseFloat(String(c.bandwidth)), 0);
    
    if (totalAllocated > 100) {
      alert('Total bandwidth allocation exceeds 100%');
      return;
    }

    const calculated = classes.map(cls => {
      const bps = (parseFloat(String(cls.bandwidth)) / 100) * totalBps;
      return {
        ...cls,
        allocatedBps: bps,
        allocatedFormatted: formatBandwidth(bps),
        percentage: cls.bandwidth
      };
    });

    const unallocated = 100 - totalAllocated;
    const unallocatedBps = (unallocated / 100) * totalBps;

    setResults({
      classes: calculated,
      totalAllocated,
      unallocated,
      unallocatedBps,
      unallocatedFormatted: formatBandwidth(unallocatedBps),
      linkCapacity: formatBandwidth(totalBps)
    });
  };

  return (
    <ToolPageWrapper
      title="QoS Calculator"
      description="Plan Quality of Service bandwidth allocation and queue management"
      icon={Gauge}
      tips={[
        'Define traffic classes and allocate bandwidth percentage for each',
        'Ensure total allocation does not exceed 100%'
      ]}
    >
      <div className="space-y-6">
        {/* Link Speed */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Link Speed</Label>
            <div className="flex gap-2 mt-1">
              <Input
                type="number"
                value={linkSpeed}
                onChange={(e) => setLinkSpeed(e.target.value)}
                className={`flex-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
              <Select value={linkUnit} onValueChange={setLinkUnit}>
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

        {/* Traffic Classes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg">Traffic Classes</Label>
            <Button variant="outline" size="sm" onClick={addTrafficClass}>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>

          <div className="space-y-3">
            {classes.map((cls) => (
              <div key={cls.id} className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="grid gap-4 md:grid-cols-6">
                  <div className="md:col-span-2">
                    <Label className="text-xs">Class Name</Label>
                    <Input
                      value={cls.name}
                      onChange={(e) => updateClass(cls.id, 'name', e.target.value)}
                      className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Priority</Label>
                    <Input
                      type="number"
                      min="1"
                      value={cls.priority}
                      onChange={(e) => updateClass(cls.id, 'priority', parseInt(e.target.value))}
                      className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs">Bandwidth: {cls.bandwidth}%</Label>
                    <Slider
                      value={[cls.bandwidth]}
                      onValueChange={(v) => updateClass(cls.id, 'bandwidth', v[0])}
                      min={1}
                      max={100}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTrafficClass(cls.id)}
                      disabled={classes.length === 1}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={calculateQoS} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          Calculate QoS Policy
        </Button>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-4">
              <ResultCard label="Link Capacity" value={results.linkCapacity} copyable={false} />
              <ResultCard label="Allocated" value={`${results.totalAllocated}%`} copyable={false} />
              <ResultCard label="Unallocated" value={`${results.unallocated}%`} copyable={false} />
              <ResultCard label="Available BW" value={results.unallocatedFormatted} copyable={false} />
            </div>

            {/* Class Breakdown */}
            <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white border'}`}>
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-semibold">Bandwidth Allocation by Class</h3>
              </div>
              <div className="p-4 space-y-3">
                {results.classes.map((cls) => (
                  <div key={cls.id} className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          cls.priority === 1 ? 'bg-red-500/20 text-red-400' :
                          cls.priority === 2 ? 'bg-orange-500/20 text-orange-400' :
                          cls.priority === 3 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          P{cls.priority}
                        </div>
                        <span className="font-medium">{cls.name}</span>
                      </div>
                      <span className="text-cyan-400 font-mono font-bold">
                        {cls.allocatedFormatted}
                      </span>
                    </div>
                    <div className={`h-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        style={{ width: `${cls.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                        {cls.percentage}% of link
                      </span>
                      {cls.minLatency !== 'N/A' && (
                        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                          Max latency: {cls.minLatency}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <h3 className="font-semibold mb-4">QoS Best Practices</h3>
              <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <li>• <strong className="text-cyan-400">Voice:</strong> Allocate 15-20%, priority queue, max latency 150ms, max jitter 30ms</li>
                <li>• <strong className="text-cyan-400">Video:</strong> Allocate 25-40%, low latency queue, max latency 200ms</li>
                <li>• <strong className="text-cyan-400">Critical Data:</strong> Allocate based on business needs, guaranteed bandwidth</li>
                <li>• <strong className="text-cyan-400">Best Effort:</strong> Use remaining bandwidth, no guarantees</li>
                <li>• Always leave 10-20% unallocated for burst traffic and overhead</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}