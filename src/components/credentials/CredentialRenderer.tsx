import { useEffect, useState } from "react";
import { getFields, resolveData } from "@/services/CredentialService";
import { QRCodeSVG } from "qrcode.react";

interface Props { template: any; memberId: string; type: 'member'|'convention'|'student' }

export default function CredentialRenderer({ template, memberId, type }: Props) {
  const [fields, setFields] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  useEffect(() => { (async () => { if (!template?.id) return; setFields(await getFields(template.id)); setValues(await resolveData(memberId, type)); })(); }, [template?.id, memberId, type]);
  return (
    <div style={{ position:'relative', width: '100%', height: '100%' }}>
      {template?.image_url && <img src={template.image_url} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />}
      {fields.map((f:any) => f.is_qr ? (
        values['credential.qr'] ? <div key={f.id} style={{ position:'absolute', left:f.x, top:f.y, width:f.w, height:f.h, display:'flex', alignItems:'center', justifyContent:'center' }}><QRCodeSVG value={values['credential.qr']} size={Math.min(f.w||120, f.h||120)} /></div> : null
      ) : f.is_image ? (
        values[f.source_key] ? <img key={f.id} src={values[f.source_key]} style={{ position:'absolute', left:f.x, top:f.y, width:f.w, height:f.h, borderRadius:4, objectFit:'cover' }} /> : null
      ) : (
        <div key={f.id} style={{ position:'absolute', left:f.x, top:f.y, width:f.w, height:f.h, fontSize:f.font_size || 12, fontFamily:f.font_family || 'sans-serif', color:f.color || '#000', fontWeight:f.bold ? 600 : 400, textAlign:(f.align as any) || 'left', overflow:'hidden', whiteSpace:'nowrap' }}>{values[f.source_key] || ''}</div>
      ))}
    </div>
  );
}

