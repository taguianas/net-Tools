import React, { useState } from 'react';
import { Download, FileText, File, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ExportButton({ data, filename = 'export', formats = ['txt', 'json', 'csv'] }) {
  const handleExport = (format) => {
    let content = '';
    let type = 'text/plain';
    let ext = format;

    if (format === 'txt') {
      if (typeof data === 'string') {
        content = data;
      } else {
        content = JSON.stringify(data, null, 2);
      }
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      type = 'application/json';
    } else if (format === 'csv') {
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(',')).join('\n');
        content = `${headers}\n${rows}`;
      } else {
        content = 'No data available';
      }
      type = 'text/csv';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (formats.length === 1) {
    return (
      <Button variant="outline" size="sm" onClick={() => handleExport(formats[0])}>
        <Download className="h-4 w-4 mr-2" />
        Export {formats[0].toUpperCase()}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {formats.includes('txt') && (
          <DropdownMenuItem onClick={() => handleExport('txt')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as TXT
          </DropdownMenuItem>
        )}
        {formats.includes('json') && (
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <File className="h-4 w-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>
        )}
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileText className="h-4 w-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}