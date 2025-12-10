import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Users } from "lucide-react";

export function VisitorBanner() {
    const { data: todayVisits } = useQuery({
        queryKey: ["visitor-banner-count"],
        queryFn: async () => {
            const todayStr = format(new Date(), "yyyy-MM-dd");
            const { data, error } = await supabase
                .from("visitor_stats")
                .select("visit_count")
                .eq("visit_date", todayStr);

            if (error) {
                console.error("Error fetching visits", error);
                return 0;
            }

            const total = data?.reduce((sum, row) => sum + row.visit_count, 0) || 0;
            // Add a base number to make it look "lively" if low traffic (optional, usually requested by clients)
            // For now, raw number.
            return total;
        },
        refetchInterval: 30000, // Update every 30s
    });

    return (
        <div className="bg-gradient-to-r from-red-900 via-red-700 to-red-900 text-white overflow-hidden py-3 border-b border-red-800 shadow-md relative z-40">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xl font-bold font-display tracking-wider">
                <span className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-yellow-400" />
                    VISITANTES HOJE: <span className="text-yellow-400 text-2xl">{todayVisits || 0}</span>
                </span>
                <span className="text-red-300">•</span>
                <span>BEM-VINDO AO SISCOF NEWS</span>
                <span className="text-red-300">•</span>
                <span>RÁDIO MISSÕES PELO MUNDO - AO VIVO 24H</span>
                <span className="text-red-300">•</span>
                <span>JESUS TE AMA</span>
                <span className="text-red-300">•</span>
                <span>ACESSE NOSSAS ESCALAS E EVENTOS</span>
                <span className="text-red-300">•</span>
                <span className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-yellow-400" />
                    VISITANTES HOJE: <span className="text-yellow-400 text-2xl">{todayVisits || 0}</span>
                </span>
            </div>

            {/* Inline styles for marquee animation if not tailored in Tailwind config */}
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
        </div>
    );
}
