import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RadioChat } from "./RadioChat";

// Placeholder Zeno Stream (Replace with actual ID)
// Example Zeno Stream URL format: https://stream.zeno.fm/[id]
const STREAM_URL = "https://stream.zeno.fm/sz648756238uv"; // Placeholder ID, will need update.

export function RadioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState([80]);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Attempt autoplay on mount
        const playAudio = async () => {
            if (audioRef.current) {
                try {
                    audioRef.current.volume = volume[0] / 100;
                    await audioRef.current.play();
                    setIsPlaying(true);
                } catch (err) {
                    console.log("Autoplay blocked, waiting for user interaction", err);
                    setIsPlaying(false);
                }
            }
        }
        playAudio();

        // Setup error handling to try to reconnect
        const audio = audioRef.current;
        if (audio) {
            audio.addEventListener('error', (e) => {
                console.error("Audio Error", e);
                setError(true);
            });
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.src = ""; // Cleanup
            }
        }
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(e => console.error(e));
            setIsPlaying(true);
            setError(false);
        }
    };

    const handleVolumeChange = (value: number[]) => {
        setVolume(value);
        if (audioRef.current) {
            audioRef.current.volume = value[0] / 100;
        }
        if (value[0] > 0) setIsMuted(false);
    };

    const toggleMute = () => {
        if (!audioRef.current) return;

        if (isMuted) {
            audioRef.current.volume = volume[0] / 100;
            setIsMuted(false);
        } else {
            audioRef.current.volume = 0;
            setIsMuted(true);
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-16 bg-[#D32F2F] text-white z-50 shadow-md flex items-center justify-between px-4 lg:px-8 transition-transform duration-300">

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={STREAM_URL}
                preload="auto"
                onError={() => setError(true)}
            />

            <div className="flex items-center gap-4">
                {/* Logo / Title Area */}
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-full w-10 h-10 flex items-center justify-center shadow-sm">
                        <img
                            src="/radio-logo.jpg"
                            alt="Logo Rádio"
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                                // Fallback icon if image fails
                                (e.target as HTMLImageElement).style.display = 'none';
                                // We can't easily replace with icon here in JSX without state, 
                                // but parent div will show white.
                            }}
                        />
                        {/* Fallback if image hidden/missing: could conditionally render icon, 
                     but simplified for now. */}
                    </div>
                    <div className="hidden md:block">
                        <h3 className="font-bold text-sm leading-tight">Rádio Missões</h3>
                        <p className="text-xs text-white/80">Pelo Mundo – Ao Vivo</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 md:gap-6">
                {error && (
                    <span className="text-xs bg-black/20 px-2 py-1 rounded text-white/80 animate-pulse">
                        Sinal indisponível
                    </span>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 hover:text-white rounded-full w-10 h-10"
                    onClick={togglePlay}
                >
                    {isPlaying ? <Pause className="fill-current w-5 h-5" /> : <Play className="fill-current w-5 h-5 ml-1" />}
                </Button>

                {/* Volume Control - Hidden on small mobile */}
                <div className="hidden sm:flex items-center gap-2 w-32 group">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-transparent" onClick={toggleMute}>
                        {isMuted || volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <Slider
                        value={isMuted ? [0] : volume}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="cursor-pointer"
                    />
                </div>

                <div className="border-l pl-4 ml-2 border-white/20">
                    <RadioChat />
                </div>
            </div>
        </div>
    );
}
