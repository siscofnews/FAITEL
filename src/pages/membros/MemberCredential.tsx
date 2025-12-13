import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import CredentialRenderer from "@/components/credentials/CredentialRenderer";
import { getTemplate } from "@/services/CredentialService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function MemberCredential() {
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const token = id ? btoa(id) : "";
  const ref = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<'member'|'convention'|'student'>('member');
  const [signUploading, setSignUploading] = useState(false);
  useEffect(() => { (async () => {
    if (!id) return;
    const { data: m } = await supabase.from("members").select("*, departments(name), churches(id,nome_fantasia)").eq("id", id).maybeSingle();
    setMember(m);
    if (m?.churches?.id) setTemplate(await getTemplate(m.churches.id, type));
  })(); }, [id]);
  const url = id ? `${window.location.origin}/validar-credencial?member=${id}&token=${token}` : "";
  const downloadPDF = async () => {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { scale: 2, useCORS: true, backgroundColor: null });
    const imgData = canvas.toDataURL('image/png');
    const bleed = 0;
    const w = 90 + bleed * 2;
    const h = 60 + bleed * 2;
    const pdf = new jsPDF({ unit: 'mm', format: [w, h] });
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.2);
    pdf.addImage(imgData, 'PNG', bleed, bleed, 90, 60);
    pdf.save(`credencial-${member?.full_name || 'membro'}.pdf`);
  };
  const uploadSignature = async (file: File | null) => {
    if (!file || !id) return;
    setSignUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const name = `${id}/signature-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('digital-signatures').upload(name, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('digital-signatures').getPublicUrl(name);
      await supabase.from('credential_numbers').update({ signature_url: publicUrl, signed_at: new Date().toISOString() }).eq('member_id', id).eq('type', type);
      const { data: m } = await supabase.from('members').select('churches(id)').eq('id', id).maybeSingle();
      if (m?.churches?.id) setTemplate(await getTemplate(m.churches.id, type));
    } finally { setSignUploading(false); }
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <Card className="w-[360px]">
        <CardContent className="p-4 space-y-3">
          {member && (
            <div className="space-y-2">
              <div ref={ref}>
                {template ? (
                  <CredentialRenderer template={template} memberId={member.id} type={type} />
                ) : (
                  <div className="flex items-center justify-center"><QRCodeSVG value={url} size={140} /></div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">ID: {member.id}</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={downloadPDF}>Baixar PDF</Button>
                  <Link to={`/validar-credencial?member=${member.id}&token=${token}`}><Button size="sm">Validar</Button></Link>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <input type="file" accept="image/*" onChange={(e)=>uploadSignature(e.target.files?.[0]||null)} />
                <Button size="sm" disabled={signUploading}>Upload assinatura</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

