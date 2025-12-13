import { supabase } from "@/integrations/supabase/client";

export async function getTemplate(churchId: string, type: 'member'|'convention'|'student') {
  const { data } = await supabase.from('credential_templates').select('*').eq('church_id', churchId).eq('type', type).limit(1);
  return (data && data[0]) || null;
}

export async function getFields(templateId: string) {
  const { data } = await supabase.from('credential_fields').select('*').eq('template_id', templateId).order('name');
  return data || [];
}

export async function resolveData(memberId: string, type: 'member'|'convention'|'student') {
  const { data: m } = await supabase.from('members').select('*, departments(name), churches(nome_fantasia), member_profiles(*), course_enrollments(course_classes(name))').eq('id', memberId).maybeSingle();
  const base: Record<string, any> = {
    'member.full_name': m?.full_name,
    'member.role': m?.role,
    'member.phone': m?.phone,
    'member.email': m?.email,
    'member.member_since': m?.member_since,
    'member.cred_valid_until': m?.cred_valid_until,
    'department.name': m?.departments?.name,
    'church.name': m?.churches?.nome_fantasia,
    'profile.photo_path': m?.member_profiles?.photo_path,
    'profile.theology_course': m?.member_profiles?.theology_course,
    'profile.theology_institution': m?.member_profiles?.theology_institution,
    'profile.state_convention': m?.member_profiles?.state_convention,
    'profile.general_convention': m?.member_profiles?.general_convention,
    'profile.nationality': m?.member_profiles?.nationality,
    'profile.naturality': m?.member_profiles?.naturality,
    'profile.rg': m?.member_profiles?.rg,
    'profile.cpf': m?.member_profiles?.cpf,
    'student.class_name': (m?.course_enrollments && m.course_enrollments[0]?.course_classes?.name) || '',
  };
  const { data: num } = await supabase.rpc('ensure_credential_number', { _member: memberId, _type: type });
  base['credential.number'] = Array.isArray(num) ? num[0] : num;
  base['credential.qr'] = `${window.location.origin}/validar-credencial?member=${memberId}&token=${btoa(memberId)}`;
  const { data: cn } = await supabase.from('credential_numbers').select('signature_url,signed_at').eq('member_id', memberId).eq('type', type).maybeSingle();
  base['credential.signature_url'] = cn?.signature_url || '';
  base['credential.signature_qr'] = cn?.signed_at ? `${window.location.origin}/validar-assinatura?member=${memberId}&type=${type}` : '';
  return base;
}

