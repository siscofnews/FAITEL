import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ImgItem = { id: string; url: string; title?: string };

export default function GraduationGallery() {
  const [images, setImages] = useState<ImgItem[]>([]);
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.storage.from('ead-content').list('gallery/graduation', { limit: 100 });
        if (!error && data && data.length) {
          const urls: ImgItem[] = data.filter(f=>f.name).map((f) => {
            const { data: pub } = supabase.storage.from('ead-content').getPublicUrl(`gallery/graduation/${f.name}`);
            return { id: f.id || f.name, url: pub.publicUrl } as ImgItem;
          });
          setImages(urls);
          return;
        }
      } catch {}
      try {
        const raw = localStorage.getItem('demo_grad_gallery') || '[]';
        const list: ImgItem[] = JSON.parse(raw);
        setImages(list);
      } catch { setImages([]); }
    })();
  }, []);

  const onAddClick = () => inputRef.current?.click();
  const onFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems: ImgItem[] = [];
    for (const file of files) {
      try {
        const path = `gallery/graduation/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('ead-content').upload(path, file, { upsert: true });
        if (!error) {
          const { data: pub } = supabase.storage.from('ead-content').getPublicUrl(path);
          newItems.push({ id: path, url: pub.publicUrl });
          continue;
        }
      } catch {}
      try {
        const base64 = await fileToBase64(file);
        newItems.push({ id: String(Date.now()) + '_' + file.name, url: base64 });
      } catch {}
    }
    const merged = [...images, ...newItems];
    setImages(merged);
    try { localStorage.setItem('demo_grad_gallery', JSON.stringify(merged)); } catch {}
    e.target.value = '';
  };

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return (
    <section id="galeria" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Galeria de Fotos de Formatura</h2>
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesChange} />
            <Button variant="outline" onClick={onAddClick}>Adicionar Fotos</Button>
          </div>
        </div>

        {images.length === 0 ? (
          <Card><CardContent className="p-6">Nenhuma foto carregada ainda.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <button key={img.id} className="bg-white h-40 md:h-48 flex items-center justify-center overflow-hidden rounded border" onClick={()=>setOpenUrl(img.url)}>
                <img src={img.url} alt="Formatura" className="max-h-full w-auto object-contain" />
              </button>
            ))}
          </div>
        )}

        <Dialog open={!!openUrl} onOpenChange={(v)=>{ if(!v) setOpenUrl(null); }}>
          <DialogContent className="max-w-5xl bg-white">
            {openUrl && (
              <div className="bg-white flex items-center justify-center">
                <img src={openUrl} alt="Formatura" className="max-h-[80vh] w-auto object-contain" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}

