import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getTemplates, saveTemplate, deleteTemplate } from '@/components/utils/storage';

export default function TemplateManager({ toolName, currentData, onLoad }) {
  const [templates, setTemplates] = useState([]);
  const [showManager, setShowManager] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    loadTemplates();
  }, [toolName]);

  const loadTemplates = () => {
    setTemplates(getTemplates(toolName));
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    saveTemplate(toolName, {
      name: templateName,
      data: currentData
    });

    setTemplateName('');
    loadTemplates();
    alert('Template saved!');
  };

  const handleLoad = (template) => {
    onLoad(template.data);
    setShowManager(false);
  };

  const handleDelete = (templateId, e) => {
    e.stopPropagation();
    if (confirm('Delete this template?')) {
      deleteTemplate(toolName, templateId);
      loadTemplates();
    }
  };

  return (
    <div className="space-y-4">
      {/* Save New Template */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <Label className="mb-2 block">Save Current Configuration as Template</Label>
        <div className="flex gap-2">
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name..."
            className={isDark ? 'bg-slate-800 border-slate-700' : ''}
          />
          <Button onClick={handleSave} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Load Templates */}
      {templates.length > 0 && (
        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
          <button
            onClick={() => setShowManager(!showManager)}
            className="w-full flex items-center justify-between mb-3"
          >
            <Label>Saved Templates ({templates.length})</Label>
            <FolderOpen className="h-4 w-4" />
          </button>

          {showManager && (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg group",
                    isDark ? 'bg-slate-900/50 hover:bg-slate-900' : 'bg-white hover:bg-slate-100'
                  )}
                >
                  <button
                    onClick={() => handleLoad(template)}
                    className="flex-1 flex items-center gap-2 text-left"
                  >
                    <ChevronRight className="h-4 w-4 text-cyan-500" />
                    <span className="font-medium">{template.name}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(template.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}