import React, { useState } from 'react';
import { useTheme } from '@/lib/useTheme';
import { HelpCircle, X, Book, Keyboard, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Open command palette' },
  { keys: ['⌘', '/'], description: 'Toggle quick calculator' },
  { keys: ['ESC'], description: 'Close modals and dialogs' },
  { keys: ['↑', '↓'], description: 'Navigate in lists' },
  { keys: ['Enter'], description: 'Select/Submit' },
];

const tips = {
  SubnetCalculator: [
    'Use /31 for point-to-point links (RFC 3021)',
    'Class C networks use /24 by default (254 hosts)',
    'Remember: Network and broadcast addresses are not usable',
  ],
  VLSMPlanner: [
    'Always allocate largest subnets first',
    'Leave room for growth - don\'t use 100% of address space',
    'Document your VLSM plan for future reference',
  ],
  VLANPlanner: [
    'VLAN 1 is the default and cannot be deleted',
    'Use VLANs 2-1001 for normal range',
    'Keep management on separate VLAN for security',
  ],
  ACLBuilder: [
    'Rules are processed top to bottom',
    'More specific rules should come first',
    'Always test ACLs in lab before production',
  ],
};

export default function HelpPanel({ toolName }) {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = useTheme();

  const toolTips = tips[toolName] || [];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg"
        title="Help (Press ?)"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className={cn(
            "relative w-full max-w-2xl rounded-2xl shadow-2xl",
            isDark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200"
          )}>
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-500" />
                <h2 className="text-xl font-bold">Help & Tips</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Tabs defaultValue="shortcuts" className="p-6">
              <TabsList className={`grid grid-cols-3 mb-6 ${isDark ? 'bg-slate-800' : ''}`}>
                <TabsTrigger value="shortcuts">
                  <Keyboard className="h-4 w-4 mr-2" />
                  Shortcuts
                </TabsTrigger>
                {toolTips.length > 0 && (
                  <TabsTrigger value="tips">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Tips
                  </TabsTrigger>
                )}
                <TabsTrigger value="about">
                  <Book className="h-4 w-4 mr-2" />
                  About
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shortcuts" className="space-y-3">
                {shortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      {shortcut.description}
                    </span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, j) => (
                        <kbd 
                          key={j}
                          className={cn(
                            "px-2 py-1 rounded font-mono text-xs",
                            isDark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {toolTips.length > 0 && (
                <TabsContent value="tips" className="space-y-3">
                  {toolTips.map((tip, i) => (
                    <div key={i} className={`p-4 rounded-lg ${isDark ? 'bg-cyan-500/10' : 'bg-cyan-50'}`}>
                      <div className="flex gap-3">
                        <Lightbulb className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                        <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{tip}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              )}

              <TabsContent value="about" className="space-y-4">
                <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  NetTools is a privacy-first network engineering toolbox that runs entirely in your browser.
                </p>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-green-500/10' : 'bg-green-50'}`}>
                  <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <li>✓ 100% Client-Side - No servers required</li>
                    <li>✓ Zero Data Transmission - Complete privacy</li>
                    <li>✓ Offline Capable - Works without internet</li>
                    <li>✓ Open Architecture - Transparent code</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}