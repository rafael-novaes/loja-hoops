# Hoops — loja virtual de basquete

Prova prática de Desenvolvimento Web 2 (IFSP). Loja de tênis, roupas e equipamentos de basquete feita com HTML5, CSS3 e JavaScript puro (módulos ES), sem bibliotecas de interface.

**Site publicado:** https://rafael-novaes.github.io/loja-hoops/

## Como rodar localmente

Os arquivos JavaScript usam módulos ES, que não funcionam abrindo o `index.html` direto do disco. Use um servidor local, como a extensão **Live Server** do VS Code, ou `python -m http.server`.

## Recursos

- **Carrinho de compras:** adicionar, aumentar/diminuir quantidade, remover, total em R$ e contador no ícone
- Carrinho em painel lateral (drawer) com fundo escurecido, fechado também com a tecla Esc
- Filtro por categoria, busca por nome e ordenação (menor preço, maior preço, melhor avaliação)
- Tema claro/escuro, que respeita a preferência do sistema
- Aviso rápido (toast) e validação de e-mail na newsletter
- **Pagamento (simulado):** página própria com escolha entre cartão de crédito (máscaras, validação com algoritmo de Luhn, parcelas sem juros) e Pix (5% de desconto, QR Code e código "copia e cola")
- **Bônus:** carrinho e tema salvos no `localStorage`; desconto no Pix; loja publicada no GitHub Pages

O pagamento é apenas uma simulação didática: nenhum dado é enviado ou guardado, e o código Pix usa uma chave fictícia.

## Design

### Paleta de cores

Todas as cores são variáveis CSS, definidas em `style/style.css` (e `style/pagamento.css`), com valores próprios para o tema escuro.

| Variável | Tema claro | Tema escuro | Uso |
| --- | --- | --- | --- |
| `--paper` | `#FFFFFF` | `#0F1117` | Fundo da página |
| `--ink` | `#181A2A` | `#F3F4F6` | Texto principal |
| `--slate` | `#6B7280` | `#9CA3AF` | Texto secundário |
| `--mist` | `#F3F4F6` | `#1A1D27` | Superfícies suaves (campos, resumo) |
| `--line` | `#E5E7EB` | `#2A2E3B` | Linhas e bordas |
| `--accent` | `#6D28D9` | `#7C3AED` | Marca, botões de ação e destaques |
| `--star` | `#F59E0B` | `#F59E0B` | Estrelas de avaliação |
| `--erro` | `#B91C1C` | `#F87171` | Mensagens de erro |
| `--ok` | `#047857` | `#34D399` | Desconto e confirmações |

**Cores das categorias** (etiquetas e filtros):

| Categoria | Variável | Hex |
| --- | --- | --- |
| Tênis | `--tenis` | `#6D28D9` |
| Roupas | `--roupas` | `#BE185D` |
| Equipamentos | `--equipamentos` | `#0369A1` |
| Acessórios | `--acessorios` | `#047857` |

**Banner (hero):** fundo `#181A2A`, texto `#B9BBC8`, destaque `#F59E0B` e gradiente roxo `#6034D8` → `#3D2677` no painel da imagem. Os tons das categorias foram escurecidos para manter contraste adequado com texto branco.

### Tipografia

| Fonte | Uso |
| --- | --- |
| **Space Grotesk** (500 e 700) | Logotipo, títulos e preços |
| **Inter** (400 e 600) | Corpo, navegação, botões e campos de formulário |

Ambas gratuitas, carregadas pelo Google Fonts: https://fonts.google.com

### Fontes das imagens

- **Banner (jogador de basquete):** imagem gerada por inteligência artificial (Google Gemini)
- **Fotos dos produtos** (`media/`): PREENCHER — informe de onde vieram (ex.: Unsplash, Pexels, Pixabay, ou "geradas por IA")
- **Ícone do carrinho:** SVG próprio, no estilo do Lucide (https://lucide.dev)
- **QR Code:** gerado no navegador com a biblioteca [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (licença MIT)

Quando uma foto não é encontrada, a loja mostra uma imagem de reserva com a inicial do produto.

## Estrutura do projeto

```
index.html          # loja
pagamento.html      # pagamento (cartão ou Pix)
confirmacao.html    # página aberta pelo QR Code do Pix
style/style.css     # estilos da loja e variáveis de design
style/pagamento.css # estilos do pagamento
js/app.js           # interface, filtros, carrinho e tema
js/Carrinho.js      # classe Carrinho (com localStorage)
js/produtos.js      # catálogo (array de objetos)
js/pagamento.js     # resumo, validações, QR Code e Pix
media/              # imagens
```
