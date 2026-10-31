// Categorias e a variável CSS da cor de cada uma (definidas em style.css)
export const CATEGORIAS = {
  "Tênis": "--tenis",
  "Roupas": "--roupas",
  "Equipamentos": "--equipamentos",
  "Acessórios": "--acessorios"
};

// Catálogo: array de objetos (nome, categoria, preço, avaliação e imagem com alt).
// Se um arquivo de imagem não existir em /media, a loja mostra uma imagem de reserva.
export const produtos = [
  { id: 1, nome: 'Camisa de Basquete "Golden 30" Curry', categoria: "Roupas", preco: 349.9, avaliacao: 4.8, imagem: "media/regata-golden.png", alt: "Camisa azul e amarela do Golden State Warriors com o número 30" },
  { id: 2, nome: 'Tênis Nike LeBron', categoria: "Tênis", preco: 1199.9, avaliacao: 4.9, imagem: "media/tenis-lebron.png", alt: "Tênis de basquete Nike LeBron preto e roxo" },
  { id: 3, nome: "Bola de Basquete Wilson Evolution", categoria: "Equipamentos", preco: 299.9, avaliacao: 4.7, imagem: "media/bola-wilson.png", alt: "Bola de basquete laranja Wilson Evolution" },
  { id: 4, nome: "Meias Hoops Performance (3 pares)", categoria: "Acessórios", preco: 79.9, avaliacao: 4.6, imagem: "media/meias-hoops.png", alt: "Três pares de meias de cano alto estampadas" },
  { id: 5, nome: "Bola de Basquete Spalding Indoor", categoria: "Equipamentos", preco: 259.9, avaliacao: 4.4, imagem: "media/bola-spalding.png", alt: "Bola de basquete Spalding para quadra coberta" },
  { id: 6, nome: "Regata Chicago Edição Retrô", categoria: "Roupas", preco: 329.9, avaliacao: 4.5, imagem: "media/regata-bulls.png", alt: "Regata vermelha de basquete do Chicago" },
  { id: 7, nome: 'Tênis Jordan Retrô', categoria: "Tênis", preco: 949.9, avaliacao: 4.8, imagem: "media/tenis-jordan.png", alt: "Tênis Jordan branco com detalhes vermelhos" },
  { id: 8, nome: "Bermuda Hoops Elite Tech", categoria: "Roupas", preco: 189.9, avaliacao: 4.7, imagem: "media/bermuda.png", alt: "Bermuda preta de basquete com detalhes brancos" },
];
