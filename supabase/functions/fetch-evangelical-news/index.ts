import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated news data - In production, these would come from RSS feeds and APIs
const evangelicalNewsData = {
  mundial: [
    {
      id: 'w1',
      title: 'Conferência Global de Missões reúne líderes de 150 países',
      excerpt: 'O maior encontro missionário do ano discute estratégias para alcançar povos não alcançados.',
      image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop',
      category: 'Missões Mundiais',
      source: 'Gospel Prime',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 'w2',
      title: 'Igreja perseguida na China continua crescendo apesar das restrições',
      excerpt: 'Relatório aponta crescimento de 30% no número de convertidos em regiões de maior perseguição.',
      image: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=600&h=400&fit=crop',
      category: 'Perseguição',
      source: 'Portas Abertas',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 'w3',
      title: 'Avivamento na África: milhões se convertem em campanhas evangelísticas',
      excerpt: 'Movimento do Espírito Santo transforma nações africanas com crescimento exponencial da igreja.',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
      category: 'Avivamento',
      source: 'CPAD News',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 'w4',
      title: 'Tradução da Bíblia alcança nova língua indígena na Amazônia',
      excerpt: 'Projeto de tradução conclui versão completa do Novo Testamento para povo isolado.',
      image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=400&fit=crop',
      category: 'Tradução Bíblica',
      source: 'Wycliffe Brasil',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    }
  ],
  cemadeb: [
    {
      id: 'c1',
      title: 'CEMADEB anuncia nova gestão para quadriênio 2025-2029',
      excerpt: 'Convenção elege nova diretoria com foco em evangelização e formação ministerial.',
      image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop',
      category: 'CEMADEB',
      source: 'CEMADEB Oficial',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 'c2',
      title: 'Congresso de Missões da CEMADEB bate recorde de participação',
      excerpt: 'Mais de 10 mil pessoas participaram do evento que arrecadou fundos para missionários.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=400&fit=crop',
      category: 'CEMADEB',
      source: 'CEMADEB Oficial',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 'c3',
      title: 'Secretaria de Missões lança campanha "Brasil para Cristo"',
      excerpt: 'Nova iniciativa visa plantar 1000 novas igrejas em cidades sem presença evangélica.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      category: 'Missões',
      source: 'CEMADEB Oficial',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    }
  ],
  aguai: [
    {
      id: 'a1',
      title: 'Igreja Assembleia de Deus em Aguaí celebra 50 anos de fundação',
      excerpt: 'Comunidade realizará programação especial durante todo o mês em comemoração ao jubileu.',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
      category: 'Aguaí - SP',
      source: 'AD Aguaí',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 'a2',
      title: 'Campanha evangelística mobiliza igrejas de Aguaí',
      excerpt: 'Denominações se unem em grande cruzada no centro da cidade com programação para todas as idades.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
      category: 'Aguaí - SP',
      source: 'Portal Gospel Aguaí',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 'a3',
      title: 'Projeto social de igreja beneficia famílias carentes em Aguaí',
      excerpt: 'Ação distribui cestas básicas e roupas para mais de 200 famílias da região.',
      image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop',
      category: 'Aguaí - SP',
      source: 'Igreja Batista Aguaí',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    }
  ],
  secretariaMissoes: [
    {
      id: 's1',
      title: 'Missionários brasileiros expandem trabalho em países árabes',
      excerpt: 'Secretaria de Missões envia nova equipe para região do Oriente Médio.',
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop',
      category: 'Missões Transculturais',
      source: 'SENAMI',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 's2',
      title: 'Conferência de Missões capacita novos obreiros para o campo',
      excerpt: 'Evento formou mais de 500 missionários para atuação em diversas frentes ministeriais.',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop',
      category: 'Capacitação',
      source: 'COMIMEB',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    },
    {
      id: 's3',
      title: 'Relatório anual aponta crescimento de 25% no envio de missionários',
      excerpt: 'Brasil se consolida como uma das principais nações enviadoras de missionários no mundo.',
      image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&h=400&fit=crop',
      category: 'Estatísticas',
      source: 'AMTB',
      date: new Date().toLocaleDateString('pt-BR'),
      url: '#'
    }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category } = await req.json().catch(() => ({ category: 'all' }));

    console.log('Fetching evangelical news for category:', category);

    let news;
    switch (category) {
      case 'mundial':
        news = evangelicalNewsData.mundial;
        break;
      case 'cemadeb':
        news = evangelicalNewsData.cemadeb;
        break;
      case 'aguai':
        news = evangelicalNewsData.aguai;
        break;
      case 'missoes':
        news = evangelicalNewsData.secretariaMissoes;
        break;
      default:
        news = {
          mundial: evangelicalNewsData.mundial,
          cemadeb: evangelicalNewsData.cemadeb,
          aguai: evangelicalNewsData.aguai,
          secretariaMissoes: evangelicalNewsData.secretariaMissoes
        };
    }

    return new Response(JSON.stringify({ 
      success: true,
      news,
      updatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
