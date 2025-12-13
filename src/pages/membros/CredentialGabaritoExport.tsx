import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getTemplate } from "@/services/CredentialService";
import CredentialRenderer from "@/components/credentials/CredentialRenderer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CredentialGabaritoExport() {
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [front, setFront] = useState<any>(null);
  const [back, setBack] = useState<any>(null);
  const [type, setType] = useState<'member'|'convention'|'student'>('member');
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ (async () => {
    if (!id) return;
    const { data: m } = await supabase.from('members').select('*, churches(id)').eq('id', id).maybeSingle();
    setMember(m);
    if (m?.churches?.id) {
      const all = await supabase.from('credential_templates').select('*').eq('church_id', m.churches.id).eq('type', type);
      const ff = (all.data||[]).find((t:any)=>t.side==='front');
      const bb = (all.data||[]).find((t:any)=>t.side==='back');
      setFront(ff||null);
      setBack(bb||null);
    }
  })(); },[id, type]);
  const exportPDF = async () => {
    if (!frontRef.current || !backRef.current) return;
    const fCanvas = await html2canvas(frontRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const bCanvas = await html2canvas(backRef.current, { scale: 2, useCORS: true, backgroundColor: null });
    const bleed = 0;
    const w = 90 + bleed * 2;
    const h = 60 + bleed * 2;
    const imgF = fCanvas.toDataURL('image/png');
    const imgB = bCanvas.toDataURL('image/png');
    const pdf = new jsPDF({ unit: 'mm', format: [w, h] });
    pdf.addImage(imgF, 'PNG', bleed, bleed, 90, 60);
    pdf.addPage([w, h], 'portrait');
    pdf.addImage(imgB, 'PNG', bleed, bleed, 90, 60);
    pdf.save(`gabarito-${member?.full_name || 'credencial'}.pdf`);
  };
  return (
    <div className="container mx-auto max-w-3xl py-6">
      <Card>
        <CardHeader className="flex items-center justify-between"><CardTitle>Gabarito de Credencial</CardTitle><Button onClick={exportPDF}>Exportar PDF</Button></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div ref={frontRef} style={{ width: 900/ (96/25.4), height: 600/ (96/25.4) }}>
                {front && member && (<CredentialRenderer template={front} memberId={member.id} type={type} />)}
              </div>
            </div>
            <div>
              <div ref={backRef} style={{ width: 900/ (96/25.4), height: 600/ (96/25.4) }}>
                {back && member && (<CredentialRenderer template={back} memberId={member.id} type={type} />)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

