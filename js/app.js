import { produtos, CATEGORIAS } from "./produtos.js";
import { Carrinho } from "./Carrinho.js";

const $ = (seletor) => document.querySelector(seletor);
const carrinho = new Carrinho();
const estado = { categoria: "Todos", busca: "", ordem: "relevancia" };

const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const normalizar = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const estrelas = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
const buscarProduto = (id) => produtos.find((p) => p.id === id);

// Cria elementos sem innerHTML
function el(tag, atributos = {}, ...filhos) {
  const e = document.createElement(tag);
  for (const [chave, valor] of Object.entries(atributos)) {
    if (chave === "texto") e.textContent = valor;
    else e.setAttribute(chave, valor);
  }
  e.append(...filhos);
  return e;
}

// Imagem de reserva (SVG com a inicial do produto) caso o arquivo não exista
function reserva(p) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#6d28d9" fill-opacity=".12"/><text x="100" y="128" font-size="90" font-weight="700" text-anchor="middle" fill="#6d28d9" font-family="Arial">${p.nome[0]}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function imagem(p) {
  const img = el("img", { src: p.imagem, alt: p.alt, loading: "lazy" });
  img.addEventListener("error", () => { img.src = reserva(p); }, { once: true });
  return img;
}

function toast(mensagem) {
  const t = el("div", { class: "toast", texto: mensagem });
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 2500);
}

// ===== Produtos: filtro, busca e ordenação =====

function renderFiltros() {
  const botoes = ["Todos", ...Object.keys(CATEGORIAS)].map((cat) => {
    const b = el("button", { type: "button", class: "chip", "data-cat": cat, texto: cat });
    if (CATEGORIAS[cat]) b.style.setProperty("--cor", `var(${CATEGORIAS[cat]})`);
    return b;
  });
  $("#filtros").replaceChildren(...botoes);
}

function renderProdutos() {
  const termo = normalizar(estado.busca.trim());
  const ordens = {
    relevancia: () => 0,
    menor: (a, b) => a.preco - b.preco,
    maior: (a, b) => b.preco - a.preco,
    avaliacao: (a, b) => b.avaliacao - a.avaliacao
  };

  const lista = produtos
    .filter((p) => estado.categoria === "Todos" || p.categoria === estado.categoria)
    .filter((p) => normalizar(p.nome).includes(termo))
    .sort(ordens[estado.ordem]);

  document.querySelectorAll(".chip").forEach((c) =>
    c.setAttribute("aria-pressed", String(c.dataset.cat === estado.categoria))
  );
  $("#total-produtos").textContent = `${lista.length} ${lista.length === 1 ? "produto" : "produtos"}`;
  $("#vazio").hidden = lista.length > 0;
  $("#grade").replaceChildren(...lista.map(criarCard));
}

function criarCard(p) {
  return el("article", { class: "card" },
    el("div", { class: "card-img" }, imagem(p)),
    el("div", { class: "card-corpo" },
      el("span", { class: "tag", style: `--cor: var(${CATEGORIAS[p.categoria]})`, texto: p.categoria }),
      el("h3", { texto: p.nome }),
      el("span", { class: "nota", role: "img", "aria-label": `Avaliação ${p.avaliacao} de 5` },
        estrelas(p.avaliacao), el("b", { texto: ` ${p.avaliacao}` })),
      el("p", { class: "preco", texto: moeda(p.preco) }),
      el("button", {
        class: "btn", type: "button", "data-add": p.id,
        "aria-label": `Adicionar ${p.nome} ao carrinho`, texto: "Adicionar"
      })
    )
  );
}

// ===== Carrinho =====

function renderCarrinho() {
  // ignora ids salvos que não existem mais no catálogo
  const itens = carrinho.itens()
    .map(([id, qtd]) => ({ p: buscarProduto(id), qtd }))
    .filter((i) => i.p);

  const botaoQtd = (p, delta, simbolo, desabilitado = false) => {
    const b = el("button", {
      type: "button", "data-qtd": delta, "data-id": p.id, texto: simbolo,
      "aria-label": `${delta > 0 ? "Aumentar" : "Diminuir"} quantidade de ${p.nome}`
    });
    b.disabled = desabilitado;
    return b;
  };

  $("#itens-carrinho").replaceChildren(...itens.map(({ p, qtd }) =>
    el("li", { class: "item" },
      imagem(p),
      el("div", {},
        el("h3", { texto: p.nome }),
        el("p", { class: "preco", texto: moeda(p.preco) }),
        el("div", { class: "qtd" }, botaoQtd(p, -1, "−", qtd === 1), el("span", { texto: qtd }), botaoQtd(p, 1, "+"))
      ),
      el("button", { class: "link", type: "button", "data-rem": p.id, "aria-label": `Remover ${p.nome}`, texto: "Remover" })
    )
  ));

  // total em centavos para evitar erros de ponto flutuante
  const centavos = itens.reduce((soma, { p, qtd }) => soma + Math.round(p.preco * 100) * qtd, 0);
  const quantidade = itens.reduce((soma, { qtd }) => soma + qtd, 0);

  $("#total").textContent = moeda(centavos / 100);
  $("#contador").textContent = quantidade;
  $("#btn-carrinho").setAttribute("aria-label", `Abrir carrinho, ${quantidade} ${quantidade === 1 ? "item" : "itens"}`);
  $("#carrinho-vazio").hidden = itens.length > 0;
  $("#btn-finalizar").disabled = itens.length === 0;
}

function abrirCarrinho(abrir) {
  const drawer = $("#drawer");
  if (drawer.classList.contains("aberto") === abrir) return;

  drawer.classList.toggle("aberto", abrir);
  drawer.setAttribute("aria-hidden", String(!abrir));
  $("#overlay").hidden = !abrir;
  (abrir ? $("#fechar-carrinho") : $("#btn-carrinho")).focus();
}

// ===== Tema claro/escuro =====

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  const botao = $("#btn-tema");
  botao.textContent = tema === "dark" ? "☀️" : "🌙";
  botao.setAttribute("aria-label", tema === "dark" ? "Ativar tema claro" : "Ativar tema escuro");
}

function iniciarTema() {
  let salvo = null;
  try { salvo = localStorage.getItem("hoops:tema"); } catch { /* sem localStorage */ }
  aplicarTema(salvo || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
}

// ===== Eventos =====

document.addEventListener("click", (evento) => {
  const alvo = evento.target.closest("[data-add], [data-qtd], [data-rem], [data-cat]");
  if (!alvo) return;

  const { add, qtd, rem, cat, id } = alvo.dataset;
  if (add) {
    carrinho.adicionar(Number(add));
    toast(`${buscarProduto(Number(add)).nome} adicionado ao carrinho`);
  }
  if (qtd) carrinho.alterar(Number(id), Number(qtd));
  if (rem) carrinho.remover(Number(rem));
  if (cat) {
    estado.categoria = cat;
    renderProdutos();
  }

  renderCarrinho();
  // mantém o foco no botão de quantidade após redesenhar a lista
  if (qtd) $(`[data-qtd="${qtd}"][data-id="${id}"]`)?.focus();
});

$("#busca").addEventListener("input", (e) => { estado.busca = e.target.value; renderProdutos(); });
$("#ordem").addEventListener("change", (e) => { estado.ordem = e.target.value; renderProdutos(); });

$("#btn-carrinho").addEventListener("click", () => abrirCarrinho(true));
$("#fechar-carrinho").addEventListener("click", () => abrirCarrinho(false));
$("#overlay").addEventListener("click", () => abrirCarrinho(false));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") abrirCarrinho(false); });

$("#btn-finalizar").addEventListener("click", () => {
  if (carrinho.itens().length === 0) return;
  location.href = "pagamento.html";
});

$("#btn-tema").addEventListener("click", () => {
  const novo = document.documentElement.dataset.tema === "dark" ? "light" : "dark";
  aplicarTema(novo);
  try { localStorage.setItem("hoops:tema", novo); } catch { /* sem localStorage */ }
});

$("#form-news").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#email").value.trim();
  const mensagem = $("#msg-news");
  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

  mensagem.textContent = valido
    ? "Cupom enviado! Confira sua caixa de entrada."
    : "Digite um e-mail válido, como nome@dominio.com.";
  mensagem.className = valido ? "ok" : "erro";
  if (valido) {
    e.target.reset();
    toast("Cupom enviado para o seu e-mail.");
  }
});

// ===== Inicialização =====

iniciarTema();
renderFiltros();
renderProdutos();
renderCarrinho();
