import React, { useState, useEffect } from 'react';
import { Globe, Search, Loader2, ExternalLink, Clock, Shield, Zap, TrendingUp, Copy, Check, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import { addToHistory, getHistory } from '@/components/utils/storage';

const recordTypes = [
  { value: 'A', label: 'A (IPv4 Address)' },
  { value: 'AAAA', label: 'AAAA (IPv6 Address)' },
  { value: 'CNAME', label: 'CNAME (Canonical Name)' },
  { value: 'MX', label: 'MX (Mail Exchange)' },
  { value: 'NS', label: 'NS (Name Server)' },
  { value: 'TXT', label: 'TXT (Text Record)' },
  { value: 'SOA', label: 'SOA (Start of Authority)' },
  { value: 'PTR', label: 'PTR (Pointer)' },
  { value: 'SRV', label: 'SRV (Service)' },
];

const dnsProviders = [
  { value: 'cloudflare', label: 'Cloudflare (1.1.1.1)', url: 'https://cloudflare-dns.com/dns-query', icon: Shield },
  { value: 'google', label: 'Google (8.8.8.8)', url: 'https://dns.google/resolve', icon: Search },
];

const commonDomains = [
  { name: 'google.com', category: 'Popular' },
  { name: 'cloudflare.com', category: 'CDN' },
  { name: 'github.com', category: 'Developer' },
  { name: 'wikipedia.org', category: 'Reference' },
];

export default function DNSLookup() {
  const [isDark, setIsDark] = useState(true);
  const [domain, setDomain] = useState('example.com');
  const [recordType, setRecordType] = useState('A');
  const [provider, setProvider] = useState('cloudflare');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [queryTime, setQueryTime] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setHistory(getHistory('DNSLookup'));
  }, []);

  const performLookup = async () => {
    setError('');
    setResults(null);
    setLoading(true);
    const startTime = performance.now();

    try {
      const providerConfig = dnsProviders.find(p => p.value === provider);
      let url;

      if (provider === 'cloudflare') {
        url = `${providerConfig.url}?name=${encodeURIComponent(domain)}&type=${recordType}`;
      } else {
        url = `${providerConfig.url}?name=${encodeURIComponent(domain)}&type=${recordType}`;
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/dns-json',
        }
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setQueryTime(duration);

      if (!response.ok) {
        throw new Error('DNS query failed');
      }

      const data = await response.json();
      
      if (data.Status !== 0) {
        const errorMessages = {
          1: 'Format error - The name server was unable to interpret the query',
          2: 'Server failure - The name server was unable to process this query',
          3: 'Name error - The domain name does not exist',
          4: 'Not implemented - The name server does not support the requested query',
          5: 'Refused - The name server refuses to perform the operation',
        };
        setError(errorMessages[data.Status] || `DNS query returned status code: ${data.Status}`);
        return;
      }

      const resultData = {
        question: data.Question || [],
        answer: data.Answer || [],
        authority: data.Authority || [],
        additional: data.Additional || []
      };
      
      setResults(resultData);

      // Save to history
      addToHistory('DNSLookup', {
        domain,
        recordType,
        provider,
        answerCount: resultData.answer.length,
        queryTime: duration
      });
      setHistory(getHistory('DNSLookup'));

    } catch (err) {
      setError('Failed to perform DNS lookup. Check the domain name and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (item) => {
    setDomain(item.domain);
    setRecordType(item.recordType);
    setProvider(item.provider);
  };

  const getRecordTypeBadge = (type) => {
    const colors = {
      A: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      AAAA: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      CNAME: 'bg-green-500/20 text-green-400 border-green-500/30',
      MX: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      NS: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      TXT: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      SOA: 'bg-red-500/20 text-red-400 border-red-500/30',
      PTR: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      SRV: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const formatTTL = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <ToolPageWrapper
      title="DNS Lookup"
      description="Query DNS records using DNS-over-HTTPS (DoH)"
      icon={Globe}
      tips={[
        'Uses secure DNS-over-HTTPS to query DNS records.',
        'All queries are made directly from your browser - no data passes through our servers.'
      ]}
    >
      <div className="space-y-6">
        <Tabs defaultValue="lookup" className="w-full">
          <TabsList className={`grid w-full md:w-auto grid-cols-2 ${isDark ? 'bg-slate-800' : ''}`}>
            <TabsTrigger value="lookup">
              <Search className="h-4 w-4 mr-2" />
              DNS Lookup
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lookup" className="space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {commonDomains.map((d) => (
                <Button
                  key={d.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setDomain(d.name)}
                  className={isDark ? 'border-slate-700' : ''}
                >
                  {d.name}
                  <Badge variant="outline" className="ml-2 text-xs">{d.category}</Badge>
                </Button>
              ))}
            </div>

            {/* Input Section */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label>Domain Name</Label>
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
                  onKeyDown={(e) => e.key === 'Enter' && performLookup()}
                />
              </div>
              <div>
                <Label>Record Type</Label>
                <Select value={recordType} onValueChange={setRecordType}>
                  <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recordTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>DNS Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dnsProviders.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={performLookup} 
                disabled={loading || !domain}
                className="bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Querying...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Lookup
                  </>
                )}
              </Button>

              {queryTime && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-mono">{queryTime}ms</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {history.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <History className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                <p className="text-lg font-medium">No query history</p>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  Your recent DNS lookups will appear here
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {history.slice(0, 10).map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                      isDark ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                    onClick={() => {
                      loadFromHistory(item);
                      (document.querySelector('[value="lookup"]') as HTMLElement)?.click();
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-mono font-semibold text-cyan-400">{item.domain}</p>
                          <Badge variant="outline">{item.recordType}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Provider: {item.provider}
                          </span>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            {item.answerCount} records
                          </span>
                          <span className={`font-mono ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            {item.queryTime}ms
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20' : 'bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Records</span>
                </div>
                <p className="text-2xl font-bold text-cyan-400">{results.answer.length}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20' : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Query Time</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{queryTime}ms</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Provider</span>
                </div>
                <p className="text-lg font-bold text-purple-400">{dnsProviders.find(p => p.value === provider)?.label.split(' ')[0]}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Avg TTL</span>
                </div>
                <p className="text-xl font-bold text-amber-400">
                  {results.answer.length > 0 
                    ? formatTTL(Math.round(results.answer.reduce((sum, r) => sum + r.TTL, 0) / results.answer.length))
                    : '—'
                  }
                </p>
              </div>
            </div>

            {/* Answer Section */}
            {results.answer.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Answer Records
                  <Badge variant="outline" className={isDark ? 'border-slate-600' : ''}>
                    {results.answer.length}
                  </Badge>
                </h3>
                <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white border'}`}>
                  <Table>
                    <TableHeader>
                      <TableRow className={isDark ? 'border-slate-700' : ''}>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-24">Type</TableHead>
                        <TableHead className="w-20">TTL</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.answer.map((record, i) => (
                        <TableRow key={i} className={isDark ? 'border-slate-700' : ''}>
                          <TableCell className="font-mono text-sm">{record.name}</TableCell>
                          <TableCell>
                            <Badge className={`${getRecordTypeBadge(recordTypes.find(r => r.value === record.type.toString())?.value || record.type)} border`}>
                              {recordTypes.find(r => r.value === record.type.toString())?.value || record.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`font-mono text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {formatTTL(record.TTL)}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-cyan-400 break-all">
                            {record.data}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyResult(record.data)}
                              className="h-8 w-8"
                            >
                              {copied ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* No Results */}
            {results.answer.length === 0 && (
              <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <Globe className="h-12 w-12 mx-auto mb-4 text-slate-500" />
                <p className="text-lg font-medium">No records found</p>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  No {recordType} records exist for {domain}
                </p>
              </div>
            )}

            {/* Authority Section */}
            {results.authority.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  Authority Records
                  <Badge variant="outline" className={isDark ? 'border-slate-600' : ''}>
                    {results.authority.length}
                  </Badge>
                </h3>
                <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-slate-800/50' : 'bg-white border'}`}>
                  <Table>
                    <TableHeader>
                      <TableRow className={isDark ? 'border-slate-700' : ''}>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>TTL</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.authority.map((record, i) => (
                        <TableRow key={i} className={isDark ? 'border-slate-700' : ''}>
                          <TableCell className="font-mono text-sm">{record.name}</TableCell>
                          <TableCell>{record.type}</TableCell>
                          <TableCell className="font-mono text-sm">{formatTTL(record.TTL)}</TableCell>
                          <TableCell className="font-mono text-sm break-all">{record.data}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DNS Record Types Reference */}
        <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h3 className="font-semibold mb-4">Common DNS Record Types</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recordTypes.map(type => (
              <div key={type.value} className={`p-3 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                <Badge className={`${getRecordTypeBadge(type.value)} border mb-2`}>
                  {type.value}
                </Badge>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {type.label.split('(')[1]?.replace(')', '') || type.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolPageWrapper>
  );
}