import { useVisitorCounter } from '@/hooks/useVisitorCounter';
import { Users, Eye, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface VisitorCounterProps {
  pagePath?: string;
  variant?: 'default' | 'compact' | 'banner';
}

export function VisitorCounter({ pagePath = '/', variant = 'default' }: VisitorCounterProps) {
  const { visitorCount, isLoading } = useVisitorCounter(pagePath);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('pt-BR');
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span>{isLoading ? '...' : formatNumber(visitorCount)}</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="p-2 bg-primary/20 rounded-full">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total de Visitantes</p>
            <p className="text-2xl font-bold text-primary">
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                formatNumber(visitorCount)
              )}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3 shadow-sm"
    >
      <div className="p-2 bg-primary/10 rounded-full">
        <Users className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Visitantes</p>
        <p className="text-xl font-bold text-foreground">
          {isLoading ? (
            <span className="animate-pulse">Carregando...</span>
          ) : (
            formatNumber(visitorCount)
          )}
        </p>
      </div>
    </motion.div>
  );
}
