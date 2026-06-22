const API_TREINOS = "/treinos";

const CORES_GRAFICO = [
  "#e53935",
  "#ff6b6b",
  "#ffa726",
  "#ffd54f",
  "#66bb6a",
  "#26c6da",
  "#5c6bc0",
  "#ab47bc",
  "#ec407a",
  "#8d6e63"
];

const CORES_NIVEL = {
  "Iniciante": "#66bb6a",
  "Intermediário": "#ffa726",
  "Avançado": "#e53935"
};

Chart.defaults.color = "#cccccc";
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.borderColor = "rgba(255,255,255,0.08)";

async function buscarTreinos() {
  const resposta = await fetch(API_TREINOS);
  if (!resposta.ok) {
    throw new Error("Falha ao buscar os treinos");
  }
  return await resposta.json();
}

function duracaoEmMinutos(duracao) {
  if (!duracao) return 0;
  const texto = String(duracao).toLowerCase();
  let total = 0;
  const horas = texto.match(/(\d+)\s*h/);
  const minutos = texto.match(/(\d+)\s*min/);
  if (horas) {
    total += parseInt(horas[1], 10) * 60;
  }
  if (minutos) {
    total += parseInt(minutos[1], 10);
  }
  return total;
}

function caloriasEmNumero(calorias) {
  if (!calorias) return 0;
  const m = String(calorias).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function visualizacoesEmNumero(views) {
  if (!views) return 0;
  const texto = String(views).replace(/\./g, "").replace(",", ".");
  const m = texto.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

function formatarVisualizacoes(valor) {
  if (valor >= 1000) {
    return (valor / 1000).toFixed(1).replace(".0", "") + "k";
  }
  return String(valor);
}

function agruparPor(treinos, chave) {
  const grupos = {};
  treinos.forEach(t => {
    const k = t[chave] || "Outros";
    if (!grupos[k]) {
      grupos[k] = [];
    }
    grupos[k].push(t);
  });
  return grupos;
}

function atualizarResumo(treinos) {
  const total = treinos.length;
  const categorias = new Set(treinos.map(t => t.categoria)).size;
  const calorias = treinos.reduce((s, t) => s + caloriasEmNumero(t.calorias), 0);
  const duracoes = treinos.map(t => duracaoEmMinutos(t.duracao)).filter(d => d > 0);
  const media = duracoes.length > 0
    ? Math.round(duracoes.reduce((s, d) => s + d, 0) / duracoes.length)
    : 0;

  document.getElementById("resumoTotal").textContent = total;
  document.getElementById("resumoCategorias").textContent = categorias;
  document.getElementById("resumoCalorias").textContent = calorias.toLocaleString("pt-BR") + " kcal";
  document.getElementById("resumoDuracao").textContent = media + " min";
}

function montarGraficoCategorias(treinos) {
  const grupos = agruparPor(treinos, "categoria");
  const labels = Object.keys(grupos);
  const dados = labels.map(l => grupos[l].length);

  const ctx = document.getElementById("graficoCategorias").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: dados,
        backgroundColor: CORES_GRAFICO.slice(0, labels.length),
        borderColor: "#161616",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { padding: 12 } },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return `${ctx.label}: ${ctx.parsed} treino(s) (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

function montarGraficoNiveis(treinos) {
  const grupos = agruparPor(treinos, "nivel");
  const labels = Object.keys(grupos);
  const dados = labels.map(l => grupos[l].length);
  const cores = labels.map(l => CORES_NIVEL[l] || "#888");

  const ctx = document.getElementById("graficoNiveis").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: dados,
        backgroundColor: cores,
        borderColor: "#161616",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: { position: "bottom", labels: { padding: 12 } }
      }
    }
  });
}

function montarGraficoDuracao(treinos) {
  const grupos = agruparPor(treinos, "categoria");
  const labels = Object.keys(grupos);
  const dados = labels.map(l =>
    grupos[l].reduce((s, t) => s + duracaoEmMinutos(t.duracao), 0)
  );

  const ctx = document.getElementById("graficoDuracao").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Duração total (min)",
        data: dados,
        backgroundColor: "rgba(229, 57, 53, 0.7)",
        borderColor: "#e53935",
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        x: {
          grid: { display: false },
          ticks: { autoSkip: false, maxRotation: 30, minRotation: 0 }
        }
      }
    }
  });
}

function montarGraficoViews(treinos) {
  const ordenados = treinos
    .map(t => ({ nome: t.nome, views: visualizacoesEmNumero(t.visualizacoes) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, Math.min(6, treinos.length));

  const labels = ordenados.map(o => o.nome);
  const dados = ordenados.map(o => o.views);

  const ctx = document.getElementById("graficoViews").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Visualizações",
        data: dados,
        backgroundColor: "rgba(255, 107, 107, 0.7)",
        borderColor: "#ff6b6b",
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return formatarVisualizacoes(ctx.parsed.x) + " visualizações";
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.05)" },
          ticks: {
            callback: function (valor) {
              return formatarVisualizacoes(valor);
            }
          }
        },
        y: { grid: { display: false } }
      }
    }
  });
}

function mostrarErro(mensagem) {
  const alvo = document.getElementById("mensagemErro");
  if (!alvo) return;
  alvo.innerHTML = `
    <div class="alert alert-danger">
      ${mensagem} Verifique se o JSON Server está rodando
      (<code>npm start</code>) e acesse o site por
      <code>http://localhost:3000/estatisticas.html</code>.
    </div>`;
}

async function iniciar() {
  try {
    const treinos = await buscarTreinos();
    if (!Array.isArray(treinos) || treinos.length === 0) {
      mostrarErro("Nenhum treino encontrado para gerar as estatísticas.");
      return;
    }
    atualizarResumo(treinos);
    montarGraficoCategorias(treinos);
    montarGraficoNiveis(treinos);
    montarGraficoDuracao(treinos);
    montarGraficoViews(treinos);
  } catch (erro) {
    console.error(erro);
    mostrarErro("Não foi possível carregar os dados dos treinos.");
  }
}

document.addEventListener("DOMContentLoaded", iniciar);
