import { Product } from "./Product";

let products: Product[] = []; // Variável global para armazenar a lista de produtos
const productListContainer = document.getElementById("lista-produtos");

const serverUrl = "http://localhost:5000/products";

function main() {
    buscarProdutos(serverUrl).then((produtosBuscados) => {
        products = produtosBuscados; // Armazena os produtos na variável global
        mostrarProdutos(products);
    });
}

window.addEventListener('resize', () => {
    productListContainer.innerHTML = ''; // Limpa o conteúdo atual
    mostrarProdutos(products); // Chama a função para mostrar os produtos novamente com base na largura atual da tela
});

async function buscarProdutos(url: string) {
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

function mostrarProdutos(products: Product[]) {
    if (!productListContainer) {
        console.error("Elemento lista-produtos não encontrado");
        return;
    }

    const nomesProdutosExibidos = new Set<string>();
    let produtosIniciais = window.innerWidth <= 1024 ? 4 : 6; // Define o número inicial de produtos a serem exibidos de acordo com a largura da tela

    // Limpa a lista de produtos antes de exibir os produtos iniciais
    productListContainer.innerHTML = '';

    for (let i = 0; i < products.length && i < produtosIniciais; i++) {
        const product = products[i];
        const productCard = criaCardProduto(product);
        productListContainer.appendChild(productCard);
        nomesProdutosExibidos.add(product.name);
    }

    if (products.length > produtosIniciais) {
        const loadMoreButton = document.querySelector('.load-more') as HTMLButtonElement;
        loadMoreButton.style.display = 'block'; // Mostra o botão "Carregar Mais"

        loadMoreButton.addEventListener('click', () => {
            let nextProductsToShow = Math.min(products.length, nomesProdutosExibidos.size + 4); // Calcula o próximo grupo de produtos a serem exibidos

            for (let i = nomesProdutosExibidos.size; i < nextProductsToShow; i++) {
                const product = products[i];

                if (!nomesProdutosExibidos.has(product.name)) {
                    const productCard = criaCardProduto(product);
                    productListContainer.appendChild(productCard);
                    nomesProdutosExibidos.add(product.name);
                }
            }

            // Oculta o botão "Carregar Mais" se não houver mais produtos para exibir
            if (nomesProdutosExibidos.size >= products.length) {
                loadMoreButton.style.display = 'none';
            }
        });
    }
}

function criaCardProduto(product: Product): HTMLElement {
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
}

document.addEventListener("DOMContentLoaded", main);

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
      console.log("Produto adicionado ao carrinho:", produto); // Verifica se o produto está sendo criado corretamente
      adicionarAoCarrinho(produto);
  }
});


//-----------------------------------------------------------------

// Obter o botão "Filtrar"
const filtrarButton = document.getElementById("filtrar") as HTMLElement;

// Obter o botão "Ordenar"
const ordenarButton = document.getElementById("ordenar") as HTMLElement;


// Adicionar evento de clique ao botão "Filtrar"
filtrarButton.addEventListener('click', () => {
  modalFiltrar.style.display = "block";
});

// Adicionar evento de clique ao botão "Ordenar"
ordenarButton.addEventListener('click', () => {
  modalOrdenar.style.display = "block";
});

// Obter o modalFiltrar
const modalFiltrar = document.getElementById("modal_filtrar");

// Obter o modalOrdenar
const modalOrdenar = document.getElementById("modal_ordenar");

// Obter o botão de fecharFiltrar
const closeButtonFiltrar = document.querySelector(".close-fil") as HTMLElement;

// Obter o botão de fecharOrdenar
const closeButtonOrdenar = document.querySelector(".close-ord") as HTMLElement;

// Obter todas as opções de filtro
const opcoesFiltro = modalFiltrar.querySelectorAll('.opcao-filtro');

// Adicionar evento de clique ao botão de fecharFiltrar
closeButtonFiltrar.addEventListener('click', () => {
  modalFiltrar.style.display = "none";
});

// Adicionar evento de clique ao botão de fecharOrdenar
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

  // Verifica se os botões já foram criados anteriormente
  if (!containerBotoes) {
    // Criação do container de botões
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
      // console.log('Cores selecionadas:', coresSelecionadas);
      // console.log('Tamanhos selecionados:', tamanhosSelecionados);
      // console.log('Preços Selecionados', precosSelecionados)
      
      const produtosFiltrados = filtrarProdutos(products, coresSelecionadas, tamanhosSelecionados, precosSelecionados);
      // console.log('Produtos filtrados', produtosFiltrados)
      if(produtosFiltrados.length === 0) {
        mostrarProdutos(products)
      } else {
        mostrarProdutos(produtosFiltrados);
      }
      // console.log('Filtros aplicados');
      modalFiltrar.style.display = "none";
    });

    // Botão "Limpar Filtros"
    const botaoLimpar = document.createElement('button');
    botaoLimpar.textContent = 'Limpar';
    botaoLimpar.addEventListener('click', () => {
      // Lógica para limpar os filtros
      console.log('Filtros limpos');
    });

    // Adiciona os botões ao container
    botoesContainer.appendChild(botaoAplicar);
    botoesContainer.appendChild(botaoLimpar);

    // Insere o container de botões ao final da página
    modalFiltrar.appendChild(botoesContainer);
  }
}

// Adiciona os botões de ação ao clicar em qualquer uma das setas
opcoesFiltro.forEach((opcao: HTMLElement) => {
  const conteudoOpcao = opcao.querySelector('.opcao-filtro-conteudo') as HTMLElement;
  const arrow = opcao.querySelector('.arrow') as HTMLElement;

  // Adiciona evento de clique à seta
  arrow.addEventListener('click', (event) => {
    event.stopPropagation(); // Impede a propagação do evento para o contêiner pai

    // Adiciona ou remove a classe 'expandido' com base no estado atual
    if (conteudoOpcao.style.display === 'none') {
      opcao.classList.add('expandido');
      conteudoOpcao.style.display = 'block';
      adicionarBotoesAcao(); // Adiciona os botões de ação
    } else {
      opcao.classList.remove('expandido');
      conteudoOpcao.style.display = 'none';
      const containerBotoes = document.querySelector('.botoes-acao') as HTMLElement;
      if (containerBotoes) {
        containerBotoes.remove(); // Remove os botões de ação
      }
    }
    atualizarBotoesAcao()

    
  });
});

// Função para atualizar a visibilidade dos botões de ação
function atualizarBotoesAcao() {
  const containerBotoes = document.querySelector('.botoes-acao') as HTMLElement;

  // Verifica se há opções expandidas
  if (verificarOpcoesExpandidas()) {
    // Adiciona os botões se ainda não estiverem presentes
    if (!containerBotoes) {
      adicionarBotoesAcao();
    }
  } else {
    // Remove os botões se não houver opções expandidas
    if (containerBotoes) {
      containerBotoes.remove();
    }
  }
}

//-----------------------------------------------------------------

function filtrarProdutos(products: Product[], cores: string[], tamanhos: string[], faixasPreco: string[]): Product[] {
  const produtosFiltrados = products.filter((product: Product) => {
    const corValida = cores.includes(product.color) || cores.length === 0
    const tamanhoValido = tamanhos.some(size => product.size.includes(size)) || tamanhos.length === 0;
    const precoValido = faixasPreco.some((faixa: string) => {
      const [min, max] = faixa.split('-').map(Number);
      return product.price >= min && product.price <= max;
    }) || faixasPreco.length === 0;
    // console.log(`Produto: ${product.name}, Cor: ${product.color}, Tamanhos: ${product.size}, Cor Válida: ${corValida}, Tamanho Válido: ${tamanhoValido}`);
    return corValida && tamanhoValido && precoValido;
})
  if(produtosFiltrados.length === 0) {
      alert('Nenhum produto encontrado')
      return []
  } else{
    return produtosFiltrados
  }
}

function obterValoresSelecionados(selector: string): string[] {
  const elementosSelecionados = document.querySelectorAll(selector);
  const valoresSelecionados: string[] = [];
  elementosSelecionados.forEach((elemento: HTMLInputElement) => {
    if (elemento.checked) {
      valoresSelecionados.push(elemento.value);
    }
  });
  return valoresSelecionados;
}

//-------------------------------------------------------------------------------

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
  // console.log('Cores:', coresSelecionadas)
  const tamanhosSelecionados = obterValoresSelecionados('.opcoes-tamanhos input[type="checkbox"]:checked');
  const faixasPrecoSelecionadas = obterValoresSelecionados('.opcoes-precos input[type="checkbox"]:checked');
  // console.log('Tamanhos:', tamanhosSelecionados)
  // console.log('faixaPreço:', faixasPrecoSelecionadas)
  const produtosFiltrados = filtrarProdutos(products, coresSelecionadas, tamanhosSelecionados, faixasPrecoSelecionadas);

  mostrarProdutos(produtosFiltrados);
}

//---------------------------------------------------

const carrinho = []

function adicionarAoCarrinho(produto: Product) {
  carrinho.push(produto);
  atualizarContadorCarrinho();
}

function atualizarContadorCarrinho() {
  const contadorElemento = document.getElementById('contador-carrinho');
  if (contadorElemento) {
      contadorElemento.textContent = carrinho.length.toString();
  }
}