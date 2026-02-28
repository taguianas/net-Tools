// Local storage utilities for the network toolbox

const STORAGE_KEYS = {
  THEME: 'nettools_theme',
  RECENT_TOOLS: 'nettools_recent',
  FAVORITES: 'nettools_favorites',
  HISTORY: 'nettools_history',
  TEMPLATES: 'nettools_templates',
  SETTINGS: 'nettools_settings'
};

// Theme Management
export const getTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
};

export const setTheme = (theme) => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

// Recent Tools
export const getRecentTools = () => {
  const recent = localStorage.getItem(STORAGE_KEYS.RECENT_TOOLS);
  return recent ? JSON.parse(recent) : [];
};

export const addRecentTool = (toolPath) => {
  let recent = getRecentTools();
  recent = [toolPath, ...recent.filter(t => t !== toolPath)].slice(0, 10);
  localStorage.setItem(STORAGE_KEYS.RECENT_TOOLS, JSON.stringify(recent));
};

// Favorites
export const getFavorites = () => {
  const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
  return favorites ? JSON.parse(favorites) : [];
};

export const toggleFavorite = (toolPath) => {
  let favorites = getFavorites();
  if (favorites.includes(toolPath)) {
    favorites = favorites.filter(f => f !== toolPath);
  } else {
    favorites.push(toolPath);
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  return favorites;
};

export const isFavorite = (toolPath) => {
  return getFavorites().includes(toolPath);
};

// Calculation History
export const getHistory = (toolName) => {
  const allHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const history = allHistory ? JSON.parse(allHistory) : {};
  return history[toolName] || [];
};

export const addToHistory = (toolName, calculation) => {
  const allHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const history = allHistory ? JSON.parse(allHistory) : {};
  
  if (!history[toolName]) {
    history[toolName] = [];
  }
  
  history[toolName] = [
    {
      ...calculation,
      timestamp: Date.now()
    },
    ...history[toolName]
  ].slice(0, 50); // Keep last 50 calculations per tool
  
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

export const clearHistory = (toolName) => {
  const allHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
  const history = allHistory ? JSON.parse(allHistory) : {};
  
  if (toolName) {
    delete history[toolName];
  } else {
    return {}; // Clear all
  }
  
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
};

// Templates
export const getTemplates = (toolName) => {
  const allTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  const templates = allTemplates ? JSON.parse(allTemplates) : {};
  return templates[toolName] || [];
};

export const saveTemplate = (toolName, template) => {
  const allTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  const templates = allTemplates ? JSON.parse(allTemplates) : {};
  
  if (!templates[toolName]) {
    templates[toolName] = [];
  }
  
  templates[toolName].push({
    ...template,
    id: Date.now(),
    createdAt: Date.now()
  });
  
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

export const deleteTemplate = (toolName, templateId) => {
  const allTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  const templates = allTemplates ? JSON.parse(allTemplates) : {};
  
  if (templates[toolName]) {
    templates[toolName] = templates[toolName].filter(t => t.id !== templateId);
  }
  
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
};

// Settings
export const getSettings = () => {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return settings ? JSON.parse(settings) : {
    showTips: true,
    autoSave: true,
    animations: true,
    compactMode: false
  };
};

export const updateSettings = (newSettings) => {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
};

// Export/Import All Data
export const exportAllData = () => {
  const data = {
    recent: getRecentTools(),
    favorites: getFavorites(),
    history: JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '{}'),
    templates: JSON.parse(localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '{}'),
    settings: getSettings(),
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  
  return JSON.stringify(data, null, 2);
};

export const importAllData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.recent) {
      localStorage.setItem(STORAGE_KEYS.RECENT_TOOLS, JSON.stringify(data.recent));
    }
    if (data.favorites) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
    }
    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
    }
    if (data.templates) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};