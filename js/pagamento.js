import { produtos } from "./produtos.js";
import { Carrinho } from "./Carrinho.js";

const $ = (seletor) => document.querySelector(seletor);
const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const DESCONTO_PIX = 0.05;
const LINK_QR = "https://rafael-novaes.github.io/loja-hoops/confirmacao.html"; // página para onde o QR Code leva
const numeroPedido = Math.floor(10000 + Math.random() * 90000);
let CODIGO_PIX = ""; // código "copia e cola" fictício (definido em gerarQr)

// Tema salvo na loja
try {
  const salvo = localStorage.getItem("hoops:tema");
  document.documentElement.dataset.tema = salvo || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
} catch { /* sem localStorage */ }

// Carrinho salvo pela loja. Sem itens, volta para a loja.
const carrinho = new Carrinho();
const itens = carrinho.itens()
  .map(([id, qtd]) => ({ p: produtos.find((p) => p.id === id), qtd }))
  .filter((i) => i.p);
if (itens.length === 0) location.replace("index.html");

const subtotal = itens.reduce((soma, { p, qtd }) => soma + Math.round(p.preco * 100) * qtd, 0); // centavos
const formaAtual = () => $("#form-pagamento").elements.forma.value;
const descontoAtual = () => (formaAtual() === "pix" ? Math.round(subtotal * DESCONTO_PIX) : 0);
const totalAtual = () => subtotal - descontoAtual();

function renderResumo() {
  $("#resumo-itens").replaceChildren(...itens.map(({ p, qtd }) => {
    const li = document.createElement("li");
    const nome = document.createElement("span");
    const valor = document.createElement("span");
    nome.textContent = `${qtd}× ${p.nome}`;
    valor.textContent = moeda((Math.round(p.preco * 100) * qtd) / 100);
    li.append(nome, valor);
    return li;
  }));

  const pix = formaAtual() === "pix";
  $("#v-subtotal").textContent = moeda(subtotal / 100);
  $("#v-desconto").textContent = `− ${moeda(descontoAtual() / 100)}`;
  $("#linha-desconto").hidden = !pix;
  $("#v-total").textContent = moeda(totalAtual() / 100);
  $("#btn-pagar").textContent = pix ? `Confirmar pagamento de ${moeda(totalAtual() / 100)}` : `Pagar ${moeda(totalAtual() / 100)}`;
  $("#painel-cartao").hidden = pix;
  $("#painel-pix").hidden = !pix;
}

// Parcelas sem juros (parcela mínima de R$ 30)
function renderParcelas() {
  const maximo = Math.max(1, Math.min(6, Math.floor(subtotal / 3000)));
  $("#parcelas").replaceChildren(...Array.from({ length: maximo }, (_, i) => {
    const op = document.createElement("option");
    op.value = i + 1;
    op.textContent = `${i + 1}x de ${moeda(subtotal / (i + 1) / 100)} sem juros`;
    return op;
  }));
}

// ===== Máscaras =====
const soDigitos = (t) => t.replace(/\D/g, "");

$("#cc-numero").addEventListener("input", (e) => {
  e.target.value = soDigitos(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
});
$("#cc-validade").addEventListener("input", (e) => {
  const d = soDigitos(e.target.value).slice(0, 4);
  e.target.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
});
$("#cc-cvv").addEventListener("input", (e) => {
  e.target.value = soDigitos(e.target.value).slice(0, 4);
});

// ===== Validações =====
function luhn(numero) {
  let soma = 0;
  [...numero].reverse().forEach((digito, i) => {
    let v = Number(digito);
    if (i % 2 === 1) { v *= 2; if (v > 9) v -= 9; }
    soma += v;
  });
  return soma % 10 === 0;
}

function validadeOk(texto) {
  const m = /^(\d{2})\/(\d{2})$/.exec(texto);
  if (!m) return false;
  const mes = Number(m[1]);
  if (mes < 1 || mes > 12) return false;
  return new Date(2000 + Number(m[2]), mes, 1) > new Date(); // vale até o fim do mês
}

function validar() {
  const erros = [];
  if ($("#nome").value.trim().length < 3) erros.push("Informe seu nome completo (mínimo 3 caracteres).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($("#email").value.trim())) erros.push("Digite um e-mail válido, como nome@dominio.com.");

  if (formaAtual() === "cartao") {
    const numero = soDigitos($("#cc-numero").value);
    if (numero.length !== 16 || !luhn(numero)) erros.push("Número do cartão inválido.");
    if ($("#cc-nome").value.trim().length < 3) erros.push("Informe o nome impresso no cartão.");
    if (!validadeOk($("#cc-validade").value)) erros.push("Validade inválida ou vencida. Use o formato MM/AA.");
    if (!/^\d{3,4}$/.test($("#cc-cvv").value)) erros.push("CVV inválido (3 ou 4 dígitos).");
  }
  return erros;
}

function mostrarErros(erros) {
  $("#erros").replaceChildren(...erros.map((msg) => {
    const li = document.createElement("li");
    li.textContent = msg;
    return li;
  }));
  $("#erros").hidden = erros.length === 0;
}

// ===== Eventos =====
document.querySelectorAll('input[name="forma"]').forEach((r) => r.addEventListener("change", () => {
  mostrarErros([]);
  renderResumo();
}));

$("#copiar-pix").addEventListener("click", async () => {
  const botao = $("#copiar-pix");
  try {
    await navigator.clipboard.writeText(CODIGO_PIX);
    botao.textContent = "Código copiado!";
  } catch {
    $("#codigo-pix").select();
    botao.textContent = "Selecione e copie o código";
  }
  setTimeout(() => { botao.textContent = "Copiar código"; }, 2500);
});

$("#form-pagamento").addEventListener("submit", (e) => {
  e.preventDefault();
  const erros = validar();
  mostrarErros(erros);
  if (erros.length > 0) return;

  // Nenhum dado de cartão é guardado: só o carrinho é limpo.
  const forma = formaAtual() === "pix" ? "Pix" : "cartão de crédito";
  const total = moeda(totalAtual() / 100);
  carrinho.limpar();

  $("#texto-confirmacao").textContent =
    `Pedido #${numeroPedido} pago com ${forma}. Total: ${total}. Enviamos a confirmação para ${$("#email").value.trim()}.`;
  $("#checkout").hidden = true;
  $("#confirmacao").hidden = false;
  $("#confirmacao h1").focus?.();
  window.scrollTo({ top: 0 });
});

// Imita um Pix "copia e cola" (formato BR Code). A chave é fictícia, então não é pagável.
const tlv = (id, valor) => id + String(valor.length).padStart(2, "0") + valor;

function crc16(texto) {
  let crc = 0xffff;
  for (const caractere of texto) {
    crc ^= caractere.charCodeAt(0) << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function montarCodigoPix(valor) {
  const conta = tlv("00", "br.gov.bcb.pix") + tlv("01", "pagamentos@hoops.exemplo");
  const base = tlv("00", "01") + tlv("26", conta) + tlv("52", "0000") + tlv("53", "986")
    + tlv("54", valor.toFixed(2)) + tlv("58", "BR") + tlv("59", "HOOPS LOJA") + tlv("60", "SAO PAULO")
    + tlv("62", tlv("05", `HOOPS${numeroPedido}`)) + "6304";
  return base + crc16(base);
}

// O QR Code leva para a página de confirmação publicada no GitHub Pages
function gerarQr() {
  const totalPix = subtotal - Math.round(subtotal * DESCONTO_PIX);
  CODIGO_PIX = montarCodigoPix(totalPix / 100);
  $("#codigo-pix").value = CODIGO_PIX;

  const alvo = $("#qr");
  if (typeof window.qrcode !== "function") {
    alvo.textContent = "QR Code indisponível.";
    return;
  }
  const qr = window.qrcode(0, "M");
  qr.addData(LINK_QR); // o QR abre a confirmação; o copia e cola é só uma imitação
  qr.make();
  const img = document.createElement("img");
  img.src = qr.createDataURL(5, 2);
  img.alt = "QR Code do pagamento Pix";
  alvo.replaceChildren(img);
}

gerarQr();
renderParcelas();
renderResumo();
