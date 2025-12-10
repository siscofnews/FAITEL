import { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const LANGUAGES: { code: Language; name: string; flag: string; nativeName: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Mandarim', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ru', name: 'Russo', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ja', name: 'Japonês', flag: '🇯🇵', nativeName: '日本語' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'header';
  className?: string;
}

export const LanguageSelector = ({ variant = 'default', className }: LanguageSelectorProps) => {
  const { language, setLanguage, isDetecting } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  if (isDetecting) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        disabled 
        className={cn(
          "bg-gold/20 border-gold/50 text-white animate-pulse",
          className
        )}
      >
        <Globe className="h-4 w-4 mr-2 animate-spin" />
        <span className="hidden sm:inline">Detectando...</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            variant === 'header' 
              ? "bg-muted/50 border-border text-foreground hover:bg-muted hover:border-gold transition-all duration-300 gap-2"
              : "bg-gradient-to-r from-gold/30 to-gold/20 border-gold/50 text-white hover:bg-gold/40 hover:border-gold transition-all duration-300 shadow-lg hover:shadow-gold/20",
            variant === 'compact' && "px-2",
            className
          )}
        >
          <span className="text-xl">{currentLang.flag}</span>
          {variant === 'default' && (
            <span className="hidden sm:inline font-medium">{currentLang.nativeName}</span>
          )}
          {variant === 'header' && (
            <span className="font-medium text-sm">{currentLang.code.toUpperCase()}</span>
          )}
          <ChevronDown className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-navy border-gold/30 shadow-xl z-[100]"
        sideOffset={8}
      >
        <div className="px-2 py-1.5 text-xs font-semibold text-gold/80 uppercase tracking-wider">
          Selecionar Idioma
        </div>
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code);
              setIsOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
              "text-white hover:bg-gold/20 hover:text-gold focus:bg-gold/20 focus:text-gold",
              language === lang.code && "bg-gold/10 text-gold"
            )}
          >
            <span className="text-xl">{lang.flag}</span>
            <div className="flex flex-col flex-1">
              <span className="font-medium">{lang.nativeName}</span>
              <span className="text-xs text-white/60">{lang.name}</span>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-gold" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
