// js/receitas.js

let produtoSelecionadoId = null; // Variável para armazenar o ID do produto cuja receita está sendo visualizada/editada

// Garante que o DOM esteja completamente carregado antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
  renderizarListaProdutos(); // Popula a lista de produtos na barra lateral

  // Adiciona listener para o novo botão "Criar Nova Receita (Novo Produto)"
  const btnCriarNovaReceita = document.getElementById("btnCriarNovaReceita");
  if (btnCriarNovaReceita) {
    btnCriarNovaReceita.addEventListener(
      "click",
      mostrarFormCriarNovoProdutoReceita
    );
  }

  // Adiciona listener para o formulário de CRIAÇÃO DE NOVO PRODUTO E RECEITA
  const formNovoProdutoReceita = document.getElementById(
    "formNovoProdutoReceita"
  );
  if (formNovoProdutoReceita) {
    formNovoProdutoReceita.addEventListener("submit", (e) => {
      e.preventDefault();

      const nome = document.getElementById("novoProdutoNome").value.trim();
      const unidade = document
        .getElementById("novoProdutoUnidade")
        .value.trim();
      const precoVenda = parseFloat(
        document.getElementById("novoProdutoPreco").value
      );

      if (!nome || !unidade) {
        alert("Por favor, preencha o nome e a unidade do novo produto.");
        return;
      }

      // 1. Gerar um novo ID para o produto
      const novoIdProduto =
        window.produtosAcabados.length > 0
          ? Math.max(...window.produtosAcabados.map((p) => p.id)) + 1
          : 1;

      // 2. Criar o novo objeto produto
      const novoProduto = {
        id: novoIdProduto,
        nome: nome,
        unidade: unidade,
        precoVenda: isNaN(precoVenda) ? 0.0 : precoVenda, // Garante que seja número ou 0
        estoque: 0, // Novo produto sempre começa com estoque zero
      };

      // 3. Adicionar o novo produto à lista global de produtos acabados
      window.produtosAcabados.push(novoProduto);
      window.salvarDados(); // Salva os produtos atualizados

      alert(
        `Produto "${novoProduto.nome}" criado com sucesso! Agora adicione os ingredientes da receita.`
      );

      // 4. Esconder o formulário de criação de novo produto
      document.getElementById("form-criar-novo-produto-receita").style.display =
        "none";
      formNovoProdutoReceita.reset(); // Limpa o formulário

      // 5. ATUALIZAR a lista lateral de produtos (para que o novo produto apareça)
      renderizarListaProdutos();

      // 6. Abrir a interface de edição de receita diretamente para este NOVO produto
      selecionarProduto(novoProduto.id, novoProduto.nome);
    });
  }
});

// ===========================================================================
// FUNÇÕES DE CONTROLE DE INTERFACE (mostrar/esconder formulários/seções)
// ===========================================================================

// Mostra o formulário para criar um novo produto e sua receita
function mostrarFormCriarNovoProdutoReceita() {
  document.getElementById("form-criar-novo-produto-receita").style.display =
    "block";
  document.getElementById("receita-detalhes").style.display = "none"; // Esconde os detalhes da receita existente
  // Desseleciona qualquer produto na lista lateral
  document
    .querySelectorAll("#lista-produtos-receita li")
    .forEach((li) => li.classList.remove("selected"));
  produtoSelecionadoId = null; // Reseta o produto selecionado
  // Limpa o formulário de novo produto
  document.getElementById("formNovoProdutoReceita").reset();
}

// Cancela a criação de um novo produto/receita (esconde o formulário)
function cancelarNovoProdutoReceita() {
  document.getElementById("form-criar-novo-produto-receita").style.display =
    "none";
  document.getElementById("formNovoProdutoReceita").reset(); // Limpa o formulário
}

// ===========================================================================
// FUNÇÕES DE POPULAÇÃO E RENDERIZAÇÃO DA INTERFACE
// ===========================================================================

// Renderiza a lista de produtos acabados para seleção na coluna esquerda (para edição)
function renderizarListaProdutos() {
  const ul = document.getElementById("lista-produtos-receita");
  if (!ul) {
    console.error("Elemento 'lista-produtos-receita' não encontrado no DOM.");
    return;
  }

  ul.innerHTML = ""; // Limpa a lista antes de renderizar novamente

  if (window.produtosAcabados && window.produtosAcabados.length > 0) {
    const produtosOrdenados = [...window.produtosAcabados].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );

    produtosOrdenados.forEach((produto) => {
      const li = document.createElement("li");
      li.textContent = produto.nome;
      li.dataset.productId = produto.id;
      li.onclick = () => {
        // Esconde o formulário de criação de novo produto ao selecionar um produto existente
        document.getElementById(
          "form-criar-novo-produto-receita"
        ).style.display = "none";
        selecionarProduto(produto.id, produto.nome);
      };
      ul.appendChild(li);
    });
    console.log("Lista de produtos para receitas populada com sucesso.");
  } else {
    const li = document.createElement("li");
    li.textContent = "Nenhum produto cadastrado.";
    li.style.fontStyle = "italic";
    li.style.color = "#777";
    ul.appendChild(li);
    console.warn("Nenhum produto acabado disponível para a lista de receitas.");
  }
}

// Seleciona um produto (seja da lista lateral ou do fluxo de 'criar nova')
// e exibe/preenche seus detalhes de receita para edição/criação
function selecionarProduto(id, nome) {
  produtoSelecionadoId = id;

  document.getElementById("nome-produto-receita").textContent = nome;
  document.getElementById("produto-receita-id").value = id;

  document.getElementById("receita-detalhes").style.display = "block";

  document.querySelectorAll("#lista-produtos-receita li").forEach((li) => {
    li.classList.remove("selected");
    if (parseInt(li.dataset.productId) === id) {
      li.classList.add("selected");
    }
  });

  renderizarIngredientesReceita(); // Isso vai carregar a receita existente ou a mensagem de "nenhum ingrediente"
  popularSelectIngredientes(); // Popula o dropdown de ingredientes para adicionar
}

// Renderiza a tabela de ingredientes que compõem a receita do produto selecionado
function renderizarIngredientesReceita() {
  const tbody = document.querySelector("#tabela-ingredientes-receita tbody");
  if (!tbody) {
    console.error(
      "Elemento 'tabela-ingredientes-receita tbody' não encontrado no DOM."
    );
    return;
  }

  tbody.innerHTML = ""; // Limpa a tabela antes de renderizar novamente

  const receitaDoProduto = window.receitas.filter(
    (r) => r.produtoId === produtoSelecionadoId
  );

  if (receitaDoProduto.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 3;
    cell.innerHTML =
      "<strong>Nenhum ingrediente adicionado a esta receita ainda.</strong><br>Use o formulário 'Adicionar Ingrediente à Receita' abaixo para começar a adicionar ingredientes.";
    cell.style.textAlign = "center";
    cell.style.padding = "20px";
    cell.style.color = "#555";
    return;
  }

  receitaDoProduto.forEach((itemReceita) => {
    // CORREÇÃO APLICADA AQUI
    const ingrediente = window.materiasPrimas.find(
      (i) => i.id === itemReceita.ingredienteId
    );

    if (!ingrediente) {
      console.warn(
        `Ingrediente com ID ${itemReceita.ingredienteId} não encontrado para a receita do produto ${itemReceita.produtoId}.`
      );
      const errorRow = tbody.insertRow();
      errorRow.insertCell().textContent = `Ingrediente Desconhecido (ID: ${itemReceita.ingredienteId})`;
      errorRow.insertCell().textContent = "---";
      const acoesCell = errorRow.insertCell();
      const removerBtn = document.createElement("button");
      removerBtn.textContent = "Remover (Inválido)";
      removerBtn.classList.add("btn-remover-receita");
      removerBtn.onclick = () =>
        removerIngredienteDaReceita(
          produtoSelecionadoId,
          itemReceita.ingredienteId
        );
      acoesCell.appendChild(removerBtn);
      errorRow.style.backgroundColor = "#ffe0e0";
      errorRow.style.color = "#a00";
      return;
    }

    const row = tbody.insertRow();
    row.insertCell().textContent = ingrediente.nome;
    row.insertCell().textContent = `${itemReceita.quantidade.toFixed(3)} ${
      ingrediente.unidade
    }`;
    const acoesCell = row.insertCell();

    const removerBtn = document.createElement("button");
    removerBtn.textContent = "Remover";
    removerBtn.classList.add("btn-remover-receita");
    removerBtn.onclick = () =>
      removerIngredienteDaReceita(
        produtoSelecionadoId,
        itemReceita.ingredienteId
      );
    acoesCell.appendChild(removerBtn);
  });
  console.log(
    `Receita para produto ID ${produtoSelecionadoId} renderizada. Total de ${receitaDoProduto.length} ingredientes.`
  );
}

// Popula o <select> de ingredientes no formulário de adição (para a receita em edição/criação)
function popularSelectIngredientes() {
  const select = document.getElementById("selectIngrediente");
  if (!select) {
    console.error("Elemento 'selectIngrediente' não encontrado no DOM.");
    return;
  }

  select.innerHTML = '<option value="">Selecione um ingrediente</option>';

  // CORREÇÃO APLICADA AQUI
  if (window.materiasPrimas && window.materiasPrimas.length > 0) {
    const ingredientesOrdenados = [...window.materiasPrimas].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );

    ingredientesOrdenados.forEach((ingrediente) => {
      const option = document.createElement("option");
      option.value = ingrediente.id;
      option.textContent = ingrediente.nome;
      select.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhuma matéria-prima cadastrada.";
    option.disabled = true;
    select.appendChild(option);
  }
}

// ===========================================================================
// LÓGICA DE ADIÇÃO/REMOÇÃO DE INGREDIENTES DA RECEITA (CRUD da receita em si)
// ===========================================================================

const formAdicionarIngredienteReceita = document.getElementById(
  "form-adicionar-ingrediente-receita"
);
if (formAdicionarIngredienteReceita) {
  formAdicionarIngredienteReceita.addEventListener("submit", (e) => {
    e.preventDefault();

    const ingredienteId = parseInt(
      document.getElementById("selectIngrediente").value
    );
    const quantidade = parseFloat(
      document.getElementById("quantidadeIngredienteReceita").value
    );

    if (
      !produtoSelecionadoId ||
      isNaN(ingredienteId) ||
      isNaN(quantidade) ||
      quantidade <= 0
    ) {
      alert(
        "Por favor, selecione um produto, um ingrediente e insira uma quantidade válida."
      );
      return;
    }

    const existingRecipeItemIndex = window.receitas.findIndex(
      (r) =>
        r.produtoId === produtoSelecionadoId &&
        r.ingredienteId === ingredienteId
    );

    if (existingRecipeItemIndex !== -1) {
      window.receitas[existingRecipeItemIndex].quantidade = quantidade;
      alert("Quantidade do ingrediente atualizada na receita!");
      console.log(
        `Receita atualizada: Produto ID ${produtoSelecionadoId}, Ingrediente ID ${ingredienteId}, Nova Quantidade: ${quantidade}`
      );
    } else {
      window.receitas.push({
        produtoId: produtoSelecionadoId,
        ingredienteId: ingredienteId,
        quantidade: quantidade,
      });
      alert("Ingrediente adicionado à receita!");
      console.log(
        `Ingrediente adicionado à receita: Produto ID ${produtoSelecionadoId}, Ingrediente ID ${ingredienteId}, Quantidade: ${quantidade}`
      );
    }

    renderizarIngredientesReceita();
    document.getElementById("form-adicionar-ingrediente-receita").reset();
    window.salvarDados();
  });
}

function removerIngredienteDaReceita(produtoId, ingredienteId) {
  if (confirm("Tem certeza que deseja remover este ingrediente da receita?")) {
    window.receitas = window.receitas.filter(
      (r) => !(r.produtoId === produtoId && r.ingredienteId === ingredienteId)
    );

    renderizarIngredientesReceita();
    window.salvarDados();
    alert("Ingrediente removido da receita!");
    console.log(
      `Ingrediente ID ${ingredienteId} removido da receita do Produto ID ${produtoId}.`
    );
  }
}

// ===========================================================================
// FUNÇÕES AUXILIARES / AÇÕES DE BOTÕES
// ===========================================================================

function salvarReceita() {
  window.salvarDados();
  alert("Receita salva com sucesso!");
  console.log("Receita salva manualmente.");
}

function cancelarEdicaoReceita() {
  document.getElementById("receita-detalhes").style.display = "none";
  document.getElementById("form-criar-novo-produto-receita").style.display =
    "none"; // Garante que o form de novo produto também suma
  produtoSelecionadoId = null;
  document
    .querySelectorAll("#lista-produtos-receita li")
    .forEach((li) => li.classList.remove("selected"));
  console.log("Edição de receita cancelada.");
}
