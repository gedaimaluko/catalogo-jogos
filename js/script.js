// Código da página. URL_API vem do arquivo js/config.js.

const listaJogos = document.getElementById("listaJogos");
const statusJogos = document.getElementById("statusJogos");
const aviso = document.getElementById("aviso");

const formJogo = document.getElementById("formJogo");
const inputTitulo = document.getElementById("titulo");
const selectGenero = document.getElementById("genero");
const inputPreco = document.getElementById("preco");
const checkDisponivel = document.getElementById("disponivel");
const statusForm = document.getElementById("statusForm");

let modoDemonstracao = false;

function mostrarJogos(jogos) {
  listaJogos.textContent = "";

  jogos.forEach(function (jogo) {
    const card = document.createElement("article");
    card.className = "card";

    const titulo = document.createElement("h3");
    titulo.textContent = jogo.titulo;

    const detalhes = document.createElement("p");
    detalhes.textContent =
      "#" + jogo.id + " · " + jogo.genero + " · R$ " + jogo.preco.toFixed(2).replace(".", ",");

    const plataformas = document.createElement("p");
    plataformas.textContent = jogo.plataformas.join(", ");

    const selo = document.createElement("span");
    selo.textContent = jogo.disponivel ? "Disponível" : "Esgotado";
    selo.className = jogo.disponivel ? "selo" : "selo esgotado";

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.className = "excluir";
    botaoExcluir.addEventListener("click", function () {
      excluirJogo(jogo.id);
    });

    card.append(titulo, detalhes, plataformas, selo, botaoExcluir);
    listaJogos.appendChild(card);
  });
}

// Plano B: se a API não responder, mostra os jogos de exemplo que estão junto com o site.
async function carregarExemplo(motivo) {
  modoDemonstracao = true;
  aviso.hidden = false;
  aviso.textContent =
    "Modo demonstração: a página não conseguiu falar com a API (" + motivo + "). " +
    "Abra o Console (F12) para ver o motivo. Mostrando jogos de exemplo, só para leitura.";
  const resposta = await fetch("dados/jogos-exemplo.json");
  mostrarJogos(await resposta.json());
}

async function carregarJogos() {
  try {
    const resposta = await fetch(URL_API);
    if (!resposta.ok) {
      throw new Error("erro " + resposta.status);
    }
    const jogos = await resposta.json();
    modoDemonstracao = false;
    aviso.hidden = true;
    statusJogos.textContent = "Conectado à API: " + URL_API;
    statusJogos.classList.remove("erro");
    mostrarJogos(jogos);
  } catch (erro) {
    carregarExemplo(erro.message);
  }
}

async function excluirJogo(id) {
  if (modoDemonstracao) {
    statusJogos.textContent = "No modo demonstração não dá para excluir: a API está desligada.";
    statusJogos.classList.add("erro");
    return;
  }
  try {
    const resposta = await fetch(URL_API + "/" + id, { method: "DELETE" });
    if (!resposta.ok) {
      throw new Error("erro " + resposta.status);
    }
    statusJogos.textContent = "Jogo " + id + " excluído.";
    statusJogos.classList.remove("erro");
    carregarJogos();
  } catch (erro) {
    statusJogos.textContent = "Não foi possível excluir: " + erro.message + ". Veja o Console (F12).";
    statusJogos.classList.add("erro");
  }
}

formJogo.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  if (modoDemonstracao) {
    statusForm.textContent = "No modo demonstração não dá para salvar: a API está desligada.";
    statusForm.classList.add("erro");
    return;
  }

  const novoJogo = {
    titulo: inputTitulo.value.trim(),
    genero: selectGenero.value,
    preco: Number(inputPreco.value),
    disponivel: checkDisponivel.checked,
    plataformas: ["PC"],
  };

  try {
    const resposta = await fetch(URL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoJogo),
    });
    if (!resposta.ok) {
      throw new Error("erro " + resposta.status);
    }
    statusForm.textContent = "Jogo salvo!";
    statusForm.classList.remove("erro");
    formJogo.reset();
    carregarJogos();
  } catch (erro) {
    statusForm.textContent = "Não foi possível salvar: " + erro.message + ". Veja o Console (F12).";
    statusForm.classList.add("erro");
  }
});

carregarJogos();
