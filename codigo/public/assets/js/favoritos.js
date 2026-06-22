// favoritos.js - Getting Freak
// Lista apenas os treinos que o usuário logado marcou como favorito.
// A página inclui o login.js, que já garante o redirecionamento para a
// tela de login caso o usuário não esteja autenticado.

function montarBarraInfoUsuario() {
  // Reaproveita o elemento #userInfo da navbar.
  // Como esta página inclui login.js, o objeto `usuarioCorrente` está
  // disponível como variável global definida no próprio login.js.
  const elem = document.getElementById("userInfo");
  if (!elem) return;
  if (typeof usuarioCorrente !== "undefined" && usuarioCorrente && usuarioCorrente.nome) {
    const primeiroNome = String(usuarioCorrente.nome).split(" ")[0];
    elem.innerHTML = `
      <span class="user-saudacao">Olá, <strong>${primeiroNome}</strong></span>
      <button type="button" class="btn btn-gf-outline user-sair" onclick="logoutUser()">Sair</button>
    `;
  }
}

function lerIdsFavoritos() {
  if (typeof usuarioCorrente === "undefined" || !usuarioCorrente || usuarioCorrente.id === undefined) {
    return [];
  }
  const dados = localStorage.getItem(`favoritos_${usuarioCorrente.id}`);
  if (!dados) return [];
  try {
    const lista = JSON.parse(dados);
    return Array.isArray(lista) ? lista : [];
  } catch (e) {
    return [];
  }
}

function montarCardFavorito(treino) {
  const col = document.createElement("div");
  col.className = "col-12 col-sm-6 col-lg-4";
  col.innerHTML = `
    <div class="treino-card h-100">
      <div class="treino-card-img">
        <a href="detalhes.html?id=${treino.id}">
          <img src="${treino.imagem}" class="treino-foto-${treino.id}" alt="${treino.nome}">
        </a>
        ${botaoFavoritoHTML(treino.id)}
      </div>
      <div class="treino-card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="mb-0"><a href="detalhes.html?id=${treino.id}" class="link-card">${treino.nome}</a></h5>
          ${getBadgeNivel(treino.nivel)}
        </div>
        <p>${treino.descricaoCurta}</p>
        <div class="treino-meta">
          <span>🏷 ${treino.categoria}</span>
          <span>⏱ ${treino.duracao}</span>
          <span>👁 ${treino.visualizacoes} views</span>
          <span>🔥 ${treino.calorias}</span>
        </div>
      </div>
    </div>
  `;
  return col;
}

function exibirEstadoVazio() {
  const container = document.getElementById("containerFavoritos");
  container.innerHTML = `
    <div class="col-12">
      <div class="favoritos-vazio text-center p-5">
        <div class="favoritos-vazio-icone">♡</div>
        <h3 class="mt-3">Você ainda não tem favoritos</h3>
        <p class="text-muted">
          Volte para a Home, clique no coração ao lado de qualquer treino e ele aparecerá aqui.
        </p>
        <a href="index.html" class="btn btn-gf mt-2">Ver treinos disponíveis</a>
      </div>
    </div>
  `;
  document.getElementById("favoritosResumo").textContent = "Nenhum treino favoritado ainda.";
}

async function carregarFavoritos() {
  const container = document.getElementById("containerFavoritos");
  const resumo = document.getElementById("favoritosResumo");
  if (!container) return;

  const ids = lerIdsFavoritos();
  if (ids.length === 0) {
    exibirEstadoVazio();
    return;
  }

  try {
    // Busca todos os treinos uma vez e filtra os favoritados.
    // Mais simples e barato do que um GET por id.
    const resposta = await fetch("/treinos");
    if (!resposta.ok) {
      throw new Error("Falha ao buscar treinos");
    }
    const todos = await resposta.json();
    const setIds = new Set(ids.map(n => Number(n)));
    const favoritos = todos.filter(t => setIds.has(Number(t.id)));

    container.innerHTML = "";
    if (favoritos.length === 0) {
      exibirEstadoVazio();
      return;
    }

    resumo.textContent = `Você tem ${favoritos.length} treino(s) favoritado(s).`;
    favoritos.forEach(t => container.appendChild(montarCardFavorito(t)));
  } catch (erro) {
    console.error(erro);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Não foi possível carregar seus favoritos. Verifique se o JSON Server
          está rodando.
        </div>
      </div>
    `;
  }
}

// Quando o usuário clica num coração ATIVO dentro da própria página de
// favoritos, esperamos que o card também suma da listagem. Como o app.js
// já trata o click via onclick inline, basta observar cliques no container
// e re-renderizar logo depois.
function ligarRecargaAposClique() {
  const container = document.getElementById("containerFavoritos");
  if (!container) return;
  container.addEventListener("click", function (evento) {
    const alvo = evento.target.closest(".btn-favoritar");
    if (!alvo) return;
    // Dá tempo de o app.js atualizar o localStorage antes de re-renderizar.
    setTimeout(carregarFavoritos, 100);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  carregarFavoritos();
  ligarRecargaAposClique();
});
