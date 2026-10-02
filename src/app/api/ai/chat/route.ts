import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// System prompt defining Rodrigo Matos: Real human senior consultant & zootechnical expert
const SYSTEM_PROMPT = `
Você é Rodrigo Matos, Consultor Técnico e Especialista Zootécnico oficial da BIRDPRO (www.birdpro.com.br).
Você é um profissional humano experiente, empático, conhecedor profundo de ornitofilia, passeriformes, reprodução de aves e de toda a plataforma BIRDPRO.

SUA FORMA DE FALAR E ATENDER (100% HUMANA E NATURAL):
1. Cumprimentos: Sempre retorne o comprimento no mesmo tom e período do dia:
   - Se o usuário disser "bom dia", responda com "Bom dia! Tudo bem com você? Como amanheceram as aves no seu criatório?", etc.
   - Se disser "boa tarde", responda com "Boa tarde! Tudo em ordem por aí? Como estão as coisas no criatório?", etc.
   - Se disser "boa noite", responda com "Boa noite! Tudo tranquilo? Em que posso te ajudar nesta noite?", etc.
   - Se disser "oi" ou "olá", cumprimente de volta de forma acolhedora e calorosa.
2. NUNCA soe como um robô. Não faça respostas engessadas ou listas padronizadas genéricas sem antes conversar com o criador.
3. Desenrole os assuntos com inteligência:
   - Entenda a raiz do problema que o criador está passando (ex: dificuldades na reprodução, fêmea que botou fora do ninho, anilha de tamanho errado, dúvidas de consanguinidade, dúvida na importação do PDF do IBAMA, etc.).
   - Dialogue, mostre conhecimento prático de criatório e dê a orientação zootécnica ou técnica necessária.
   - Após explicar e desenrolar a solução, indique com naturalidade o menu da plataforma BIRDPRO que facilita a vida dele (ex: "Para você não se perder nas datas, dá uma olhada no menu Calendário...", "Para gerar o certificado oficial desse filhote, você pode ir no menu Nova Genealogia...").
4. Se o usuário fizer uma pergunta rápida ou vaga, converse, responda o principal e faça uma pergunta engajadora para entender melhor o criatório dele (quantas matrizes ele cria, quais espécies, etc.).

CONHECIMENTO COMPLETO DO SISTEMA BIRDPRO:
- Pássaros & SISPASS: Importação automática de PDF do IBAMA/SISPASS e planilhas, leitura de anilhas, histórico genealógico.
- Nova Genealogia & Árvore: Pedigrees de 3, 4 e 5 gerações com cálculo de ancestrais, temas Dark Prestige e Clássico A4, impressão e PDF.
- QR Code: Autenticidade digital única por ave (www.birdpro.com.br/ave/[id]) para crachás de gaiola e laudos.
- Calendário & Agenda com Push: Lembretes de choco/eclosão, vacinação, anilhamento (4º a 7º dia), com alertas sonoros e push no celular.
- Anotações: Bloco de notas com faixas coloridas ou lembretes sincronizados na agenda.
- Simulador de Cruzamento: Projeção de árvore e consanguinidade filtrada por espécie.
- Planos: R$ 14,99/mês ou R$ 169,99/ano sem limites de aves.
`;

// Direct links matcher based on topic
function detectActionLink(userPrompt: string): { label: string; href: string } | undefined {
  const lower = userPrompt.toLowerCase();
  if (/^(oi|oie|olá|ola|e aí|eai|opa|salve|bom dia|boa tarde|boa noite|tudo bem|tudo bom|como vai)\b/i.test(lower) && lower.length < 25) {
    return undefined;
  }

  if (lower.includes('sispass') || lower.includes('ibama') || (lower.includes('importar') && (lower.includes('pdf') || lower.includes('relatório') || lower.includes('relatorio')))) {
    return { label: 'Ir para Módulo SISPASS', href: '/dashboard/sispass' };
  }
  if (lower.includes('árvore') || lower.includes('arvore') || lower.includes('genealog') || lower.includes('pedigree') || lower.includes('certificado')) {
    return { label: 'Ir para Nova Genealogia', href: '/dashboard/configuracoes/nova-genealogia' };
  }
  if (lower.includes('calendário') || lower.includes('calendario') || lower.includes('agenda') || lower.includes('lembrete') || lower.includes('push')) {
    return { label: 'Abrir Calendário & Agenda', href: '/dashboard/calendario' };
  }
  if (lower.includes('anotação') || lower.includes('anotacao') || lower.includes('bloco de notas') || lower.includes('post-it') || lower.includes('postit')) {
    return { label: 'Abrir Bloco de Anotações', href: '/dashboard/anotacao' };
  }
  if (lower.includes('simulador') || lower.includes('cruzamento') || lower.includes('consanguin')) {
    return { label: 'Abrir Simulador de Árvore', href: '/dashboard/simulador-arvore' };
  }
  if (lower.includes('plano') || lower.includes('assinatura') || lower.includes('mensal') || lower.includes('anual') || lower.includes('preço') || lower.includes('preco')) {
    return { label: 'Gerenciar Assinatura', href: '/dashboard/assinatura' };
  }
  if (lower.includes('pássaro') || lower.includes('passaro') || lower.includes('plantel') || lower.includes('minhas aves')) {
    return { label: 'Ver Plantel de Aves', href: '/dashboard/aves' };
  }
  if (lower.includes('financeiro') || lower.includes('contas a pagar') || lower.includes('contas a receber')) {
    return { label: 'Painel Financeiro', href: '/dashboard/financeiro/contas-pagar' };
  }
  return undefined;
}

// Deeply natural conversational response engine for Rodrigo Matos
function generateSmartConversationalResponse(userMessage: string, history: { role: string; content: string }[], userName?: string): string {
  const msg = userMessage.trim();
  const lower = msg.toLowerCase();
  const firstName = userName ? userName.split(' ')[0] : 'amigo(a)';

  // 1. Time-specific greetings (Bom dia, Boa tarde, Boa noite, Oi, etc.)
  if (/\b(bom dia)\b/i.test(lower)) {
    return `Bom dia, ${firstName}! Tudo bem com você? ☀️\n\nComo amanheceram as coisas no seu criatório hoje? Estou por aqui à sua disposição para te auxiliar em qualquer dúvida sobre o manejo das aves ou no uso do sistema BIRDPRO. Em que posso te ajudar nesta manhã?`;
  }
  if (/\b(boa tarde)\b/i.test(lower)) {
    return `Boa tarde, ${firstName}! Tudo em ordem por aí? 🌤️\n\nComo estão os trabalhos no seu criatório hoje? Fique à vontade para me falar o que você precisa verificar ou organizar agora à tarde!`;
  }
  if (/\b(boa noite)\b/i.test(lower)) {
    return `Boa noite, ${firstName}! Tudo tranquilo com você e com o plantel? 🌙\n\nEstou por aqui caso precise tirar alguma dúvida rápida, lançar anotações do dia ou programar os alertas do criatório. Me conta em que posso ser útil!`;
  }
  if (/^(oi|oie|olá|ola|opa|salve|e aí|eai|tudo bem|tudo bom|como vai)\b/i.test(lower)) {
    return `Olá, ${firstName}! Tudo ótimo por aqui, e com você e suas aves? 🦜\n\nSou o Rodrigo Matos, consultor aqui da BIRDPRO. Me conta: o que você gostaria de ver ou resolver hoje no seu criatório?`;
  }

  // 2. Handling SISPASS / IBAMA questions and problems
  if (lower.includes('sispass') || lower.includes('ibama') || (lower.includes('importar') && (lower.includes('plantel') || lower.includes('pdf') || lower.includes('planilha')))) {
    return `Com certeza, ${firstName}! A importação do SISPASS pelo BIRDPRO é uma das ferramentas mais práticas para poupar seu tempo.\n\nVocê só precisa pegar o **PDF do Relatório Geral de Plantel** emitido diretamente no site do SISPASS/IBAMA (ou uma planilha Excel caso prefira) e fazer o upload aqui no sistema.\n\nO BIRDPRO faz a leitura automática de todas as anilhas, nomes científicos das espécies, sexo e datas de nascimento, cadastrando cada pássaro no seu plantel em poucos segundos sem você ter que digitar um por um.\n\nPara fazer isso agora, basta acessar o menu **"Pássaro > SISPASS"** na barra lateral e clicar em **"Importar Sispass"**. Se tiver qualquer dificuldade com o arquivo do IBAMA, me avise que te oriento!`;
  }

  // 3. Handling Pedigrees, Árvore Genealógica and QR Codes
  if (lower.includes('árvore') || lower.includes('arvore') || lower.includes('genealog') || lower.includes('pedigree') || lower.includes('certificado')) {
    return `Excelente questão, ${firstName}! A emissão da árvore genealógica e dos certificados no BIRDPRO valoriza muito as aves perante os compradores.\n\nO sistema permite gerar árvores de **3, 4 e até 5 gerações completas**, puxando automaticamente os pais, avós, bisavós e trisavós cadastrados no seu plantel.\n\nAlém disso, o certificado sai com o **QR Code de autenticidade**, permitindo que qualquer pessoa aponte o celular e veja a página pública oficial da ave com todas as informações e dados do seu criatório.\n\nVocê pode escolher entre os temas visuais **Dark Prestige** (com visual sofisticado) ou o **Clássico A4** (perfeito para laudos impressos). Para testar ou imprimir, é só ir no menu **"Configurações > Nova Genealogia"**. Qual espécie você está querendo certificar?`;
  }

  // 4. Handling QR Code questions
  if (lower.includes('qr') || lower.includes('qrcode') || lower.includes('laudo') || lower.includes('crachá') || lower.includes('cracha')) {
    return `O QR Code é gerado de forma 100% automática e exclusiva para cada ave cadastrada no BIRDPRO, ${firstName}.\n\nAo escanear a etiqueta da gaiola ou o certificado de pedigree com a câmera de qualquer celular, ele abre a página de autenticação oficial (\`birdpro.com.br/ave/ID\`) com foto, histórico de parentesco e dados do criatório.\n\nIsso passa uma segurança enorme para quem adquire seus filhotes e comprova a procedência genética. Você pode emitir esses crachás e etiquetas direto no menu de cada ave ou na seção de Genealogia!`;
  }

  // 5. Handling Incubation (Choco), Egg problems, Nesting and Ringing
  if (lower.includes('choco') || lower.includes('ovo') || lower.includes('eclos') || lower.includes('incub') || lower.includes('ninho') || lower.includes('anilha') || lower.includes('anilhamento') || lower.includes('filhote')) {
    return `Essa é uma das fases mais importantes e delicadas do criatório, ${firstName}!\n\nNo manejo de passeriformes (como Curió, Bicudo, Trinca-Ferro, Coleiro e Canário):\n- **Tempo de Choco**: A eclosão ocorre geralmente entre o **12º e 14º dia** após a fêmea deitar firme no último ovo. É fundamental manter o ambiente tranquilo e com umidade controlada para facilitar a quebra da casca.\n- **Anilhamento**: O momento ideal costuma ser entre o **4º e o 7º dia de vida**, variando com o porte do filhote e o diâmetro da anilha oficial.\n\n💡 **Dica de manejo no BIRDPRO**: Para não perder nenhuma data, você pode registrar a postura no menu **Calendário**. O sistema calcula a previsão de nascimento e dispara um alerta push no seu celular no dia exato de conferir o ninho e anilhar!`;
  }

  // 6. Handling Calendar, Push Notifications and Appointments
  if (lower.includes('calend') || lower.includes('agenda') || lower.includes('push') || lower.includes('notifica') || lower.includes('alerta') || lower.includes('lembrete')) {
    return `O nosso **Calendário** foi pensado exatamente para você não esquecer nenhum compromisso do criatório, ${firstName}.\n\nNele você pode:\n1. Agendar previsões de nascimento, anilhamentos, vacinações, vermifugações, higienização de gaiolas ou inscrições em torneios.\n2. Ativar a opção **"Alerta via Push Notificação"** e definir quanto tempo antes quer ser avisado (15 min, 30 min, 1h ou 1 dia antes).\n3. O sistema emite um som e uma notificação pop-up na tela do seu computador ou celular no horário exato.\n\nVocê pode acessar agora pelo menu **"Calendário"** na barra lateral. Quer programar algum alerta específico hoje?`;
  }

  // 7. Handling Anotações / Bloco de Notas
  if (lower.includes('anota') || lower.includes('bloco') || lower.includes('nota')) {
    return `O módulo de **Anotações** é super prático, ${firstName}! Ele funciona em dois modos:\n\n- 📌 **Apenas Bloco de Notas**: Para você anotar recados rápidos do dia a dia estilo post-it digital, organizando por cores de prioridade (urgente, atenção, normal, ideias).\n- 📅 **Lembrete na Agenda**: Ao marcar essa caixinha, a anotação é vinculada a uma data e horário e vai direto para o seu **Calendário**, disparando alertas.\n\nFica tudo salvo na nuvem para você consultar a qualquer momento no menu **"Anotações"**!`;
  }

  // 8. Handling Crossings / Genetics / Inbreeding
  if (lower.includes('simula') || lower.includes('cruza') || lower.includes('genet') || lower.includes('consang') || lower.includes('muta')) {
    return `Fazer o pareamento correto é o segredo de um criatório campeão, ${firstName}!\n\nNo menu **"Simulador de Árvore"**, o sistema primeiro filtra apenas as aves da mesma espécie. Depois, quando você escolhe o Macho e a Fêmea, ele projeta a árvore genealógica dos futuros filhotes e calcula o índice de consanguinidade.\n\nIsso evita acasalamentos com alto parentesco que poderiam gerar filhotes fracos ou com defeitos, permitindo planejar a temporada com total segurança genética!`;
  }

  // 9. Handling Plans & Pricing
  if (lower.includes('plano') || lower.includes('preço') || lower.includes('preco') || lower.includes('valor') || lower.includes('mensal') || lower.includes('anual') || lower.includes('pagar') || lower.includes('assinatura') || lower.includes('grátis') || lower.includes('gratis') || lower.includes('teste')) {
    return `Nossos planos foram desenhados para serem simples, acessíveis e completos, ${firstName}:\n\n- 💳 **Plano Mensal**: **R$ 14,99 por mês**\n- 🏆 **Plano Anual**: **R$ 169,99 por ano** (com desconto anual garantido)\n\nNão trabalhamos com períodos de teste grátis: a liberação é imediata na assinatura e você conta com acesso irrestrito a 100% dos recursos da plataforma (aves e anilhas ilimitadas, SISPASS, pedigrees com QR Code, calendário push e suporte). Você pode assinar ou gerenciar no menu **Assinatura**!`;
  }

  // 10. Natural Conversational Problem-Solving Fallback
  return `Entendi perfeitamente o seu ponto, ${firstName}!\n\nNo manejo do dia a dia e na gestão do plantel, cada detalhe faz diferença. No BIRDPRO, nós estruturamos ferramentas específicas para resolver isso com tranquilidade (desde os módulos de SISPASS e Genealogia até a Agenda com alertas push e controle financeiro).\n\nMe conta um pouco mais sobre como você costuma fazer essa gestão hoje no seu criatório, para que eu possa te indicar o melhor caminho aqui na plataforma!`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], userName, customApiKey, learnedInsights = [] } = body;

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage?.content || '';

    if (!userPrompt.trim()) {
      return NextResponse.json(
        { error: 'Mensagem vazia' },
        { status: 400 }
      );
    }

    const geminiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let replyText = '';

    const knowledgeContext = Array.isArray(learnedInsights) && learnedInsights.length > 0
      ? `\n\nMEMÓRIA DE APRENDIZADO CONTÍNUO (Casos e dúvidas já resolvidos com outros criadores):\n` + 
        learnedInsights.slice(-10).map((ins: any) => `- [${ins.topic}]: ${ins.insightSummary}`).join('\n')
      : '';

    const effectiveSystemPrompt = SYSTEM_PROMPT + 
      (userName ? `\nO nome do criador conectado é: ${userName}. Dirija-se a ele pelo primeiro nome de forma humana, calorosa e profissional.` : '') +
      knowledgeContext;

    // 1. Try Google Gemini API if key is present
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: effectiveSystemPrompt
        });

        const formattedHistory = messages.slice(0, -1).map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const chat = model.startChat({
          history: formattedHistory
        });

        const result = await chat.sendMessage(userPrompt);
        replyText = result.response.text();
      } catch (geminiError: any) {
        console.warn('Gemini API attempt error, falling back to smart engine:', geminiError?.message);
      }
    }

    // 2. Try OpenAI if key is present and Gemini wasn't used
    if (!replyText && openaiKey) {
      try {
        const openai = new OpenAI({ apiKey: openaiKey });
        const systemMsg = {
          role: 'system' as const,
          content: effectiveSystemPrompt
        };

        const chatMessages = [
          systemMsg,
          ...messages.map((m: any) => ({
            role: (m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: m.content
          }))
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: chatMessages,
          temperature: 0.75,
        });

        replyText = completion.choices[0]?.message?.content || '';
      } catch (openaiError: any) {
        console.warn('OpenAI API attempt error, falling back to smart engine:', openaiError?.message);
      }
    }

    // 3. High quality natural conversational engine fallback for Rodrigo Matos
    if (!replyText) {
      replyText = generateSmartConversationalResponse(userPrompt, messages, userName);
    }

    // Detect action link based on conversation topic
    const actionLink = detectActionLink(userPrompt);

    // Determine if human ticket escalation is truly needed
    const lowerPrompt = userPrompt.toLowerCase();
    const needsTicket = (
      lowerPrompt.includes('abrir chamado') ||
      lowerPrompt.includes('falar com atendente') ||
      lowerPrompt.includes('falar com humano') ||
      lowerPrompt.includes('suporte humano') ||
      lowerPrompt.includes('erro 500') ||
      lowerPrompt.includes('estorno') ||
      lowerPrompt.includes('bug grave')
    );

    return NextResponse.json({
      reply: replyText,
      actionLink,
      suggestTicket: needsTicket,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

  } catch (error: any) {
    console.error('Consultant Route Error:', error);
    return NextResponse.json(
      {
        reply: 'Olá! Tive uma pequena instabilidade momentânea na conexão, mas já estou aqui com você. Como posso te auxiliar com o criatório hoje?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      { status: 200 }
    );
  }
}
