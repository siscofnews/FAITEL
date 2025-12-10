import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute per IP

function getClientIP(req: Request): string {
  // Try various headers for the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback to a generic identifier
  return 'unknown';
}

function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  // Clean up old entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  // Increment counter
  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetIn: record.resetTime - now };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check rate limit
  const clientIP = getClientIP(req);
  const { allowed, remaining, resetIn } = checkRateLimit(clientIP);

  const rateLimitHeaders = {
    ...corsHeaders,
    'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetIn / 1000).toString(),
  };

  if (!allowed) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(JSON.stringify({ 
      error: 'Rate limit exceeded. Please try again later.',
      message: 'O Senhor é bom para os que esperam nele, para a alma que o busca. - Lamentações 3:25',
      retryAfter: Math.ceil(resetIn / 1000)
    }), {
      status: 429,
      headers: { ...rateLimitHeaders, 'Content-Type': 'application/json', 'Retry-After': Math.ceil(resetIn / 1000).toString() },
    });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const today = new Date();
    const dayOfWeek = today.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

    const systemPrompt = `Você é um pastor evangélico sábio e inspirador. Sua missão é criar uma mensagem motivacional diária para cristãos.

Instruções:
- Crie uma frase motivacional cristã poderosa e inspiradora
- Baseie-se em princípios bíblicos (pode citar versículos)
- A mensagem deve ser curta (máximo 3 frases)
- Use linguagem acolhedora e encorajadora
- Varie os temas: fé, esperança, amor, perseverança, graça, propósito
- Considere que hoje é ${dayOfWeek}, ${dateStr}

Responda APENAS com a mensagem motivacional, sem introduções ou explicações.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Gere a mensagem motivacional do dia para os fiéis.' }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log('AI Gateway rate limit exceeded');
        return new Response(JSON.stringify({ 
          error: 'Service temporarily unavailable. Please try again later.',
          message: 'Espere no Senhor, seja forte e anime-se; espere no Senhor. - Salmos 27:14'
        }), {
          status: 429,
          headers: { ...rateLimitHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.log('AI Gateway payment required');
        return new Response(JSON.stringify({ 
          error: 'Service unavailable. Please contact support.',
          message: 'O Senhor é o meu pastor; nada me faltará. - Salmos 23:1'
        }), {
          status: 503,
          headers: { ...rateLimitHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || 'A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos. - Hebreus 11:1';

    console.log(`Generated motivational message for IP ${clientIP}:`, message);

    return new Response(JSON.stringify({ 
      message,
      date: dateStr,
      dayOfWeek
    }), {
      headers: { ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error generating motivational message:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      message: 'Confie no Senhor de todo o seu coração e não se apoie em seu próprio entendimento. Em todos os seus caminhos, reconheça-o, e ele endireitará as suas veredas. - Provérbios 3:5-6'
    }), {
      status: 500,
      headers: { ...rateLimitHeaders, 'Content-Type': 'application/json' },
    });
  }
});
