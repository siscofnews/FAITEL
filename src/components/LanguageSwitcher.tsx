import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
    { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷', country: 'Brasil' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸', country: 'United States' },
    { code: 'fr-FR', name: 'Français', flag: '🇫🇷', country: 'France' }
];

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden md:inline">
                        {currentLanguage.flag} {currentLanguage.name}
                    </span>
                    <span className="md:hidden">{currentLanguage.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`cursor-pointer ${i18n.language === lang.code ? 'bg-accent font-semibold' : ''}`}
                    >
                        <span className="mr-3 text-xl">{lang.flag}</span>
                        <div className="flex flex-col">
                            <span>{lang.name}</span>
                            <span className="text-xs text-muted-foreground">{lang.country}</span>
                        </div>
                        {i18n.language === lang.code && (
                            <span className="ml-auto text-blue-600">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
