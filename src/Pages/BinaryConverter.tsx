import React, { useState, useEffect } from 'react';
import { Binary, ArrowRightLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

function ipToBinary(ip) {
  return ip.split('.').map(n => parseInt(n).toString(2).padStart(8, '0')).join('.');
}

function ipToHex(ip) {
  return ip.split('.').map(n => parseInt(n).toString(16).padStart(2, '0').toUpperCase()).join(':');
}

function ipToDecimal(ip) {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function binaryToIp(binary) {
  const cleaned = binary.replace(/[.\s]/g, '');
  if (cleaned.length !== 32) return null;
  
  const octets = cleaned.match(/.{8}/g);
  return octets.map(b => parseInt(b, 2)).join('.');
}

function hexToIp(hex) {
  const cleaned = hex.replace(/[:\s]/g, '');
  if (cleaned.length !== 8) return null;
  
  const octets = cleaned.match(/.{2}/g);
  return octets.map(h => parseInt(h, 16)).join('.');
}

function decimalToIp(decimal) {
  const num = parseInt(decimal);
  if (isNaN(num) || num < 0 || num > 4294967295) return null;
  
  return [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.');
}

function decimalToBinary(num) {
  return parseInt(num).toString(2).padStart(32, '0').match(/.{8}/g).join('.');
}

function decimalToHex(num) {
  return parseInt(num).toString(16).padStart(8, '0').toUpperCase().match(/.{2}/g).join(':');
}

function binaryToHex(binary) {
  const cleaned = binary.replace(/[.\s]/g, '');
  return cleaned.match(/.{8}/g)
    .map(b => parseInt(b, 2).toString(16).padStart(2, '0').toUpperCase())
    .join(':');
}

function hexToBinary(hex) {
  const cleaned = hex.replace(/[:\s]/g, '');
  return cleaned.match(/.{2}/g)
    .map(h => parseInt(h, 16).toString(2).padStart(8, '0'))
    .join('.');
}

function binaryToDecimal(binary) {
  const cleaned = binary.replace(/[.\s]/g, '');
  return parseInt(cleaned, 2);
}

function hexToDecimal(hex) {
  const cleaned = hex.replace(/[:\s]/g, '');
  return parseInt(cleaned, 16);
}

export default function BinaryConverter() {
  const [isDark, setIsDark] = useState(true);
  
  // IP Converter
  const [ipInput, setIpInput] = useState('192.168.1.1');
  const [ipResult, setIpResult] = useState(null);
  
  // Number Converter
  const [numberInput, setNumberInput] = useState('');
  const [numberFormat, setNumberFormat] = useState('decimal');
  const [numberResult, setNumberResult] = useState(null);
  
  // Subnet Mask Converter
  const [maskInput, setMaskInput] = useState('255.255.255.0');
  const [maskResult, setMaskResult] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const convertIP = () => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ipInput)) return;
    
    setIpResult({
      dotted: ipInput,
      binary: ipToBinary(ipInput),
      hex: ipToHex(ipInput),
      decimal: ipToDecimal(ipInput).toString()
    });
  };

  const convertNumber = () => {
    let result = {};
    
    try {
      if (numberFormat === 'decimal') {
        const num = parseInt(numberInput);
        if (isNaN(num)) return;
        result = {
          decimal: num.toString(),
          binary: decimalToBinary(num),
          hex: decimalToHex(num),
          ip: decimalToIp(num)
        };
      } else if (numberFormat === 'binary') {
        const cleaned = numberInput.replace(/[.\s]/g, '');
        if (!/^[01]+$/.test(cleaned)) return;
        const dec = binaryToDecimal(numberInput);
        result = {
          decimal: dec.toString(),
          binary: cleaned.match(/.{1,8}/g).join('.').padStart(35, '0'),
          hex: binaryToHex(cleaned.padStart(32, '0')),
          ip: decimalToIp(dec)
        };
      } else if (numberFormat === 'hex') {
        const cleaned = numberInput.replace(/[:\s]/g, '');
        if (!/^[0-9A-Fa-f]+$/.test(cleaned)) return;
        const dec = hexToDecimal(numberInput);
        result = {
          decimal: dec.toString(),
          binary: hexToBinary(cleaned.padStart(8, '0')),
          hex: cleaned.toUpperCase().padStart(8, '0').match(/.{2}/g).join(':'),
          ip: decimalToIp(dec)
        };
      }
      setNumberResult(result);
    } catch (e) {
      // Invalid input
    }
  };

  const convertMask = () => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(maskInput)) return;
    
    const binary = ipToBinary(maskInput);
    const bits = binary.replace(/\./g, '');
    const cidr = bits.lastIndexOf('1') + 1;
    
    // Calculate wildcard
    const parts = maskInput.split('.').map(Number);
    const wildcard = parts.map(p => 255 - p).join('.');
    
    setMaskResult({
      dotted: maskInput,
      binary,
      cidr: `/${cidr}`,
      wildcard,
      hex: ipToHex(maskInput)
    });
  };

  return (
    <ToolPageWrapper
      title="Binary & Hex Converter"
      description="Convert between decimal, binary, hexadecimal formats for IPs and numbers"
      icon={Binary}
      tips={[
        'Convert IP addresses between dotted decimal, binary, hex, and decimal formats',
        'Useful for understanding subnet masks and bitwise operations'
      ]}
    >
      <Tabs defaultValue="ip" className="space-y-6">
        <TabsList className={isDark ? 'bg-slate-800' : ''}>
          <TabsTrigger value="ip">IP Address</TabsTrigger>
          <TabsTrigger value="number">Number</TabsTrigger>
          <TabsTrigger value="mask">Subnet Mask</TabsTrigger>
        </TabsList>

        {/* IP Converter */}
        <TabsContent value="ip" className="space-y-6">
          <div>
            <Label>IP Address</Label>
            <Input
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="192.168.1.1"
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>

          <Button onClick={convertIP} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Convert
          </Button>

          {ipResult && (
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard label="Dotted Decimal" value={ipResult.dotted} />
              <ResultCard label="32-bit Decimal" value={ipResult.decimal} />
              <ResultCard label="Binary" value={ipResult.binary} />
              <ResultCard label="Hexadecimal" value={ipResult.hex} />
            </div>
          )}
        </TabsContent>

        {/* Number Converter */}
        <TabsContent value="number" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Input Format</Label>
              <Tabs value={numberFormat} onValueChange={setNumberFormat} className="mt-1">
                <TabsList className={`grid grid-cols-3 ${isDark ? 'bg-slate-800' : ''}`}>
                  <TabsTrigger value="decimal">Decimal</TabsTrigger>
                  <TabsTrigger value="binary">Binary</TabsTrigger>
                  <TabsTrigger value="hex">Hex</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                placeholder={
                  numberFormat === 'decimal' ? '3232235777' :
                  numberFormat === 'binary' ? '11000000.10101000.00000001.00000001' :
                  'C0:A8:01:01'
                }
                className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
              />
            </div>
          </div>

          <Button onClick={convertNumber} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Convert
          </Button>

          {numberResult && (
            <div className="grid gap-4 md:grid-cols-2">
              <ResultCard label="Decimal" value={numberResult.decimal} />
              <ResultCard label="Hexadecimal" value={numberResult.hex} />
              <ResultCard label="Binary" value={numberResult.binary} />
              <ResultCard label="IP Address" value={numberResult.ip} />
            </div>
          )}
        </TabsContent>

        {/* Subnet Mask Converter */}
        <TabsContent value="mask" className="space-y-6">
          <div>
            <Label>Subnet Mask</Label>
            <Input
              value={maskInput}
              onChange={(e) => setMaskInput(e.target.value)}
              placeholder="255.255.255.0"
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>

          <Button onClick={convertMask} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Convert
          </Button>

          {maskResult && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ResultCard label="Dotted Decimal" value={maskResult.dotted} />
              <ResultCard label="CIDR Notation" value={maskResult.cidr} />
              <ResultCard label="Wildcard Mask" value={maskResult.wildcard} />
              <ResultCard label="Binary" value={maskResult.binary} />
              <ResultCard label="Hexadecimal" value={maskResult.hex} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reference Table */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <h3 className="font-semibold mb-4">Common Subnet Masks</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { cidr: '/24', mask: '255.255.255.0', hosts: '254' },
            { cidr: '/25', mask: '255.255.255.128', hosts: '126' },
            { cidr: '/26', mask: '255.255.255.192', hosts: '62' },
            { cidr: '/27', mask: '255.255.255.224', hosts: '30' },
            { cidr: '/28', mask: '255.255.255.240', hosts: '14' },
            { cidr: '/29', mask: '255.255.255.248', hosts: '6' },
            { cidr: '/30', mask: '255.255.255.252', hosts: '2' },
            { cidr: '/16', mask: '255.255.0.0', hosts: '65534' },
            { cidr: '/8', mask: '255.0.0.0', hosts: '16777214' },
          ].map(item => (
            <div key={item.cidr} className={`p-3 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-cyan-400 font-bold">{item.cidr}</span>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {item.hosts} hosts
                </span>
              </div>
              <p className={`text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.mask}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ToolPageWrapper>
  );
}