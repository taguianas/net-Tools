import React, { useEffect, useState } from 'react';
import { useTheme } from '@/lib/useTheme';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/lib/utils';
import { ArrowLeft, Info, Star, StarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toggleFavorite, isFavorite } from '@/components/utils/storage';

export default function ToolPageWrapper({ 
  title, 
  description, 
  icon: Icon, 
  children,
  tips = []
}) {
  const isDark = useTheme();
  const [isFav, setIsFav] = useState(false);

  // Get current page name from URL
  const pageName = window.location.pathname.split('/').pop() || 'Dashboard';

  useEffect(() => {
    setIsFav(isFavorite(pageName));
  }, [pageName]);

  const handleToggleFavorite = () => {
    toggleFavorite(pageName);
    setIsFav(!isFav);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" className="mb-2 -ml-2 text-slate-400 hover:text-cyan-400">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              <p className={`text-sm md:text-base ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {description}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          className={cn(isFav && "text-yellow-500")}
        >
          {isFav ? (
            <Star className="h-5 w-5 fill-current" />
          ) : (
            <StarOff className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          isDark ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-cyan-50 border border-cyan-100'
        }`}>
          <Info className="h-5 w-5 text-cyan-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            {tips.map((tip, i) => (
              <p key={i} className={isDark ? 'text-cyan-100' : 'text-cyan-800'}>{tip}</p>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "rounded-2xl p-6 card-elevated transition-all duration-300",
        isDark 
          ? 'glass neon-border' 
          : 'glass-light neon-border-light'
      )}>
        {children}
      </div>
    </motion.div>
  );
}