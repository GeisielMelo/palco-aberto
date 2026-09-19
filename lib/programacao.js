function doisDigitos(numero) {
  return String(numero).padStart(2, '0');
}

function agoraLocal(momento = new Date()) {
  return {
    data: `${momento.getFullYear()}-${doisDigitos(momento.getMonth() + 1)}-${doisDigitos(momento.getDate())}`,
    horario: `${doisDigitos(momento.getHours())}:${doisDigitos(momento.getMinutes())}`
  };
}

function situacaoDaProgramacao(evento, apresentacoes, agora = agoraLocal()) {
  if (apresentacoes.length === 0) return { tipo: 'vazia' };
  if (evento.data < agora.data) return { tipo: 'encerrada' };
  if (evento.data > agora.data) return { tipo: 'futura', atual: null, proxima: apresentacoes[0] };

  const atual = apresentacoes.find(
    (item) => item.horario_inicio <= agora.horario && agora.horario < item.horario_fim
  ) || null;
  const proxima = apresentacoes.find((item) => item.horario_inicio > agora.horario) || null;

  if (!atual && !proxima) return { tipo: 'encerrada' };
  return { tipo: 'hoje', atual, proxima };
}

module.exports = { agoraLocal, situacaoDaProgramacao };
