// auth.js - Getting Freak
//
// Módulo auxiliar para gerenciar o estado de autenticação na interface
// das páginas que NÃO devem forçar login (home, detalhes, estatísticas).
//
// Em páginas que devem exigir login (ex.: favoritos.html), inclua o
// login.js diretamente — ele faz o redirecionamento automático para
// a tela de login.
//
// Este módulo apenas:
//   - Lê o objeto usuarioCorrente do sessionStorage (sem redirecionar)
//   - Renderiza no elemento #userInfo da navbar:
//       * "Entrar"                quando deslogado
//       * "Olá, <nome> | Sair"    quando logado
//   - Expõe utilitários: estaLogado(), getUsuarioCorrente(), fazerLogout()
//
// Os favoritos do usuário são guardados em localStorage com chave
// composta: favoritos_<idDoUsuario>, conforme orientação da atividade.

const URL_LOGIN = "/modulos/login/login.html";

function getUsuarioCorrente() {
  const dados = sessionStorage.getItem("usuarioCorrente");
  if (!dados) {
    return null;
  }
  try {
    return JSON.parse(dados);
  } catch (e) {
    console.error("usuarioCorrente inválido no sessionStorage", e);
    return null;
  }
}

function estaLogado() {
  const u = getUsuarioCorrente();
  return u !== null && u !== undefined && u.id !== undefined;
}

function fazerLogout() {
  sessionStorage.removeItem("usuarioCorrente");
  window.location.reload();
}

function irParaLogin() {
  sessionStorage.setItem("returnURL", window.location.pathname);
  window.location.href = URL_LOGIN;
}

function montarAreaUsuario() {
  const elem = document.getElementById("userInfo");
  if (!elem) return;

  const usuario = getUsuarioCorrente();
  if (usuario && usuario.nome) {
    const primeiroNome = String(usuario.nome).split(" ")[0];
    elem.innerHTML = `
      <span class="user-saudacao">Olá, <strong>${primeiroNome}</strong></span>
      <button type="button" class="btn btn-gf-outline user-sair" onclick="fazerLogout()">Sair</button>
    `;
  } else {
    elem.innerHTML = `
      <a href="${URL_LOGIN}" class="btn btn-gf user-entrar">Entrar</a>
    `;
  }
}

// Bloqueio de ação para usuário não logado.
// Use em qualquer botão protegido (ex.: favoritar).
// Retorna true se está logado, false se foi bloqueado.
function exigirLogin(mensagem) {
  if (estaLogado()) {
    return true;
  }
  const msg = mensagem || "Você precisa estar logado para usar essa funcionalidade.";
  const confirma = confirm(msg + "\n\nIr para a tela de login agora?");
  if (confirma) {
    irParaLogin();
  }
  return false;
}

document.addEventListener("DOMContentLoaded", montarAreaUsuario);
