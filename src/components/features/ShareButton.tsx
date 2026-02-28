import React, { useState } from 'react';
import { Share2, Link2, QrCode, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function ShareButton({ params, title = 'Share Calculation' }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const generateUrl = () => {
    const url = new URL(window.location.href);
    // Clear existing params
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.forEach((_, key) => url.searchParams.delete(key));
    
    // Add new params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
    
    return url.toString();
  };

  const shareUrl = generateUrl();

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateQR = () => {
    // In a real implementation, you'd generate a QR code
    // For now, we'll use a free API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Shareable Link</label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-3">Scan to open on mobile</p>
            <img 
              src={generateQR()} 
              alt="QR Code" 
              className="mx-auto rounded-lg border-2 border-slate-200 dark:border-slate-700"
            />
          </div>

          <p className="text-xs text-slate-500">
            Anyone with this link can view your calculation. The link includes the input parameters but no personal data.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}