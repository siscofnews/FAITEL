import { supabase } from "@/integrations/supabase/client";
import { ROLE_TEMPLATES, getTemplatesForLevel } from "@/config/permissionTemplates";

export async function seedGlobalProfiles() {
  const { data } = await supabase.from('role_global').select('name');
  const existing = new Set((data || []).map((r: any) => r.name));
  const toInsert = ROLE_TEMPLATES.filter(t => !existing.has(t.name)).map(t => ({
    name: t.name,
    description: `Perfil: ${t.name}`,
    level: t.level,
    permissions: t.permissions,
  }));
  if (toInsert.length > 0) {
    const { error } = await supabase.from('role_global').insert(toInsert);
    if (error) throw error;
  }
  return true;
}

export async function grantCreatorDefaultRoles(church_id: string, user_id: string, nivel: string) {
  const role_name = nivel === 'matriz' ? 'presidente_matriz' : 'pastor';
  const { error } = await supabase.from('role_assignments').upsert({
    user_id,
    scope: 'local',
    role_name,
    church_id,
  });
  if (error) throw error;
  return true;
}

export async function seedTemplatesForChurchLevel(nivel: 'matriz' | 'sede' | 'subsede' | 'congregacao' | 'celula') {
  await seedGlobalProfiles();
  return getTemplatesForLevel(nivel);
}

