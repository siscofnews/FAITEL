import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

// URL da stream de rádio - SUBSTITUA PELA URL REAL DA SUA RÁDIO
const RADIO_STREAM_URL = 'https://sua-radio-stream-url.com/live';

export const RadioPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(70);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Criar elemento de áudio apenas uma vez
        if (!audioRef.current) {
            audioRef.current = new Audio(RADIO_STREAM_URL);
            audioRef.current.volume = volume / 100;

            // Tentar autoplay
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((error) => {
                        console.log('Autoplay bloqueado pelo navegador:', error);
                        // Usuário precisa interagir primeiro
                    });
            }
        }

        return () => {
            // Não destruir o audio ao desmontar para manter tocando entre páginas
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((error) => console.error('Erro ao tocar:', error));
        }
    };

    const handleVolumeChange = (newVolume: number[]) => {
        const volumeValue = newVolume[0];
        setVolume(volumeValue);

        if (audioRef.current) {
            audioRef.current.volume = volumeValue / 100;
        }

        if (volumeValue > 0 && isMuted) {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        if (!audioRef.current) return;

        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        audioRef.current.muted = newMutedState;
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 shadow-lg">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo e Nome da Rádio */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm">
                            <Volume2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-white font-bold text-sm sm:text-base truncate">
                                Rádio Missões Pelo Mundo
                            </h3>
                            <p className="text-white/80 text-xs hidden sm:block">
                                {isPlaying ? '🔴 Ao Vivo' : 'Offline'}
                            </p>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Controle de Volume (Desktop) */}
                        <div className="hidden md:flex items-center gap-2 min-w-[120px]">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className="h-8 w-8 text-white hover:bg-white/20"
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </Button>

                            <Slider
                                value={[isMuted ? 0 : volume]}
                                onValueChange={handleVolumeChange}
                                max={100}
                                step={1}
                                className="w-20"
                            />
                        </div>

                        {/* Botão Play/Pause */}
                        <Button
                            onClick={togglePlay}
                            size="icon"
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white text-purple-600 hover:bg-white/90 shadow-lg"
                        >
                            {isPlaying ? (
                                <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
                            ) : (
                                <Play className="h-5 w-5 sm:h-6 sm:w-6 ml-1" />
                            )}
                        </Button>

                        {/* Controle de Volume (Mobile) */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMute}
                            className="h-8 w-8 md:hidden text-white hover:bg-white/20"
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
