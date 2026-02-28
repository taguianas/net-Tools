import React, { useState, useEffect } from 'react';
import { Network, Plus, Trash2, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

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

function parseSubnet(cidr) {
  const [ip, prefix] = cidr.trim().split('/');
  if (!ip || !prefix) return null;
  const prefixNum = parseInt(prefix);
  if (prefixNum < 0 || prefixNum > 32) return null;
  
  const mask = (~0 << (32 - prefixNum)) >>> 0;
  const network = (ipToLong(ip) & mask) >>> 0;
  const size = Math.pow(2, 32 - prefixNum);
  
  return {
    network,
    prefix: prefixNum,
    size,
    end: network + size - 1,
    cidr: `${longToIp(network)}/${prefixNum}`
  };
}

function canAggregate(subnet1, subnet2) {
  // Subnets can be aggregated if they're adjacent and same size
  if (subnet1.prefix !== subnet2.prefix) return false;
  
  const smaller = subnet1.network < subnet2.network ? subnet1 : subnet2;
  const larger = subnet1.network < subnet2.network ? subnet2 : subnet1;
  
  // Check if adjacent
  if (smaller.end + 1 !== larger.network) return false;
  
  // Check if they align on the boundary of the parent subnet
  const parentPrefix = subnet1.prefix - 1;
  const parentMask = (~0 << (32 - parentPrefix)) >>> 0;
  
  return (smaller.network & parentMask) === (larger.network & parentMask);
}

function aggregateSubnets(subnets) {
  if (subnets.length === 0) return [];
  
  // Sort by network address
  let sorted = [...subnets].sort((a, b) => a.network - b.network);
  
  let changed = true;
  while (changed) {
    changed = false;
    const newList = [];
    let i = 0;
    
    while (i < sorted.length) {
      if (i + 1 < sorted.length && canAggregate(sorted[i], sorted[i + 1])) {
        // Aggregate these two
        const newPrefix = sorted[i].prefix - 1;
        const newMask = (~0 << (32 - newPrefix)) >>> 0;
        const newNetwork = (sorted[i].network & newMask) >>> 0;
        const newSize = Math.pow(2, 32 - newPrefix);
        
        newList.push({
          network: newNetwork,
          prefix: newPrefix,
          size: newSize,
          end: newNetwork + newSize - 1,
          cidr: `${longToIp(newNetwork)}/${newPrefix}`
        });
        
        i += 2;
        changed = true;
      } else {
        newList.push(sorted[i]);
        i++;
      }
    }
    
    sorted = newList;
  }
  
  return sorted;
}

function findSupernet(subnets) {
  if (subnets.length === 0) return null;
  
  const minNetwork = Math.min(...subnets.map(s => s.network));
  const maxEnd = Math.max(...subnets.map(s => s.end));
  
  // Find the smallest prefix that contains all networks
  for (let prefix = 0; prefix <= 32; prefix++) {
    const mask = (~0 << (32 - prefix)) >>> 0;
    const network = (minNetwork & mask) >>> 0;
    const size = Math.pow(2, 32 - prefix);
    const end = network + size - 1;
    
    if (end >= maxEnd) {
      return {
        network,
        prefix,
        size,
        cidr: `${longToIp(network)}/${prefix}`,
        utilization: ((subnets.reduce((sum, s) => sum + s.size, 0) / size) * 100).toFixed(2)
      };
    }
  }
  
  return null;
}

export default function CIDRAggregator() {
  const [isDark, setIsDark] = useState(true);
  const [inputText, setInputText] = useState('192.168.1.0/24\n192.168.2.0/24\n192.168.3.0/24\n192.168.4.0/24');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const aggregate = () => {
    setError('');
    setResult(null);
    
    const lines = inputText.split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      setError('Please enter at least one subnet');
      return;
    }
    
    const subnets = [];
    for (const line of lines) {
      const subnet = parseSubnet(line);
      if (!subnet) {
        setError(`Invalid subnet format: ${line}`);
        return;
      }
      subnets.push(subnet);
    }
    
    // Check for overlaps
    for (let i = 0; i < subnets.length; i++) {
      for (let j = i + 1; j < subnets.length; j++) {
        const a = subnets[i];
        const b = subnets[j];
        
        if ((a.network <= b.network && a.end >= b.network) ||
            (b.network <= a.network && b.end >= a.network)) {
          setError(`Overlapping subnets detected: ${a.cidr} and ${b.cidr}`);
          return;
        }
      }
    }
    
    const aggregated = aggregateSubnets(subnets);
    const supernet = findSupernet(subnets);
    
    const reduction = ((1 - aggregated.length / subnets.length) * 100).toFixed(1);
    
    setResult({
      original: subnets,
      aggregated,
      supernet,
      reduction,
      routesSaved: subnets.length - aggregated.length
    });
  };

  return (
    <ToolPageWrapper
      title="CIDR Aggregator"
      description="Optimize routing tables by aggregating multiple subnets into supernets"
      icon={Network}
      tips={[
        'Enter one subnet per line in CIDR notation (e.g., 192.168.1.0/24)',
        'Tool will automatically find optimal aggregation and calculate supernet'
      ]}
    >
      <div className="space-y-6">
        <div>
          <Label>Input Subnets (one per line)</Label>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="192.168.1.0/24&#10;192.168.2.0/24&#10;192.168.3.0/24"
            className={`mt-1 font-mono min-h-[200px] ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <Button onClick={aggregate} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          <Zap className="h-4 w-4 mr-2" />
          Aggregate Subnets
        </Button>

        {result && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <ResultCard label="Original Routes" value={result.original.length.toString()} copyable={false} />
              <ResultCard label="Aggregated Routes" value={result.aggregated.length.toString()} copyable={false} />
              <ResultCard label="Routes Saved" value={result.routesSaved.toString()} copyable={false} />
              <ResultCard label="Reduction" value={`${result.reduction}%`} copyable={false} />
            </div>

            {/* Supernet */}
            {result.supernet && (
              <div className={`p-6 rounded-xl ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-100'}`}>
                <h3 className="font-semibold mb-4 text-green-400">Recommended Supernet</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <ResultCard 
                    label="Supernet" 
                    value={result.supernet.cidr} 
                    className={isDark ? 'bg-slate-900/50' : 'bg-white'}
                  />
                  <ResultCard 
                    label="Total Addresses" 
                    value={result.supernet.size.toLocaleString()} 
                    copyable={false}
                    className={isDark ? 'bg-slate-900/50' : 'bg-white'}
                  />
                  <ResultCard 
                    label="Utilization" 
                    value={`${result.supernet.utilization}%`} 
                    copyable={false}
                    className={isDark ? 'bg-slate-900/50' : 'bg-white'}
                  />
                </div>
              </div>
            )}

            {/* Aggregated Results */}
            <div>
              <h3 className="font-semibold mb-4">Aggregated Subnets</h3>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="space-y-2">
                  {result.aggregated.map((subnet, i) => (
                    <div 
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}
                    >
                      <span className="font-mono text-cyan-400">{subnet.cidr}</span>
                      <Badge variant="outline" className={isDark ? 'border-slate-600' : ''}>
                        {subnet.size.toLocaleString()} addresses
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Original Subnets */}
            <details className="group">
              <summary className="cursor-pointer font-semibold mb-4 list-none">
                <span className="inline-flex items-center gap-2">
                  Original Subnets
                  <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {result.original.map((subnet, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg font-mono text-sm ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}
                    >
                      {subnet.cidr}
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}