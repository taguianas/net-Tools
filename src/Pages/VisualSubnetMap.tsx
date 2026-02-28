import React, { useState, useEffect } from 'react';
import { Network, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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

function calculateSubnets(baseNetwork, baseCidr, targetCidr) {
  const baseNetworkLong = ipToLong(baseNetwork);
  const baseMask = (~0 << (32 - baseCidr)) >>> 0;
  const network = (baseNetworkLong & baseMask) >>> 0;
  
  const baseSize = Math.pow(2, 32 - baseCidr);
  const targetSize = Math.pow(2, 32 - targetCidr);
  
  if (targetCidr <= baseCidr) return [];
  
  const numSubnets = baseSize / targetSize;
  const subnets = [];
  
  for (let i = 0; i < numSubnets && i < 256; i++) {
    const subnetNetwork = network + (i * targetSize);
    subnets.push({
      network: longToIp(subnetNetwork),
      cidr: targetCidr,
      index: i,
      firstHost: longToIp(subnetNetwork + 1),
      lastHost: longToIp(subnetNetwork + targetSize - 2),
      broadcast: longToIp(subnetNetwork + targetSize - 1),
      size: targetSize
    });
  }
  
  return subnets;
}

export default function VisualSubnetMap() {
  const [isDark, setIsDark] = useState(true);
  const [baseNetwork, setBaseNetwork] = useState('192.168.0.0');
  const [baseCidr, setBaseCidr] = useState('16');
  const [targetCidr, setTargetCidr] = useState('24');
  const [subnets, setSubnets] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [highlightedSubnet, setHighlightedSubnet] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const visualize = () => {
    const calculated = calculateSubnets(baseNetwork, parseInt(baseCidr), parseInt(targetCidr));
    setSubnets(calculated);
  };

  const getGridSize = () => {
    const count = subnets.length;
    if (count <= 16) return 4;
    if (count <= 64) return 8;
    if (count <= 256) return 16;
    return 16;
  };

  const gridSize = getGridSize();

  return (
    <ToolPageWrapper
      title="Visual Subnet Map"
      description="Visualize subnet allocation with an interactive map"
      icon={Network}
      tips={[
        'See how your base network is divided into smaller subnets',
        'Hover over subnets to see details'
      ]}
    >
      <div className="space-y-6">
        {/* Inputs */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>Base Network</Label>
            <Input
              value={baseNetwork}
              onChange={(e) => setBaseNetwork(e.target.value)}
              placeholder="192.168.0.0"
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <div>
            <Label>Base CIDR</Label>
            <Input
              type="number"
              min="8"
              max="30"
              value={baseCidr}
              onChange={(e) => setBaseCidr(e.target.value)}
              className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
          <div>
            <Label>Target CIDR (Subnets)</Label>
            <Input
              type="number"
              min={parseInt(baseCidr) + 1}
              max="32"
              value={targetCidr}
              onChange={(e) => setTargetCidr(e.target.value)}
              className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={visualize} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            Generate Map
          </Button>
          {subnets.length > 0 && (
            <>
              <Button variant="outline" onClick={() => setZoom(Math.min(zoom + 0.2, 2))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        {subnets.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Subnets</p>
              <p className="text-2xl font-bold text-cyan-400">{subnets.length}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hosts per Subnet</p>
              <p className="text-2xl font-bold">{subnets[0]?.size - 2}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Base Network</p>
              <p className="text-lg font-mono">{baseNetwork}/{baseCidr}</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subnet Size</p>
              <p className="text-lg font-mono">/{targetCidr}</p>
            </div>
          </div>
        )}

        {/* Visual Map */}
        {subnets.length > 0 && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div 
              className="grid gap-2"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                transition: 'transform 0.3s ease'
              }}
            >
              {subnets.map((subnet, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHighlightedSubnet(subnet)}
                  onMouseLeave={() => setHighlightedSubnet(null)}
                  className={`
                    aspect-square rounded-lg p-2 cursor-pointer transition-all
                    flex flex-col items-center justify-center text-center
                    ${highlightedSubnet === subnet 
                      ? 'ring-2 ring-cyan-500 scale-105' 
                      : ''
                    }
                    ${isDark 
                      ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30' 
                      : 'bg-cyan-100 hover:bg-cyan-200 border border-cyan-300'
                    }
                  `}
                >
                  <p className={`text-xs font-mono ${isDark ? 'text-cyan-300' : 'text-cyan-700'}`}>
                    #{i}
                  </p>
                  <p className={`text-xs font-mono font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'} mt-1`}>
                    {subnet.network.split('.').slice(-2).join('.')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subnet Details */}
        {highlightedSubnet && (
          <div className={`p-6 rounded-xl ${isDark ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-200'}`}>
            <h3 className="font-semibold mb-4 text-cyan-400">
              Subnet #{highlightedSubnet.index}
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Network</p>
                <p className="font-mono text-cyan-400">{highlightedSubnet.network}/{highlightedSubnet.cidr}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>First Host</p>
                <p className="font-mono">{highlightedSubnet.firstHost}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Host</p>
                <p className="font-mono">{highlightedSubnet.lastHost}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Broadcast</p>
                <p className="font-mono">{highlightedSubnet.broadcast}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Usable Hosts</p>
                <p className="font-mono">{highlightedSubnet.size - 2}</p>
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Addresses</p>
                <p className="font-mono">{highlightedSubnet.size}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageWrapper>
  );
}