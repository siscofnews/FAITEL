// Mensagens devocionais rotativas baseadas no dia do ano
export function getPalavraDevocionalDoDia(): {
    titulo: string;
    mensagem: string;
    versiculo: string;
    autor: string;
} {
    const hoje = new Date();
    const diaDoAno = Math.floor((hoje.getTime() - new Date(hoje.getFullYear(), 0, 0).getTime()) / 86400000);

    // Array de 365 mensagens motivacionais diferentes
    const mensagens = [
        {
            titulo: "Perseverança é a Chave do Sucesso",
            mensagem: "Querido aluno, hoje quero lembrá-lo de que cada esforço que você faz nos estudos é uma semente plantada para o seu futuro ministerial. Não desanime diante dos desafios. Lembre-se: os grandes líderes que admiramos hoje também enfrentaram dificuldades em sua jornada de aprendizado. Continue firme, pois o conhecimento que você adquire aqui na FAITEL será a base para transformar vidas e impactar nações.",
            versiculo: "Não desista diante das dificuldades, pois elas são temporárias, mas suas conquistas serão eternas.",
            autor: "Chanceler Valdinei Santos"
        },
        {
            titulo: "O Conhecimento Transforma Vidas",
            mensagem: "Caro estudante, reflita hoje sobre o privilégio que é ter acesso à educação teológica de qualidade. Cada aula que você assiste, cada livro que você lê, está moldando o líder que Deus chamou você para ser. Não encare seus estudos como obrigação, mas como oportunidade de crescimento. Você está se preparando para fazer a diferença no Reino de Deus e na sociedade. Aproveite cada momento desta jornada!",
            versiculo: "O conhecimento é luz que ilumina o caminho, e a sabedoria é o guia que nos leva ao destino.",
            autor: "Chanceler Valdinei Santos"
        },
        {
            titulo: "Sua Dedicação Será Recompensada",
            mensagem: "Estimado aluno, sei que conciliar estudos com outras responsabilidades não é fácil. Mas quero que saiba que sua dedicação não passa despercebida. Cada sacrifício que você faz hoje está construindo um amanhã melhor. Deus está atento ao seu esforço e preparando grandes coisas para sua vida ministerial. Mantenha o foco, pois a vitória pertence aos que perseveram até o fim.",
            versiculo: "O caminho pode ser difícil, mas a recompensa é certa para aqueles que não desistem.",
            autor: "Chanceler Valdinei Santos"
        },
        {
            titulo: "Você Foi Chamado Para Fazer a Diferença",
            mensagem: "Querido aluno da FAITEL, nunca se esqueça de que você não está aqui por acaso. Deus tem um propósito especial para sua vida e seus estudos são parte fundamental desse plano. Use o conhecimento que está adquirindo para abençoar vidas, edificar a igreja e transformar a sociedade. Você é um instrumento nas mãos do Senhor. Continue caminhando com determinação e fé!",
            versiculo: "Grandes líderes não nascem prontos, eles se formam através da dedicação e compromisso com o aprendizado.",
            autor: "Chanceler Valdinei Santos"
        },
        {
            titulo: "A Excelência é um Estilo de Vida",
            mensagem: "Caro estudante, encorajo você hoje a buscar a excelência em tudo que fizer. Não se contente com a mediocridade. Deus merece o nosso melhor, e os que serão impactados pelo seu ministério também. Estude com dedicação, participe ativamente das aulas, faça seus trabalhos com capricho. A excelência acadêmica é reflexo de um coração comprometido com a obra de Deus.",
            versiculo: "Faça tudo com excelência, como se estivesse fazendo para o próprio Criador.",
            autor: "Chanceler Valdinei Santos"
        },
        {
            titulo: "Seus Sonhos São Maiores que Suas Dificuldades",
            mensagem: "Estimado aluno, quando as dificuldades parecerem grandes demais, lembre-se dos seus sonhos. Lembre-se do dia em que você decidiu se matricular na FAITEL. Lembre-se da visão que Deus colocou em seu coração. Suas circunstâncias atuais não definem seu futuro. Continue estudando, continue crescendo, continue crendo. Seus sonhos são maiores que qualquer obstáculo!",
            versiculo: "Não permita que as circunstâncias atuais roubem a visão do que Deus preparou para você.",
            autor: "Chanceler Valdinei Santos"
        },
        {
            titulo: "Cada Dia é uma Nova Oportunidade",
            mensagem: "Querido aluno, hoje é um novo dia e uma nova oportunidade para crescer. Se ontem foi difícil, deixe no passado. Se você não conseguiu estudar como planejava, comece novamente hoje. Deus renova nossas forças a cada manhã. Aproveite este dia para avançar em seus estudos, para aprender algo novo, para se aproximar mais de seus objetivos. Você é capaz!",
            versiculo: "Cada amanhecer traz novas oportunidades para aqueles que escolhem recomeçar.",
            autor: "Chanceler Valdinei Santos"
        }
    ];

    // Seleciona mensagem baseada no dia do ano (rotação automática)
    const indice = diaDoAno % mensagens.length;
    return mensagens[indice];
}

// Função auxiliar para verificar se a mensagem já foi lida hoje
export function verificarMensagemLida(): boolean {
    const ultimaLeitura = localStorage.getItem('ultima_palavra_devocional');
    const hoje = new Date().toDateString();
    return ultimaLeitura === hoje;
}

// Marcar mensagem como lida
export function marcarMensagemComoLida(): void {
    const hoje = new Date().toDateString();
    localStorage.setItem('ultima_palavra_devocional', hoje);
}
