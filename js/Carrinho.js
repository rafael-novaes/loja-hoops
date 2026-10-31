const CHAVE = "hoops:carrinho";

// Guarda apenas o id do produto e a quantidade. O preço vem sempre do catálogo.
export class Carrinho {
  #itens = new Map(); // id do produto -> quantidade

  constructor() {
    try {
      JSON.parse(localStorage.getItem(CHAVE) || "[]").forEach(([id, qtd]) => this.#itens.set(id, qtd));
    } catch {
      // sem dados salvos ou dados inválidos: começa com o carrinho vazio
    }
  }

  #salvar() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify([...this.#itens]));
    } catch {
      // localStorage indisponível: o carrinho continua funcionando só na sessão
    }
  }

  adicionar(id) {
    this.#itens.set(id, (this.#itens.get(id) ?? 0) + 1);
    this.#salvar();
  }

  // delta = +1 ou -1; a quantidade nunca fica abaixo de 1 (para sair, use remover)
  alterar(id, delta) {
    const nova = (this.#itens.get(id) ?? 0) + delta;
    if (nova < 1) return;
    this.#itens.set(id, nova);
    this.#salvar();
  }

  remover(id) {
    this.#itens.delete(id);
    this.#salvar();
  }

  limpar() {
    this.#itens.clear();
    this.#salvar();
  }

  // lista de [id, quantidade]
  itens() {
    return [...this.#itens];
  }
}
