const { CATEGORIAS } = require('../models/participants');
const { PAPEIS } = require('./papeis');

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_INSTAGRAM = /^(@?[A-Za-z0-9._]{1,30}|https?:\/\/(www\.)?instagram\.com\/\S+)$/i;
const REGEX_YOUTUBE = /^(@?[A-Za-z0-9._-]{3,30}|https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\/\S+)$/i;

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function opcional(valor) {
  return texto(valor) || null;
}

function lerId(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function normalizarData(valor) {
  const brasileira = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
  return brasileira ? `${brasileira[3]}-${brasileira[2]}-${brasileira[1]}` : valor;
}

function dataValida(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!partes) return false;
  const [ano, mes, dia] = partes.slice(1).map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

function normalizarHorario(valor) {
  return /^\d{2}:\d{2}:\d{2}$/.test(valor) ? valor.slice(0, 5) : valor;
}

function horarioValido(valor) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

function validarEvento(corpo = {}) {
  const valores = {
    nome: texto(corpo.nome),
    data: normalizarData(texto(corpo.data)),
    local: texto(corpo.local),
    descricao: opcional(corpo.descricao)
  };
  const erros = [];

  if (!valores.nome) erros.push('Informe o nome do evento.');
  if (!valores.data) {
    erros.push('Informe a data do evento.');
  } else if (!dataValida(valores.data)) {
    erros.push('Informe uma data válida no formato dd/mm/aaaa.');
  }
  if (!valores.local) erros.push('Informe o local do evento.');

  return { valores, erros };
}

function validarParticipante(corpo = {}) {
  const valores = {
    nome: texto(corpo.nome),
    nome_artistico: opcional(corpo.nome_artistico),
    categoria: texto(corpo.categoria),
    descricao: opcional(corpo.descricao),
    instagram: opcional(corpo.instagram),
    youtube: opcional(corpo.youtube)
  };
  const erros = [];

  if (!valores.nome) erros.push('Informe o nome do participante.');
  if (!valores.categoria) {
    erros.push('Selecione a categoria.');
  } else if (!CATEGORIAS.includes(valores.categoria)) {
    erros.push('Selecione uma categoria da lista.');
  }
  if (valores.instagram && !REGEX_INSTAGRAM.test(valores.instagram)) {
    erros.push('Informe o Instagram como @usuario ou como link do perfil.');
  }
  if (valores.youtube && !REGEX_YOUTUBE.test(valores.youtube)) {
    erros.push('Informe o YouTube como @canal ou como link do canal.');
  }

  return { valores, erros };
}

function validarApresentacao(corpo = {}) {
  const valores = {
    evento_id: lerId(corpo.evento_id),
    participante_id: lerId(corpo.participante_id),
    horario_inicio: normalizarHorario(texto(corpo.horario_inicio)),
    horario_fim: normalizarHorario(texto(corpo.horario_fim)),
    palco: texto(corpo.palco)
  };
  const erros = [];

  if (!valores.evento_id) erros.push('Selecione o evento.');
  if (!valores.participante_id) erros.push('Selecione o participante.');

  const inicioValido = horarioValido(valores.horario_inicio);
  const fimValido = horarioValido(valores.horario_fim);

  if (!valores.horario_inicio) {
    erros.push('Informe o horário inicial.');
  } else if (!inicioValido) {
    erros.push('Informe o horário inicial no formato hh:mm.');
  }
  if (!valores.horario_fim) {
    erros.push('Informe o horário final.');
  } else if (!fimValido) {
    erros.push('Informe o horário final no formato hh:mm.');
  }
  if (inicioValido && fimValido && valores.horario_inicio >= valores.horario_fim) {
    erros.push('O horário inicial precisa ser anterior ao horário final.');
  }
  if (!valores.palco) erros.push('Informe o palco.');

  return { valores, erros };
}

function senha(valor) {
  return typeof valor === 'string' ? valor : '';
}

function validarCadastro(corpo = {}) {
  const valores = {
    nome: texto(corpo.nome),
    email: texto(corpo.email).toLowerCase(),
    senha: senha(corpo.senha),
    confirmacao: senha(corpo.confirmacao)
  };
  const erros = [];

  if (!valores.nome) erros.push('Informe o seu nome.');
  if (!valores.email) {
    erros.push('Informe o seu e-mail.');
  } else if (!REGEX_EMAIL.test(valores.email)) {
    erros.push('Informe um e-mail válido.');
  }
  if (valores.senha.length < 6) {
    erros.push('A senha precisa ter pelo menos 6 caracteres.');
  } else if (Buffer.byteLength(valores.senha) > 72) {
    erros.push('A senha pode ter no máximo 72 caracteres.');
  }
  if (valores.senha !== valores.confirmacao) erros.push('A confirmação não confere com a senha informada.');

  return { valores, erros };
}

function validarLogin(corpo = {}) {
  const valores = {
    email: texto(corpo.email).toLowerCase(),
    senha: senha(corpo.senha)
  };
  const erros = [];

  if (!valores.email || !valores.senha) erros.push('Informe o e-mail e a senha.');

  return { valores, erros };
}

function validarAcesso(corpo = {}) {
  const valores = {
    papel: texto(corpo.papel),
    participante_id: lerId(corpo.participante_id)
  };
  const erros = [];

  if (!Object.values(PAPEIS).includes(valores.papel)) erros.push('Selecione um papel válido.');
  if (valores.papel !== PAPEIS.PARTICIPANTE) valores.participante_id = null;

  return { valores, erros };
}

function destinoSeguro(valor) {
  return typeof valor === 'string' && /^\/(?![/\\])/.test(valor) ? valor : null;
}

module.exports = {
  lerId,
  validarEvento,
  validarParticipante,
  validarApresentacao,
  validarCadastro,
  validarLogin,
  validarAcesso,
  destinoSeguro
};
