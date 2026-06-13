export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  const { prompt, tipo } = req.body;
  if (!prompt || !tipo) return res.status(400).json({ error: 'Campos obrigatorios' });

  // Avaliação local inteligente sem precisar de API externa
  const p = prompt.toLowerCase();

  // Detecta elementos do prompt
  const temPapel = /você é|voce é|aja como|atue como|você deve|especialista|professor|consultor|escritor|analista|coach|médico|advogado|engenheiro/i.test(prompt);
  const temTarefa = /crie|escreva|liste|analise|compare|explique|resuma|reescreva|faça|gere|desenvolva|elabore|produza|monte|construa/i.test(prompt);
  const temContexto = /contexto|público|audiência|objetivo|situação|empresa|produto|cliente|mercado|para quem|meu negócio|minha empresa/i.test(prompt);
  const temFormato = /formato|lista|tabela|tópicos|parágrafos|palavras|linhas|bullet|estrutura|seções|máximo|mínimo|tamanho/i.test(prompt);
  const temRestricoes = /não|sem|evite|evitar|nunca|exclua|apenas|somente|limite|restrição|proibido/i.test(prompt);
  const temExemplo = /exemplo|por exemplo|como por exemplo|ex:|e\.g\./i.test(prompt);
  const temCoT = /passo a passo|pense antes|raciocine|analise antes|etapas|passo 1|passo 2/i.test(prompt);
  const temFewShot = /exemplo 1|exemplo 2|ex 1|ex 2|caso 1|caso 2|\→|\=\>/i.test(prompt);

  const tamanho = prompt.trim().length;
  const palavras = prompt.trim().split(/\s+/).length;

  // Calcular pontuações por elemento
  let papel = temPapel ? Math.min(18 + Math.floor(Math.random()*3), 20) : Math.floor(Math.random()*8 + 3);
  let tarefa = temTarefa ? Math.min(16 + Math.floor(Math.random()*4), 20) : Math.floor(Math.random()*8 + 4);
  let contexto = temContexto ? Math.min(14 + Math.floor(Math.random()*5), 20) : Math.floor(Math.random()*9 + 3);
  let formato = temFormato ? Math.min(15 + Math.floor(Math.random()*5), 20) : Math.floor(Math.random()*8 + 2);
  let restricoes = temRestricoes ? Math.min(14 + Math.floor(Math.random()*5), 20) : Math.floor(Math.random()*8 + 2);

  // Bônus por tamanho e complexidade
  if (palavras > 50) { contexto = Math.min(contexto + 2, 20); }
  if (palavras > 100) { formato = Math.min(formato + 2, 20); }
  if (temExemplo) { contexto = Math.min(contexto + 2, 20); }
  if (temCoT) { tarefa = Math.min(tarefa + 3, 20); }
  if (temFewShot) { tarefa = Math.min(tarefa + 3, 20); restricoes = Math.min(restricoes + 2, 20); }

  let score = papel + tarefa + contexto + formato + restricoes;
  score = Math.min(Math.max(score, 20), 98);

  // Nível
  let nivel = score >= 85 ? 'Excelente' : score >= 70 ? 'Muito Bom' : score >= 55 ? 'Bom' : score >= 40 ? 'Regular' : 'Iniciante';

  // XP baseado na pontuação
  let xp = Math.floor(score / 3) + 10;

  // Feedback dinâmico
  let pontosBons = [];
  let pontosmelhorar = [];

  if (temPapel) pontosBons.push('definiu bem o papel da IA');
  else pontosmelhorar.push('adicione um papel claro (ex: "Você é um especialista em...")');

  if (temTarefa) pontosBons.push('usou um verbo de ação claro');
  else pontosmelhorar.push('use verbos de ação específicos como criar, analisar, listar, explicar');

  if (temContexto) pontosBons.push('forneceu contexto útil');
  else pontosmelhorar.push('adicione contexto: para quem é, qual o objetivo, qual a situação');

  if (temFormato) pontosBons.push('especificou o formato da resposta');
  else pontosmelhorar.push('especifique o formato: lista, tabela, parágrafos, tamanho máximo');

  if (temRestricoes) pontosBons.push('incluiu restrições do que não quer');
  else pontosmelhorar.push('adicione restrições: o que a IA não deve fazer ou incluir');

  if (palavras < 15) pontosmelhorar.push('o prompt está muito curto — seja mais específico e detalhado');
  if (temExemplo) pontosBons.push('incluiu exemplos (ótimo!)');
  if (temCoT) pontosBons.push('ativou raciocínio passo a passo');
  if (temFewShot) pontosBons.push('usou técnica few-shot com exemplos');

  const bom = pontosBons.length > 0
    ? 'Seu prompt ' + pontosBons.slice(0, 3).join(', ') + '. ' + (palavras > 30 ? 'Boa extensão e detalhamento.' : '')
    : 'Seu prompt tem uma base inicial. Continue desenvolvendo os elementos essenciais.';

  const melhorar = pontosmelhorar.length > 0
    ? 'Para melhorar: ' + pontosmelhorar.slice(0, 3).join('; ') + '.'
    : 'Excelente prompt! Tente adicionar exemplos concretos para resultados ainda melhores.';

  const dicas = [
    'Lembre-se da fórmula: Papel + Tarefa + Contexto + Formato + Restrições.',
    'Quanto mais específico o contexto, melhor a resposta da IA.',
    'Tente usar a técnica Chain of Thought: peça que a IA "pense passo a passo".',
    'Adicione exemplos de input e output esperado para resultados mais precisos.',
    'Especifique sempre o público-alvo do conteúdo que está pedindo.',
    'Use restrições para eliminar o que você não quer na resposta.'
  ];
  const dica = dicas[Math.floor(Math.random() * dicas.length)];

  const dims = tipo === 'final'
    ? { Clareza: Math.min(papel, 20), Especificidade: Math.min(tarefa, 20), Estrutura: Math.min(contexto, 20), Criatividade: Math.min(formato, 20), Impacto: Math.min(restricoes, 20) }
    : tipo === 'imagem'
    ? { Sujeito: papel, Ambiente: tarefa, Estilo: contexto, Qualidade: formato, Cultural: restricoes }
    : tipo === 'video'
    ? { Camera: papel, Movimento: tarefa, Produto: contexto, Ambiente: formato, Estilo: restricoes }
    : tipo === 'codigo'
    ? { Especificacao: papel, IO: tarefa, Exemplos: contexto, Requisitos: formato }
    : { Papel: papel, Tarefa: tarefa, Contexto: contexto, Formato: formato, Restricoes: restricoes };

  return res.status(200).json({ score, nivel, dims, bom, melhorar, dica, xp });
}
