import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Download, Upload, Trash2, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import ToolPageWrapper from '@/components/tools/ToolPageWrapper';
import { 
  getSettings, 
  updateSettings, 
  exportAllData, 
  importAllData, 
  clearAllData,
  getFavorites,
  getRecentTools
} from '@/components/utils/storage';

export default function Settings() {
  const isDark = useTheme();
  const [settings, setSettings] = useState({
    showTips: true,
    autoSave: true,
    animations: true,
    compactMode: false
  });
  const [stats, setStats] = useState({
    favorites: 0,
    recent: 0
  });

  useEffect(() => {
    setSettings(getSettings());
    setStats({
      favorites: getFavorites().length,
      recent: getRecentTools().length
    });
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nettools-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = importAllData(event.target?.result as string);
          if (result.success) {
            alert('Data imported successfully! Page will reload.');
            window.location.reload();
          } else {
            alert(`Import failed: ${result.error}`);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      if (confirm('This will delete all favorites, history, templates, and settings. Continue?')) {
        clearAllData();
        alert('All data cleared. Page will reload.');
        window.location.reload();
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    // useTheme() auto-updates via MutationObserver — no setIsDark needed
  };

  return (
    <ToolPageWrapper
      title="Settings"
      description="Manage your preferences and data"
      icon={SettingsIcon}
    >
      <div className="space-y-8">
        {/* Appearance */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className={`space-y-4 p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isDark ? 'Dark' : 'Light'} mode
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Compact Mode</Label>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Reduce spacing and padding
                </p>
              </div>
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(v) => handleSettingChange('compactMode', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Animations</Label>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Enable smooth transitions and animations
                </p>
              </div>
              <Switch
                checked={settings.animations}
                onCheckedChange={(v) => handleSettingChange('animations', v)}
              />
            </div>
          </div>
        </section>

        {/* Behavior */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Behavior</h3>
          <div className={`space-y-4 p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <Label>Show Tips</Label>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Display helpful tips on tool pages
                </p>
              </div>
              <Switch
                checked={settings.showTips}
                onCheckedChange={(v) => handleSettingChange('showTips', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save</Label>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Automatically save calculation history
                </p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(v) => handleSettingChange('autoSave', v)}
              />
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className={`space-y-4 p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Favorites</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.favorites}</p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-900/50' : 'bg-white'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recent Tools</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.recent}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleExport} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button onClick={handleImport} variant="outline" className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                <p className="text-sm text-red-400 font-medium mb-2">⚠️ Danger Zone</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  This will permanently delete all your favorites, history, templates, and settings.
                </p>
              </div>
              <Button 
                onClick={handleClearAll} 
                variant="outline"
                className="w-full border-red-500 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section>
          <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
          <div className={`space-y-3 p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <span>Open command palette</span>
              <kbd className={`px-3 py-1 rounded font-mono text-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                ⌘ K
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Close modals</span>
              <kbd className={`px-3 py-1 rounded font-mono text-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                ESC
              </kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Navigate results</span>
              <kbd className={`px-3 py-1 rounded font-mono text-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                ↑ ↓
              </kbd>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-lg font-semibold mb-4">About</h3>
          <div className={`p-6 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
            <div className="space-y-2">
              <p className="font-medium">NetTools - Network Engineering Toolbox</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Version 1.0.0
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                100% client-side • Privacy-first • Open source
              </p>
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    All tools functional
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Offline ready
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Zero telemetry
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ToolPageWrapper>
  );
}