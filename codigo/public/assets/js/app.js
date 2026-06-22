// app.js - Getting Freak
// Lógica da home (carrossel + cards) e da página de detalhes,
// incluindo a funcionalidade de favoritos por usuário (semana 15).

const API_TREINOS = "/treinos";

// =========================================================================
// FAVORITOS (localStorage com chave composta favoritos_<idDoUsuario>)
// =========================================================================

// Lê o usuário corrente direto do sessionStorage. Não depende de auth.js
// nem de login.js para funcionar — basta que `usuarioCorrente` esteja
// gravado no sessionStorage (o que tanto auth.js quanto login.js fazem
// após a autenticação).
function _usuarioAtual() {
  const dados = sessionStorage.getItem("usuarioCorrente");
  if (!dados) return null;
  try {
    return JSON.parse(dados);
  } catch (e) {
    return null;
  }
}

function chaveFavoritos(idUsuario) {
  return `favoritos_${idUsuario}`;
}

function lerFavoritos() {
  const usuario = _usuarioAtual();
  if (!usuario || usuario.id === undefined) {
    return [];
  }
  const dados = localStorage.getItem(chaveFavoritos(usuario.id));
  if (!dados) {
    return [];
  }
  try {
    const lista = JSON.parse(dados);
    return Array.isArray(lista) ? lista : [];
  } catch (e) {
    console.error("Lista de favoritos inválida:", e);
    return [];
  }
}

function gravarFavoritos(lista) {
  const usuario = _usuarioAtual();
  if (!usuario || usuario.id === undefined) {
    return;
  }
  localStorage.setItem(chaveFavoritos(usuario.id), JSON.stringify(lista));
}

function isFavorito(idTreino) {
  const lista = lerFavoritos();
  return lista.indexOf(Number(idTreino)) !== -1;
}

function alternarFavorito(idTreino) {
  // Bloqueia a ação para usuários não logados.
  // Se auth.js estiver disponível, usa o diálogo customizado; caso
  // contrário (em páginas protegidas por login.js, isso nunca ocorre),
  // usa um alert simples.
  const usuario = _usuarioAtual();
  if (!usuario || usuario.id === undefined) {
    if (typeof exigirLogin === "function") {
      exigirLogin("Para favoritar treinos, você precisa estar logado.");
    } else {
      alert("Você precisa estar logado para favoritar treinos.");
    }
    return;
  }

  const id = Number(idTreino);
  const lista = lerFavoritos();
  const idx = lista.indexOf(id);

  if (idx === -1) {
    lista.push(id);
  } else {
    lista.splice(idx, 1);
  }
  gravarFavoritos(lista);

  // Atualiza visualmente todos os botões correspondentes na tela.
  atualizarBotoesFavorito(id);
}

function atualizarBotoesFavorito(idTreino) {
  const id = String(idTreino);
  const ativo = isFavorito(id);
  const botoes = document.querySelectorAll(`[data-favorito-id="${id}"]`);
  botoes.forEach(btn => {
    if (ativo) {
      btn.classList.add("ativo");
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("title", "Remover dos favoritos");
    } else {
      btn.classList.remove("ativo");
      btn.setAttribute("aria-pressed", "false");
      btn.setAttribute("title", "Adicionar aos favoritos");
    }
  });
}

function botaoFavoritoHTML(idTreino) {
  const ativo = isFavorito(idTreino);
  const classe = ativo ? "btn-favoritar ativo" : "btn-favoritar";
  const titulo = ativo ? "Remover dos favoritos" : "Adicionar aos favoritos";
  const pressed = ativo ? "true" : "false";
  return `
    <button type="button"
            class="${classe}"
            data-favorito-id="${idTreino}"
            aria-pressed="${pressed}"
            aria-label="Favoritar"
            title="${titulo}"
            onclick="alternarFavorito(${idTreino});">
      <span class="coracao" aria-hidden="true">♥</span>
    </button>
  `;
}

// =========================================================================
// HELPERS
// =========================================================================

function getBadgeNivel(nivel) {
  const cores = {
    "Iniciante": "success",
    "Intermediário": "warning",
    "Avançado": "danger"
  };
  return `<span class="badge bg-${cores[nivel] || 'secondary'}">${nivel}</span>`;
}

async function buscarTreinos() {
  const resposta = await fetch(API_TREINOS);
  if (!resposta.ok) {
    throw new Error("Falha ao buscar os treinos");
  }
  return await resposta.json();
}

async function buscarTreino(id) {
  const resposta = await fetch(`${API_TREINOS}/${id}`);
  if (!resposta.ok) {
    throw new Error("Treino não encontrado");
  }
  return await resposta.json();
}

// =========================================================================
// HOME
// =========================================================================

function montarCarrossel(treinos) {
  const indicators = document.getElementById('carouselIndicators');
  const inner = document.getElementById('carouselInner');
  if (!indicators || !inner) return;

  const destaques = treinos.filter(t => t.destaque);

  destaques.forEach((treino, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('data-bs-target', '#carouselDestaques');
    btn.setAttribute('data-bs-slide-to', index);
    btn.setAttribute('aria-label', `Slide ${index + 1}`);
    if (index === 0) {
      btn.classList.add('active');
      btn.setAttribute('aria-current', 'true');
    }
    indicators.appendChild(btn);

    const div = document.createElement('div');
    div.className = `carousel-item${index === 0 ? ' active' : ''}`;
    div.style.cursor = 'pointer';
    div.innerHTML = `
      <img src="${treino.imagem}" class="d-block w-100 carousel-img carousel-foto-${treino.id}" alt="${treino.nome}">
      <div class="carousel-caption d-block">
        <div class="carousel-badge">${getBadgeNivel(treino.nivel)}</div>
        <h3>${treino.nome}</h3>
        <p class="d-none d-md-block">${treino.descricaoCurta}</p>
      </div>
    `;

    div.addEventListener('click', function () {
      window.location.href = `detalhes.html?id=${treino.id}`;
    });

    inner.appendChild(div);
  });
}

function montarCards(treinos) {
  const container = document.getElementById('containerCards');
  if (!container) return;

  treinos.forEach(treino => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6 col-lg-4';
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
    container.appendChild(col);
  });
}

async function carregarHome() {
  const container = document.getElementById('containerCards');
  if (!container) return;

  try {
    const treinos = await buscarTreinos();
    montarCarrossel(treinos);
    montarCards(treinos);
  } catch (erro) {
    console.error(erro);
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">
          Não foi possível carregar os treinos. Verifique se o JSON Server
          está rodando (<code>npm start</code>) e acesse o site por
          <code>http://localhost:3000</code>.
        </div>
      </div>`;
  }
}

// =========================================================================
// DETALHES
// =========================================================================

function renderDetalhe(treino) {
  document.title = `${treino.nome} — Getting Freak`;

  const tagsHtml = (treino.tags || [])
    .map(tag => `<span class="tag">#${tag}</span>`)
    .join("");

  const secaoInfo = document.getElementById('secaoInfo');
  if (secaoInfo) {
    secaoInfo.innerHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-12 col-md-6">
          <img src="${treino.imagem}" class="img-fluid rounded shadow" alt="${treino.nome}">
        </div>
        <div class="col-12 col-md-6">
          <div class="detalhe-header">
            <div class="d-flex gap-2 align-items-center mb-2">
              ${getBadgeNivel(treino.nivel)}
              <span class="badge bg-dark">${treino.categoria}</span>
            </div>
            <div class="d-flex justify-content-between align-items-start gap-2">
              <h1 class="mt-2 mb-0">${treino.nome}</h1>
              ${botaoFavoritoHTML(treino.id)}
            </div>
            <p class="lead mt-2">${treino.descricaoCurta}</p>
          </div>
          <hr>
          <p>${treino.descricaoCompleta}</p>
          <div class="detalhe-stats">
            <div class="stat-item">
              <span class="stat-icon">⏱</span>
              <div><small>Duração</small><strong>${treino.duracao}</strong></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">🔥</span>
              <div><small>Calorias</small><strong>${treino.calorias}</strong></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💪</span>
              <div><small>Séries</small><strong>${treino.series}</strong></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">👁</span>
              <div><small>Visualizações</small><strong>${treino.visualizacoes}</strong></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">📅</span>
              <div><small>Publicado em</small><strong>${new Date(treino.data).toLocaleDateString('pt-BR')}</strong></div>
            </div>
          </div>
          <div class="sobre-tags mt-3">${tagsHtml}</div>
          <a href="index.html" class="btn btn-outline-secondary mt-3">← Voltar</a>
        </div>
      </div>
    `;
  }

  const secaoExercicios = document.getElementById('secaoExercicios');
  if (secaoExercicios) {
    let html = '<div class="row g-3">';
    (treino.exercicios || []).forEach(ex => {
      html += `
        <div class="col-12 col-sm-6 col-md-4">
          <div class="exercicio-card">
            <img src="${ex.imagem}" alt="${ex.nome}">
            <div class="exercicio-body">
              <h5>${ex.nome}</h5>
              <p>${ex.descricao}</p>
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    secaoExercicios.innerHTML = html;
  }
}

async function carregarDetalhe() {
  const container = document.getElementById('detalheContainer');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = `
      <div class="alert alert-warning text-center my-5">
        <h4>Nenhum treino selecionado</h4>
        <p class="mb-3">Volte para a Home e escolha um treino.</p>
        <a href="index.html" class="btn btn-gf">Voltar ao início</a>
      </div>`;
    return;
  }

  try {
    const treino = await buscarTreino(id);
    renderDetalhe(treino);
  } catch (erro) {
    console.error(erro);
    container.innerHTML = `
      <div class="alert alert-danger text-center my-5">
        <h4>Treino não encontrado!</h4>
        <p class="mb-3">Não existe treino com o id <strong>${id}</strong>.</p>
        <a href="index.html" class="btn btn-gf">Voltar ao início</a>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarHome();
  carregarDetalhe();
});
