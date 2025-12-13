import { supabase } from "@/integrations/supabase/client";

export async function sendWelcomeEmail(to: string, subject: string, body: string) {

  try {
    const { error } = await supabase.functions.invoke('send-welcome-email', { body: { to, subject, body } });
    if (error) throw error;
    return true;
  } catch {
    try {
      const queue = JSON.parse(localStorage.getItem('email_queue') || '[]');
      queue.push({ to, subject, body, ts: Date.now() });
      localStorage.setItem('email_queue', JSON.stringify(queue));
    } catch {}
    return false;
  }
}

