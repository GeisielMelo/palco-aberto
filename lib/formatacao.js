const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

function formatarData(data) {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function partesData(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return {
    dia: String(dia).padStart(2, '0'),
    mes: MESES[mes - 1],
    ano,
    diaSemana: DIAS_SEMANA[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()]
  };
}

function nomeExibicao(participante) {
  return participante.nome_artistico || participante.nome;
}

function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  const primeira = partes[0].charAt(0);
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return (primeira + ultima).toUpperCase();
}

function ehLink(valor) {
  return /^https?:\/\//i.test(valor);
}

function linkInstagram(valor) {
  if (!valor) return null;
  return ehLink(valor) ? valor : `https://www.instagram.com/${valor.replace(/^@/, '')}`;
}

function linkYoutube(valor) {
  if (!valor) return null;
  return ehLink(valor) ? valor : `https://www.youtube.com/@${valor.replace(/^@/, '')}`;
}

module.exports = { formatarData, partesData, nomeExibicao, iniciais, linkInstagram, linkYoutube };
