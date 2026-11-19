// Servidor SÓ da página (front-end), na porta 5500. Roda com: node servidor-site.js
// Ele entrega os arquivos da pasta site/ (html, css, js), como o Live Server do VS Code.
// Assim a página fica em http://localhost:5500 e a API em http://localhost:3000: duas ORIGENS diferentes.

const http = require("http");
const fs = require("fs");
const path = require("path");

const PASTA = path.join(__dirname, "site");
const TIPOS = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };

http.createServer(function (req, res) {
  let caminho = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (caminho === "/") {
    caminho = "/index.html";
  }
  const arquivo = path.join(PASTA, path.normalize(caminho));
  if (!arquivo.startsWith(PASTA)) {
    res.writeHead(403);
    res.end("Proibido");
    return;
  }
  fs.readFile(arquivo, function (erro, conteudo) {
    if (erro) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Arquivo não encontrado: " + caminho);
      return;
    }
    const tipo = TIPOS[path.extname(arquivo)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": tipo + "; charset=utf-8" });
    res.end(conteudo);
  });
}).listen(5500, function () {
  console.log("Página ligada: abra http://localhost:5500 no navegador");
});
