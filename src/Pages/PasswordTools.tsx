import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, RefreshCw, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import ResultCard from '@/components/tools/ResultCard';

// Cisco Type 7 encoding/decoding
const ciscoType7Key = "dsfd;kfoA,.iyewrkldJKDHSUBsgvca69834ncxv9873254k;fg87";

function encodeCiscoType7(password) {
  const seed = Math.floor(Math.random() * 16);
  let encoded = seed.toString(10).padStart(2, '0');
  
  for (let i = 0; i < password.length; i++) {
    const charCode = password.charCodeAt(i);
    const keyChar = ciscoType7Key.charCodeAt((seed + i) % ciscoType7Key.length);
    const encodedChar = (charCode ^ keyChar).toString(16).padStart(2, '0').toUpperCase();
    encoded += encodedChar;
  }
  
  return encoded;
}

function decodeCiscoType7(encoded) {
  if (encoded.length < 2) return null;
  
  const seed = parseInt(encoded.substring(0, 2), 10);
  if (isNaN(seed)) return null;
  
  let decoded = '';
  for (let i = 2; i < encoded.length; i += 2) {
    const hexChar = encoded.substring(i, i + 2);
    const charCode = parseInt(hexChar, 16);
    const keyChar = ciscoType7Key.charCodeAt((seed + (i - 2) / 2) % ciscoType7Key.length);
    decoded += String.fromCharCode(charCode ^ keyChar);
  }
  
  return decoded;
}

// Password generator
function generatePassword(length, options) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let charset = '';
  if (options.lowercase) charset += lowercase;
  if (options.uppercase) charset += uppercase;
  if (options.numbers) charset += numbers;
  if (options.symbols) charset += symbols;
  
  if (!charset) return '';
  
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  
  return password;
}

// Password strength calculator
function calculateStrength(password) {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  const strength = score <= 2 ? 'Weak' : score <= 4 ? 'Medium' : score <= 5 ? 'Strong' : 'Very Strong';
  const color = score <= 2 ? 'red' : score <= 4 ? 'yellow' : score <= 5 ? 'green' : 'cyan';
  
  return { score, strength, color, maxScore: 7 };
}

export default function PasswordTools() {
  const [isDark, setIsDark] = useState(true);
  
  // Password Generator
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
  });
  const [copied, setCopied] = useState('');
  
  // Cisco Type 7
  const [type7Input, setType7Input] = useState('');
  const [type7Mode, setType7Mode] = useState('encode');
  const [type7Result, setType7Result] = useState('');
  
  // Password Strength
  const [strengthInput, setStrengthInput] = useState('');
  const [strengthResult, setStrengthResult] = useState(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleGenerate = () => {
    const pwd = generatePassword(passwordLength, options);
    setGeneratedPassword(pwd);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleType7Convert = () => {
    if (type7Mode === 'encode') {
      setType7Result(encodeCiscoType7(type7Input));
    } else {
      const decoded = decodeCiscoType7(type7Input);
      setType7Result(decoded || 'Invalid Type 7 hash');
    }
  };

  const handleStrengthCheck = () => {
    const result = calculateStrength(strengthInput);
    setStrengthResult(result);
  };

  useEffect(() => {
    if (strengthInput) {
      handleStrengthCheck();
    } else {
      setStrengthResult(null);
    }
  }, [strengthInput]);

  return (
    <ToolPageWrapper
      title="Password & Hash Tools"
      description="Generate passwords and work with Cisco password hashes"
      icon={Key}
      tips={[
        'Generate secure passwords for network device management',
        'Encode/decode Cisco Type 7 passwords (not cryptographically secure)'
      ]}
    >
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className={isDark ? 'bg-slate-800' : ''}>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="cisco">Cisco Type 7</TabsTrigger>
          <TabsTrigger value="strength">Strength Check</TabsTrigger>
        </TabsList>

        {/* Password Generator */}
        <TabsContent value="generate" className="space-y-6">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <Label className="mb-4 block">Password Length: {passwordLength} characters</Label>
            <Slider
              value={[passwordLength]}
              onValueChange={(v) => setPasswordLength(v[0])}
              min={8}
              max={64}
              step={1}
              className="mb-6"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="lowercase"
                  checked={options.lowercase}
                  onChange={(e) => setOptions({...options, lowercase: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="lowercase">Lowercase (a-z)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="uppercase"
                  checked={options.uppercase}
                  onChange={(e) => setOptions({...options, uppercase: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="numbers"
                  checked={options.numbers}
                  onChange={(e) => setOptions({...options, numbers: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="numbers">Numbers (0-9)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="symbols"
                  checked={options.symbols}
                  onChange={(e) => setOptions({...options, symbols: e.target.checked})}
                  className="h-4 w-4"
                />
                <Label htmlFor="symbols">Symbols (!@#$...)</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleGenerate} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Password
          </Button>

          {generatedPassword && (
            <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-4">
                <Label>Generated Password</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(generatedPassword, 'generated')}
                >
                  {copied === 'generated' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="font-mono text-2xl break-all text-cyan-400 p-4 rounded-lg bg-slate-900/50">
                {generatedPassword}
              </p>
              <div className="mt-4">
                <StrengthMeter password={generatedPassword} isDark={isDark} />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Cisco Type 7 */}
        <TabsContent value="cisco" className="space-y-6">
          <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-100'}`}>
            <p className="text-sm text-amber-400">
              ⚠️ Cisco Type 7 is NOT secure encryption - it's simple obfuscation. Use Type 5 (MD5) or Type 8/9 (SHA256/scrypt) for production.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant={type7Mode === 'encode' ? 'default' : 'outline'}
              onClick={() => setType7Mode('encode')}
            >
              Encode
            </Button>
            <Button
              variant={type7Mode === 'decode' ? 'default' : 'outline'}
              onClick={() => setType7Mode('decode')}
            >
              Decode
            </Button>
          </div>

          <div>
            <Label>{type7Mode === 'encode' ? 'Plain Text Password' : 'Type 7 Hash'}</Label>
            <Input
              value={type7Input}
              onChange={(e) => setType7Input(e.target.value)}
              placeholder={type7Mode === 'encode' ? 'Enter password' : 'Enter Type 7 hash'}
              className={`mt-1 font-mono ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>

          <Button onClick={handleType7Convert} className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <Lock className="h-4 w-4 mr-2" />
            {type7Mode === 'encode' ? 'Encode' : 'Decode'}
          </Button>

          {type7Result && (
            <ResultCard 
              label={type7Mode === 'encode' ? 'Type 7 Hash' : 'Decoded Password'}
              value={type7Result}
            />
          )}
        </TabsContent>

        {/* Strength Checker */}
        <TabsContent value="strength" className="space-y-6">
          <div>
            <Label>Password to Check</Label>
            <Input
              type="password"
              value={strengthInput}
              onChange={(e) => setStrengthInput(e.target.value)}
              placeholder="Enter password"
              className={`mt-1 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}
            />
          </div>

          {strengthResult && (
            <StrengthMeter password={strengthInput} isDark={isDark} detailed />
          )}
        </TabsContent>
      </Tabs>
    </ToolPageWrapper>
  );
}

function StrengthMeter({ password, isDark, detailed = false }) {
  const result = calculateStrength(password);
  const percentage = (result.score / result.maxScore) * 100;

  const colorClasses = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    cyan: 'bg-cyan-500'
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label>Strength: {result.strength}</Label>
        <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {result.score}/{result.maxScore}
        </span>
      </div>
      <div className={`h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ${colorClasses[result.color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {detailed && (
        <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <h4 className="font-medium mb-3">Password Analysis</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Length ({password.length} chars)</span>
              <Badge variant={password.length >= 12 ? 'default' : 'outline'}>
                {password.length >= 16 ? 'Excellent' : password.length >= 12 ? 'Good' : 'Too Short'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Lowercase letters</span>
              <Badge variant={/[a-z]/.test(password) ? 'default' : 'outline'}>
                {/[a-z]/.test(password) ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Uppercase letters</span>
              <Badge variant={/[A-Z]/.test(password) ? 'default' : 'outline'}>
                {/[A-Z]/.test(password) ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Numbers</span>
              <Badge variant={/[0-9]/.test(password) ? 'default' : 'outline'}>
                {/[0-9]/.test(password) ? '✓' : '✗'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Special characters</span>
              <Badge variant={/[^a-zA-Z0-9]/.test(password) ? 'default' : 'outline'}>
                {/[^a-zA-Z0-9]/.test(password) ? '✓' : '✗'}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}