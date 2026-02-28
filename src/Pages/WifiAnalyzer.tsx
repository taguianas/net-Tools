import React, { useState, useEffect } from 'react';
import { Wifi, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';

const channels24GHz = [
  { num: 1, freq: 2412, nonOverlap: true },
  { num: 2, freq: 2417, nonOverlap: false },
  { num: 3, freq: 2422, nonOverlap: false },
  { num: 4, freq: 2427, nonOverlap: false },
  { num: 5, freq: 2432, nonOverlap: false },
  { num: 6, freq: 2437, nonOverlap: true },
  { num: 7, freq: 2442, nonOverlap: false },
  { num: 8, freq: 2447, nonOverlap: false },
  { num: 9, freq: 2452, nonOverlap: false },
  { num: 10, freq: 2457, nonOverlap: false },
  { num: 11, freq: 2462, nonOverlap: true },
  { num: 12, freq: 2467, nonOverlap: false },
  { num: 13, freq: 2472, nonOverlap: false },
];

const channels5GHz = [
  { num: 36, freq: 5180, dfs: false, width: [20, 40, 80, 160] },
  { num: 40, freq: 5200, dfs: false, width: [20, 40, 80, 160] },
  { num: 44, freq: 5220, dfs: false, width: [20, 40, 80, 160] },
  { num: 48, freq: 5240, dfs: false, width: [20, 40, 80, 160] },
  { num: 52, freq: 5260, dfs: true, width: [20, 40, 80, 160] },
  { num: 56, freq: 5280, dfs: true, width: [20, 40, 80, 160] },
  { num: 60, freq: 5300, dfs: true, width: [20, 40, 80, 160] },
  { num: 64, freq: 5320, dfs: true, width: [20, 40, 80, 160] },
  { num: 100, freq: 5500, dfs: true, width: [20, 40, 80, 160] },
  { num: 104, freq: 5520, dfs: true, width: [20, 40, 80, 160] },
  { num: 108, freq: 5540, dfs: true, width: [20, 40, 80, 160] },
  { num: 112, freq: 5560, dfs: true, width: [20, 40, 80, 160] },
  { num: 116, freq: 5580, dfs: true, width: [20, 40, 80, 160] },
  { num: 120, freq: 5600, dfs: true, width: [20, 40, 80, 160] },
  { num: 124, freq: 5620, dfs: true, width: [20, 40, 80, 160] },
  { num: 128, freq: 5640, dfs: true, width: [20, 40, 80, 160] },
  { num: 132, freq: 5660, dfs: true, width: [20, 40, 80, 160] },
  { num: 136, freq: 5680, dfs: true, width: [20, 40, 80, 160] },
  { num: 140, freq: 5700, dfs: true, width: [20, 40, 80, 160] },
  { num: 144, freq: 5720, dfs: true, width: [20, 40, 80, 160] },
  { num: 149, freq: 5745, dfs: false, width: [20, 40, 80, 160] },
  { num: 153, freq: 5765, dfs: false, width: [20, 40, 80, 160] },
  { num: 157, freq: 5785, dfs: false, width: [20, 40, 80, 160] },
  { num: 161, freq: 5805, dfs: false, width: [20, 40, 80, 160] },
  { num: 165, freq: 5825, dfs: false, width: [20, 40, 80, 160] },
];

function checkOverlap(channel1, channel2) {
  return Math.abs(channel1 - channel2) < 5;
}

export default function WifiAnalyzer() {
  const [isDark, setIsDark] = useState(true);
  const [band, setBand] = useState('2.4GHz');
  const [selectedChannel, setSelectedChannel] = useState('6');
  const [channelWidth, setChannelWidth] = useState('20');
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const analyzeChannel = () => {
    if (band === '2.4GHz') {
      const channel = channels24GHz.find(c => c.num.toString() === selectedChannel);
      const overlapping = channels24GHz.filter(c => 
        c.num !== channel.num && checkOverlap(c.num, channel.num)
      );

      setRecommendation({
        channel: channel.num,
        frequency: `${channel.freq} MHz`,
        nonOverlapping: channel.nonOverlap,
        overlappingChannels: overlapping.map(c => c.num),
        recommendation: channel.nonOverlap 
          ? '✅ Recommended non-overlapping channel (1, 6, or 11)'
          : '⚠️ This channel overlaps with adjacent channels. Use 1, 6, or 11 for best performance.'
      });
    } else {
      const channel = channels5GHz.find(c => c.num.toString() === selectedChannel);
      if (channel) {
        setRecommendation({
          channel: channel.num,
          frequency: `${channel.freq} MHz`,
          dfs: channel.dfs,
          supportedWidths: channel.width,
          selectedWidth: channelWidth,
          recommendation: channel.dfs
            ? '⚠️ DFS channel - may experience interruptions due to radar detection'
            : '✅ Non-DFS channel - recommended for stable operation'
        });
      }
    }
  };

  return (
    <ToolPageWrapper
      title="WiFi Channel Analyzer"
      description="Optimize WiFi channel selection and avoid interference"
      icon={Wifi}
      tips={[
        'For 2.4 GHz, use channels 1, 6, or 11 to avoid overlap',
        'For 5 GHz, consider DFS restrictions in your region'
      ]}
    >
      <div className="space-y-6">
        {/* Band Selection */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>WiFi Band</Label>
            <Select value={band} onValueChange={setBand}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2.4GHz">2.4 GHz</SelectItem>
                <SelectItem value="5GHz">5 GHz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Channel</Label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(band === '2.4GHz' ? channels24GHz : channels5GHz).map(c => (
                  <SelectItem key={c.num} value={c.num.toString()}>
                    Channel {c.num} ({c.freq} MHz)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {band === '5GHz' && (
            <div>
              <Label>Channel Width</Label>
              <Select value={channelWidth} onValueChange={setChannelWidth}>
                <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20 MHz</SelectItem>
                  <SelectItem value="40">40 MHz</SelectItem>
                  <SelectItem value="80">80 MHz</SelectItem>
                  <SelectItem value="160">160 MHz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button onClick={analyzeChannel} className="bg-gradient-to-r from-cyan-500 to-blue-600">
          <Radio className="h-4 w-4 mr-2" />
          Analyze Channel
        </Button>

        {/* Results */}
        {recommendation && (
          <div className="space-y-6">
            <div className={`p-6 rounded-xl ${
              recommendation.nonOverlapping || (!recommendation.dfs && band === '5GHz')
                ? isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'
                : isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
            }`}>
              <p className="font-semibold mb-2 text-lg">
                {recommendation.recommendation}
              </p>
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Channel</p>
                  <p className="text-2xl font-bold text-cyan-400">{recommendation.channel}</p>
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Frequency</p>
                  <p className="text-xl font-mono">{recommendation.frequency}</p>
                </div>
                {band === '5GHz' && (
                  <div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>DFS Required</p>
                    <p className="text-xl">
                      {recommendation.dfs ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Yes</Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">No</Badge>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {band === '2.4GHz' && recommendation.overlappingChannels.length > 0 && (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <h4 className="font-semibold mb-2">Overlapping Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {recommendation.overlappingChannels.map(ch => (
                    <Badge key={ch} variant="outline" className="font-mono">
                      Channel {ch}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Channel Map */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-4">
            {band === '2.4GHz' ? '2.4 GHz Channel Map' : '5 GHz Channel Map'}
          </h3>
          
          {band === '2.4GHz' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-13 gap-1">
                {channels24GHz.map((ch) => (
                  <div
                    key={ch.num}
                    className={`p-2 rounded text-center text-xs font-mono ${
                      ch.nonOverlap
                        ? isDark 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-green-100 text-green-600 border border-green-300'
                        : isDark
                          ? 'bg-slate-700 text-slate-400'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {ch.num}
                  </div>
                ))}
              </div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ✅ Green = Non-overlapping channels (recommended: 1, 6, 11)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-2 md:grid-cols-5 lg:grid-cols-8">
                {channels5GHz.map((ch) => (
                  <div
                    key={ch.num}
                    className={`p-3 rounded-lg text-center ${
                      ch.dfs
                        ? isDark 
                          ? 'bg-amber-500/10 border border-amber-500/20'
                          : 'bg-amber-50 border border-amber-200'
                        : isDark
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-green-50 border border-green-200'
                    }`}
                  >
                    <p className="font-mono font-bold text-cyan-400">{ch.num}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {ch.freq} MHz
                    </p>
                    {ch.dfs && (
                      <Badge variant="outline" className="mt-1 text-xs">DFS</Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                  <p className="text-sm text-green-400">✅ Non-DFS Channels</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    36-48, 149-165 (US) - No radar detection required
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                  <p className="text-sm text-amber-400">⚠️ DFS Channels</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    52-144 - May switch channels if radar detected
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Best Practices */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-4">WiFi Best Practices</h3>
          <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <li>• <strong className="text-cyan-400">2.4 GHz:</strong> Better range, more interference. Use 20 MHz width. Stick to channels 1, 6, 11.</li>
            <li>• <strong className="text-cyan-400">5 GHz:</strong> Less interference, shorter range. Can use 40/80/160 MHz for higher speeds.</li>
            <li>• <strong className="text-cyan-400">DFS Channels:</strong> More spectrum available but may experience interruptions.</li>
            <li>• <strong className="text-cyan-400">Channel Width:</strong> Wider = faster speeds but more interference. Use 20 MHz in dense areas.</li>
            <li>• <strong className="text-cyan-400">Site Survey:</strong> Use WiFi analyzer apps to see actual channel usage in your environment.</li>
          </ul>
        </div>
      </div>
    </ToolPageWrapper>
  );
}