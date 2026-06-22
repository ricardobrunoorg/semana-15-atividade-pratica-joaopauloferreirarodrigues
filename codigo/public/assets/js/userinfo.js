// userinfo.js - Getting Freak
// Sobrescreve a função showUserInfo do login.js para apresentar a
// saudação no formato pedido pela orientação: "Olá, <Nome> | Sair".

function showUserInfo(element) {
  const elem = document.getElementById(element);
  if (!elem) return;
  if (typeof usuarioCorrente === "undefined" || !usuarioCorrente || !usuarioCorrente.nome) {
    return;
  }
  const primeiroNome = String(usuarioCorrente.nome).split(" ")[0];
  elem.innerHTML = `
    <span class="user-saudacao">Olá, <strong>${primeiroNome}</strong></span>
    <span class="user-sep">|</span>
    <a class="user-sair-link" onclick="logoutUser()">Sair</a>
  `;
}

// Caso o DOMContentLoaded já tenha disparado (o que faz o login.js chamar
// showUserInfo cedo demais com a função antiga), refazemos a renderização.
document.addEventListener("DOMContentLoaded", function () {
  showUserInfo("userInfo");
});
