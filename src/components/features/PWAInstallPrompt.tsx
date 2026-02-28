import React, { useState, useEffect } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const isDark = useTheme();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50",
      "p-4 rounded-xl shadow-2xl",
      isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
    )}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install NetTools</h3>
          <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Install as an app for offline access and faster performance
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleInstall} className="bg-gradient-to-r from-cyan-500 to-blue-600">
              Install
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDismiss} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}