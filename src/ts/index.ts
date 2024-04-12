import { Product } from "./Product";

const serverUrl = "http://localhost:5000/products";
const productListContainer = document.getElementById("lista-produtos");
let products: Product[] = []

function main() {
    buscarProdutos(serverUrl).then((produtosBuscados) => {
        products = produtosBuscados;
        mostrarProdutos(products);
    });
}

window.addEventListener('resize', () => {
        productListContainer.innerHTML = '';
        mostrarProdutos(products);
});

document.addEventListener("DOMContentLoaded", main);

// Product Manager -----------Buscar Produtos - Mostrar Produtos na Tela---Botão Carregar Mais ------------------------------------------------------------------------


export async function buscarProdutos(url: string) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error("Erro ao buscar produtos");
      }
      return response.json();
  } catch (error) {
      console.error(error);
      return [];
  }
}

export function mostrarProdutos(products: Product[]) {
  if (!productListContainer) {
      console.error("Elemento lista-produtos não encontrado");
      return;
  }

  productListContainer.innerHTML = '';
  const nomesProdutosExibidos = new Set<string>();

  function adicionarProduto(product: Product) {
      const productCard = criaCardProduto(product);
      productListContainer.appendChild(productCard);
      nomesProdutosExibidos.add(product.name);
  }

  // Exibe os produtos de acordo com o tamanho da tela
  const numProdutosExibidos = window.innerWidth <= 1024 ? 4 : 6;
  let index = 0;
  while (index < products.length && nomesProdutosExibidos.size < numProdutosExibidos) {
      const product = products[index];
      if (!nomesProdutosExibidos.has(product.name)) {
          adicionarProduto(product);
      }
      index++;
  }

  // Adiciona botão "Carregar Mais" se houver mais produtos para exibir
  const loadMoreButton = document.querySelector('.load-more') as HTMLButtonElement;
  if (index < products.length) {
      loadMoreButton.style.display = 'block';

      loadMoreButton.onclick = () => {
          const numProdutosRestantes = Math.min(products.length - index, numProdutosExibidos);
          for (let i = index; i < index + numProdutosRestantes; i++) {
              const product = products[i];
              if (!nomesProdutosExibidos.has(product.name)) {
                  adicionarProduto(product);
              }
          }
          index += numProdutosRestantes;

          if (index >= products.length) {
              loadMoreButton.style.display = 'none';
          }
      };
  } else {
      loadMoreButton.style.display = 'none';
  }
}

export function criaCardProduto(product: Product): HTMLElement {
  
  const productCard = document.createElement("li");
  productCard.classList.add("product-card");

  const productName = document.createElement("h2");
  productName.textContent = product.name;

  const productPrice = document.createElement("p");
  productPrice.textContent = `R$ ${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const parcelInfo = document.createElement("p");
  parcelInfo.textContent = `até ${product.parcelamento[0]}x de R$${product.parcelamento[1].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  parcelInfo.className = "parcelamento";

  const productImage = document.createElement("img");
  productImage.src = `${product.image}`;

  const buyButton = document.createElement("button");
  buyButton.textContent = "Comprar";
  buyButton.className = 'botao-comprar'
   // Definindo os atributos data para o botão de compra
  buyButton.dataset.productId = product.id;
  buyButton.dataset.productName = product.name;
  buyButton.dataset.productPrice = product.price.toString();

  productCard.appendChild(productImage);
  productCard.appendChild(productName);
  productCard.appendChild(productPrice);
  productCard.appendChild(parcelInfo);
  productCard.appendChild(buyButton);

  return productCard;
};

// User Interaction ------------- ---- Funcionalidades de Filtro do Modal ------------ Telas menores de 1024px  ---------------------------------------------

const filtrarButton = document.getElementById("filtrar") as HTMLElement;
const ordenarButton = document.getElementById("ordenar") as HTMLElement;
const modalFiltrar = document.getElementById("modal_filtrar");
const modalOrdenar = document.getElementById("modal_ordenar");
const closeButtonFiltrar = document.querySelector(".close-fil") as HTMLElement;
const closeButtonOrdenar = document.querySelector(".close-ord") as HTMLElement;
const opcoesFiltro = modalFiltrar.querySelectorAll('.opcao-filtro');

filtrarButton.addEventListener('click', () => {
  modalFiltrar.style.display = "block";
});

ordenarButton.addEventListener('click', () => {
  modalOrdenar.style.display = "block";
});

closeButtonFiltrar.addEventListener('click', () => {
  modalFiltrar.style.display = "none";
});

closeButtonOrdenar.addEventListener('click', () => {
  modalOrdenar.style.display = "none";
});

function verificarOpcoesExpandidas() {
  const opcoesExpandidas = document.querySelectorAll('.opcao-filtro.expandido');
  return opcoesExpandidas.length > 0;
}

// Função para criar e inserir os botões "Aplicar Filtros" e "Limpar Filtros" ao final da página
function adicionarBotoesAcao() {
  const containerBotoes = document.querySelector('.botoes-acao') as HTMLElement;

  if (!containerBotoes) {
    const botoesContainer = document.createElement('div');
    botoesContainer.classList.add('botoes-acao');

    // Botão "Aplicar Filtros"
    const botaoAplicar = document.createElement('button');
    botaoAplicar.textContent = 'Aplicar';
    botaoAplicar.className = "aplicar-filtros"
    botaoAplicar.addEventListener('click', () => {
      const coresSelecionadas = obterValoresSelecionados('.filtro-cores input[type="checkbox"]:checked')
      const tamanhosSelecionados = obterValoresSelecionados('.opcoes_filtro-tamanho input[type="checkbox"]:checked')
      const precosSelecionados = obterValoresSelecionados('.filtro-precos input[type="checkbox"]:checked')
      
      const produtosFiltrados = filtrarProdutos(products, coresSelecionadas, tamanhosSelecionados, precosSelecionados);
      
      if(produtosFiltrados.length === 0) {
        mostrarProdutos(products)
      } else {
        mostrarProdutos(produtosFiltrados);
      }
      modalFiltrar.style.display = "none";
    });
    // Botão "Limpar Filtros"
    const botaoLimpar = document.createElement('button');
    botaoLimpar.textContent = 'Limpar';
    botaoLimpar.addEventListener('click', () => {
      console.log('Filtros limpos');
    });

    botoesContainer.appendChild(botaoAplicar);
    botoesContainer.appendChild(botaoLimpar);

    modalFiltrar.appendChild(botoesContainer);
  }
}

// Adiciona os botões de ação ao expandir qualquer uma das opções de filtro
opcoesFiltro.forEach((opcao: HTMLElement) => {
  const conteudoOpcao = opcao.querySelector('.opcao-filtro-conteudo') as HTMLElement;
  const arrow = opcao.querySelector('.arrow') as HTMLElement;

  arrow.addEventListener('click', (event) => {
    event.stopPropagation(); 

    if (conteudoOpcao.style.display === 'none') {
      opcao.classList.add('expandido');
      conteudoOpcao.style.display = 'block';
      adicionarBotoesAcao();
    } else {
      opcao.classList.remove('expandido');
      conteudoOpcao.style.display = 'none';
      const containerBotoes = document.querySelector('.botoes-acao') as HTMLElement;
      if (containerBotoes) {
        containerBotoes.remove();
      }
    }
    atualizarBotoesAcao()
    
  });
});

function atualizarBotoesAcao() {
  const containerBotoes = document.querySelector('.botoes-acao') as HTMLElement;

  if (verificarOpcoesExpandidas()) {
    if (!containerBotoes) {
      adicionarBotoesAcao();
    }
  } else {
    if (containerBotoes) {
      containerBotoes.remove();
    }
  }
}

// filter Manager ----------------Funcionalidade de Filtros para telas acima de 1024px  -----------------------------------------------------------------------------

export function filtrarProdutos(products: Product[], cores: string[], tamanhos: string[], faixasPreco: string[]): Product[] {
    const produtosFiltrados = products.filter((product: Product) => {
        const corValida = cores.includes(product.color) || cores.length === 0
        const tamanhoValido = tamanhos.some(size => product.size.includes(size)) || tamanhos.length === 0;
        const precoValido = faixasPreco.some((faixa: string) => {
          const [min, max] = faixa.split('-').map(Number);
          return product.price >= min && product.price <= max;
        }) || faixasPreco.length === 0;
        return corValida && tamanhoValido && precoValido;
    })
      if(produtosFiltrados.length === 0) {
          alert('Nenhum produto encontrado')
          return []
      } else{
        return produtosFiltrados
      }
    }

export function obterValoresSelecionados(selector: string): string[] {
    const elementosSelecionados = document.querySelectorAll(selector);
  const valoresSelecionados: string[] = [];
  elementosSelecionados.forEach((elemento: HTMLInputElement) => {
    if (elemento.checked) {
      valoresSelecionados.push(elemento.value);
    }
  });
  return valoresSelecionados;
}

document.querySelectorAll('.opcoes-cores input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', aplicarFiltroAutomatico);
});

document.querySelectorAll('.opcoes-tamanhos input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', aplicarFiltroAutomatico);
});

document.querySelectorAll('.opcoes-precos input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', aplicarFiltroAutomatico);
});

// Função para aplicar o filtro automaticamente quando um checkbox é alterado
function aplicarFiltroAutomatico() {
  const coresSelecionadas = obterValoresSelecionados('.opcoes-cores input[type="checkbox"]:checked');
  const tamanhosSelecionados = obterValoresSelecionados('.opcoes-tamanhos input[type="checkbox"]:checked');
  const faixasPrecoSelecionadas = obterValoresSelecionados('.opcoes-precos input[type="checkbox"]:checked');

  const produtosFiltrados = filtrarProdutos(products, coresSelecionadas, tamanhosSelecionados, faixasPrecoSelecionadas);

  mostrarProdutos(produtosFiltrados);
}


// Cart Manager -----------------------Adicionar ao carrinho de compras -----------------------------------------------------------------------------------

document.addEventListener("click", (event) => {
    
  const target = event.target as HTMLElement;
  if (target && target.classList.contains("botao-comprar")) {
      const botao = target as HTMLButtonElement;
      const productId = botao.dataset.productId ? parseInt(botao.dataset.productId) : 0;
      const productName = botao.dataset.productName || '';
      const productPrice = botao.dataset.productPrice ? parseFloat(botao.dataset.productPrice) : 0;
      const produto: Product = {
          id: productId.toString(),
          name: productName,
          price: productPrice,
          parcelamento: [1, productPrice],
          color: 'cor', 
          image: 'imagem.jpg', 
          size: ['P', 'M', 'G'],
          date: "de hoje"
      };
      console.log("Produto adicionado ao carrinho:", produto);
      adicionarAoCarrinho(produto);
  }
});

const carrinho: Product[] = [];

export function adicionarAoCarrinho(produto: Product) {
    carrinho.push(produto);
    atualizarContadorCarrinho();
  }

export function atualizarContadorCarrinho() {
    const contadorElemento = document.getElementById('contador-carrinho');
    if (contadorElemento) {
        contadorElemento.textContent = carrinho.length.toString();
    }
  }

