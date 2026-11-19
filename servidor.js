// API do Catálogo de Jogos (back-end). Roda com: node servidor.js
// É a mesma API das Aulas 13 e 14, guardando os jogos no arquivo dados/jogos.json.

const http = require("http");
const fs = require("fs");
const path = require("path");

// Na sua máquina a porta é 3000. Na nuvem, a plataforma escolhe a porta e avisa em process.env.PORT.
const PORTA = process.env.PORT || 3000;

const ARQUIVO = path.join(__dirname, "dados", "jogos.json");

const CABECALHO = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE",
  "Access-Control-Allow-Headers": "Content-Type",
  
};

function lerJogos() {
  return JSON.parse(fs.readFileSync(ARQUIVO, "utf-8"));
}

function gravarJogos(jogos) {
  fs.writeFileSync(ARQUIVO, JSON.stringify(jogos, null, 2));
}

function responder(res, status, dados) {
  res.writeHead(status, CABECALHO);
  res.end(JSON.stringify(dados));
}

function validar(dados) {
  if (!dados.titulo) {
    return "Informe o título do jogo";
  }
  if (typeof dados.preco !== "number") {
    return "O preço precisa ser um número";
  }
  return null;
}

function lerCorpo(req, res, aoTerminar) {
  let texto = "";
  req.on("data", function (pedaco) {
    texto += pedaco;
  });
  req.on("end", function () {
    let dados;
    try {
      dados = JSON.parse(texto);
    } catch (erro) {
      responder(res, 400, { erro: "O corpo não é um JSON válido" });
      return;
    }
    aoTerminar(dados);
  });
}

const servidor = http.createServer(function (req, res) {
  console.log(req.method + " " + req.url + "  (origem: " + (req.headers.origin || "nenhuma") + ")");

  if (req.method === "OPTIONS") {
  res.writeHead(204, CABECALHO);
  res.end();
  return;
}

  // PASSO 4: cole aqui o bloco do OPTIONS

  const url = new URL(req.url, "http://localhost");
  const partes = url.pathname.split("/");
  const rotaBase = "/" + partes[1] + "/" + partes[2];
  const temId = partes.length === 4;
  const id = Number(partes[3]);

  if (url.pathname === "/") {
    responder(res, 200, { mensagem: "API do Catálogo de Jogos funcionando", rota: "/api/jogos" });
    return;
  }

  if (rotaBase !== "/api/jogos") {
    responder(res, 404, { erro: "Rota não encontrada" });
    return;
  }

  if (req.method === "GET" && !temId) {
    responder(res, 200, lerJogos());
  } else if (req.method === "POST" && !temId) {
    lerCorpo(req, res, function (dados) {
      const erro = validar(dados);
      if (erro) {
        responder(res, 400, { erro: erro });
        return;
      }
      const jogos = lerJogos();
      const ultimo = jogos[jogos.length - 1];
      const novo = {
        id: ultimo ? ultimo.id + 1 : 1,
        titulo: dados.titulo,
        genero: dados.genero || "Outros",
        preco: dados.preco,
        disponivel: dados.disponivel === true,
        plataformas: dados.plataformas || ["PC"],
      };
      jogos.push(novo);
      gravarJogos(jogos);
      responder(res, 201, novo);
    });
  } else if (req.method === "DELETE" && temId) {
    const jogos = lerJogos();
    const restantes = jogos.filter(function (item) {
      return item.id !== id;
    });
    if (restantes.length === jogos.length) {
      responder(res, 404, { erro: "Jogo não encontrado" });
    } else {
      gravarJogos(restantes);
      responder(res, 200, { mensagem: "Jogo " + id + " removido" });
    }
  } else {
    responder(res, 405, { erro: "Método não permitido" });
  }
});

servidor.listen(PORTA, function () {
  console.log("API ligada na porta " + PORTA + ". Teste: http://localhost:" + PORTA + "/api/jogos");
});
