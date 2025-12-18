import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CourseBook = { id:string; title:string; subtitle?:string|null; description?:string|null; cover_url?:string|null; 
  author?:string|null; year?:string|number|null };

const demoBooks: CourseBook[] = [
  { id: "demo-cristologia", title: "Cristologia", subtitle: "Curso de Teologia", description: "Manual de estudo autodidático – Ciclo II", 
    author: "FAITEL", year: 2025,
    cover_url: "https://images.ctfassets.net/zzd6ium20qrx/placeholder_cristologia/0c1b2b0f5a9b4c3e8f/cover.jpg" },
  { id: "demo-teologia-mod1", title: "Teologia – Módulo 1", subtitle: "Educação Cristã, Hamartiologia, Missiologia, Pneumatologia, Escatologia", 
    author: "Pr. Valdinei da Conceição Santos", year: 2025,
    cover_url: "https://images.ctfassets.net/zzd6ium20qrx/placeholder_teologia_mod1/0c1b2b0f5a9b4c3e8f/cover.jpg" }
];

export function CourseBooksSection() {
  const [books, setBooks] = useState<CourseBook[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ (async()=>{
    try {
      const { data, error } = await supabase.from('course_books' as any).select('*').order('title');
      if (!error && data && data.length) { setBooks(data as any); }
      else {
        try { const ls = JSON.parse(localStorage.getItem('demo_course_books')||'[]'); if (ls.length) setBooks(ls); else setBooks(demoBooks); } catch { setBooks(demoBooks); }
      }
    } finally { setLoading(false); }
  })(); },[]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-8 w-8 text-gold" />
            <h2 className="text-3xl md:text-4xl font-bold">Livros do Curso Teológico</h2>
          </div>
          <p className="text-muted-foreground">Capas e informações dos módulos e manuais da FAITEL</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i=> (<Card key={i}><CardContent className="h-64 animate-pulse" /></Card>))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((b)=> (
              <Card key={b.id} className="overflow-hidden hover:shadow-xl transition-all">
                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem capa</div>
                  )}
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2">{b.subtitle||'Módulo'}</Badge>
                  <h3 className="font-bold text-lg">{b.title}</h3>
                  {b.author && (<p className="text-sm text-gold">{b.author}</p>)}
                  {b.description && (<p className="text-xs text-muted-foreground line-clamp-2">{b.description}</p>)}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={()=>{
            try { localStorage.setItem('demo_course_books', JSON.stringify(demoBooks)); alert('Demo de livros carregada'); } catch {}
          }}>Carregar Demo de Livros</Button>
        </div>
      </div>
    </section>
  );
}

