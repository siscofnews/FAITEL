import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HourlyStats {
  visit_date: string;
  visit_hour: number;
  visit_count: number;
}

const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function VisitorHeatmap() {
  const { data: hourlyStats, isLoading } = useQuery({
    queryKey: ["visitor-hourly-stats"],
    queryFn: async () => {
      const sevenDaysAgo = format(subDays(new Date(), 6), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("visitor_hourly_stats")
        .select("visit_date, visit_hour, visit_count")
        .gte("visit_date", sevenDaysAgo)
        .order("visit_date", { ascending: true });
      
      if (error) throw error;
      return data as HourlyStats[];
    },
  });

  // Build heatmap data matrix (7 days x 24 hours)
  const buildHeatmapData = () => {
    const today = new Date();
    const days: { date: Date; label: string }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      days.push({
        date,
        label: format(date, "EEE", { locale: ptBR }),
      });
    }

    // Create matrix with visit counts
    const matrix: number[][] = days.map(day => {
      const dayStr = format(day.date, "yyyy-MM-dd");
      return HOURS.map(hour => {
        const stat = hourlyStats?.find(
          s => s.visit_date === dayStr && s.visit_hour === hour
        );
        return stat?.visit_count || 0;
      });
    });

    // Find max value for color scaling
    const maxValue = Math.max(...matrix.flat(), 1);

    return { days, matrix, maxValue };
  };

  const { days, matrix, maxValue } = buildHeatmapData();

  // Get intensity class based on value
  const getIntensityColor = (value: number): string => {
    if (value === 0) return "bg-secondary/30";
    const intensity = value / maxValue;
    if (intensity < 0.25) return "bg-primary/20";
    if (intensity < 0.5) return "bg-primary/40";
    if (intensity < 0.75) return "bg-primary/60";
    return "bg-primary/90";
  };

  // Find peak hours
  const getPeakHours = () => {
    if (!hourlyStats || hourlyStats.length === 0) return [];
    
    const hourTotals = HOURS.map(hour => ({
      hour,
      total: hourlyStats
        .filter(s => s.visit_hour === hour)
        .reduce((sum, s) => sum + s.visit_count, 0),
    }));

    return hourTotals
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .filter(h => h.total > 0);
  };

  const peakHours = getPeakHours();

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-primary" />
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">Mapa de Calor</h2>
          <p className="text-sm text-muted-foreground">Horários de pico - últimos 7 dias</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Peak Hours Summary */}
          {peakHours.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Picos:</span>
              {peakHours.map(({ hour, total }) => (
                <span
                  key={hour}
                  className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium"
                >
                  {hour.toString().padStart(2, "0")}:00 ({total} visitas)
                </span>
              ))}
            </div>
          )}

          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex mb-1">
                <div className="w-10" />
                {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                  <div
                    key={hour}
                    className="text-[10px] text-muted-foreground"
                    style={{ width: `${100 / 8}%` }}
                  >
                    {hour.toString().padStart(2, "0")}h
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {days.map((day, dayIndex) => (
                <div key={day.label + dayIndex} className="flex items-center gap-1 mb-1">
                  <div className="w-10 text-xs text-muted-foreground capitalize">
                    {day.label}
                  </div>
                  <div className="flex-1 flex gap-0.5">
                    {matrix[dayIndex].map((value, hourIndex) => (
                      <div
                        key={hourIndex}
                        className={`flex-1 h-5 rounded-sm transition-colors ${getIntensityColor(value)}`}
                        title={`${day.label} ${hourIndex.toString().padStart(2, "0")}:00 - ${value} visitas`}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="flex items-center justify-end gap-2 mt-3">
                <span className="text-[10px] text-muted-foreground">Menos</span>
                <div className="flex gap-0.5">
                  <div className="w-4 h-4 rounded-sm bg-secondary/30" />
                  <div className="w-4 h-4 rounded-sm bg-primary/20" />
                  <div className="w-4 h-4 rounded-sm bg-primary/40" />
                  <div className="w-4 h-4 rounded-sm bg-primary/60" />
                  <div className="w-4 h-4 rounded-sm bg-primary/90" />
                </div>
                <span className="text-[10px] text-muted-foreground">Mais</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
