// js/relatorios.js

document.addEventListener("DOMContentLoaded", () => {
  // Carrega e exibe o estoque e clientes assim que a página é carregada
  renderizarEstoqueProdutos();
  renderizarEstoqueMateriasPrimas();
  renderizarClientesCadastrados(); // NOVO: Renderiza a tabela de clientes

  // Renderiza o histórico de movimentações (inicialmente sem filtro)
  renderizarHistoricoMovimentacoes();

  // Adiciona listener para o filtro de tipo de movimentação
  const filtroTipo = document.getElementById("filtroTipo");
  if (filtroTipo) {
    filtroTipo.addEventListener("change", renderizarHistoricoMovimentacoes);
  }
});

// ===========================================================================
// FUNÇÕES DE RENDENIZAÇÃO DE ESTOQUE ATUAL
// ===========================================================================

// Renderiza a tabela de estoque de produtos acabados
function renderizarEstoqueProdutos() {
  const tbody = document.querySelector("#tabela-estoque-produtos tbody");
  if (!tbody) {
    console.error("Elemento 'tabela-estoque-produtos tbody' não encontrado.");
    return;
  }

  tbody.innerHTML = ""; // Limpa a tabela

  if (window.produtosAcabados && window.produtosAcabados.length > 0) {
    // Ordena por nome para melhor visualização
    const produtosOrdenados = [...window.produtosAcabados].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );

    produtosOrdenados.forEach((produto) => {
      const row = tbody.insertRow();
      row.insertCell().textContent = produto.id;
      row.insertCell().textContent = produto.nome;
      row.insertCell().textContent = produto.unidade;
      const estoqueFormatado =
        produto.estoque !== undefined && produto.estoque !== null
          ? produto.estoque.toFixed(2)
          : "0.00";
      row.insertCell().textContent = estoqueFormatado;
    });
    console.log("Estoque de Produtos Acabados renderizado.");
  } else {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.textContent = "Nenhum produto acabado cadastrado ou em estoque.";
    cell.style.textAlign = "center";
  }
}

// Renderiza a tabela de estoque de matérias-primas
function renderizarEstoqueMateriasPrimas() {
  console.log("-> renderizarEstoqueMateriasPrimas() chamado.");
  const tbody = document.querySelector("#tabela-estoque-ingredientes tbody");
  if (!tbody) {
    console.error(
      "Elemento 'tabela-estoque-ingredientes tbody' não encontrado."
    );
    return;
  }

  tbody.innerHTML = ""; // Limpa a tabela

  if (window.materiasPrimas && window.materiasPrimas.length > 0) {
    const materiasPrimasOrdenadas = [...window.materiasPrimas].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
    console.log(
      "   Dados em window.materiasPrimas para renderização:",
      window.materiasPrimas
    );

    materiasPrimasOrdenadas.forEach((mp) => {
      const row = tbody.insertRow();
      row.insertCell().textContent = mp.id;
      row.insertCell().textContent = mp.nome;
      row.insertCell().textContent = mp.unidade;
      row.insertCell().textContent = mp.estoque.toFixed(2);
    });
    console.log("Estoque de Matérias-Primas renderizado.");
  } else {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.textContent = "Nenhuma matéria-prima cadastrada ou em estoque.";
    cell.style.textAlign = "center";
    console.warn("Nenhuma matéria-prima disponível para renderizar o estoque.");
  }
}

// ===========================================================================
// FUNÇÃO DE RENDENIZAÇÃO DE CLIENTES CADASTRADOS (NOVO)
// ===========================================================================

function renderizarClientesCadastrados() {
  const tbody = document.querySelector("#tabela-clientes-cadastrados tbody");
  if (!tbody) {
    console.error(
      "Elemento 'tabela-clientes-cadastrados tbody' não encontrado."
    );
    return;
  }

  tbody.innerHTML = ""; // Limpa a tabela

  if (window.clientes && window.clientes.length > 0) {
    const clientesOrdenados = [...window.clientes].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );

    clientesOrdenados.forEach((cliente) => {
      const row = tbody.insertRow();
      row.insertCell().textContent = cliente.id;
      row.insertCell().textContent = cliente.nome;
      row.insertCell().textContent = cliente.telefone;
      row.insertCell().textContent = cliente.email;
      row.insertCell().textContent = `${cliente.cidade}/${cliente.estado}`;
    });
    console.log("Tabela de clientes cadastrados renderizada.");
  } else {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5; // Abrange as colunas do cabeçalho da tabela de clientes
    cell.textContent = "Nenhum cliente cadastrado.";
    cell.style.textAlign = "center";
    console.warn(
      "Nenhum cliente disponível para renderizar na tabela de relatórios."
    );
  }
}

// ===========================================================================
// FUNÇÕES DE RENDENIZAÇÃO DE HISTÓRICO DE MOVIMENTAÇÕES
// ===========================================================================

// Renderiza a tabela de histórico de movimentações
function renderizarHistoricoMovimentacoes() {
  const tbody = document.querySelector("#tabela-historico-movimentacoes tbody");
  if (!tbody) {
    console.error(
      "Elemento 'tabela-historico-movimentacoes tbody' não encontrado."
    );
    return;
  }

  tbody.innerHTML = ""; // Limpa a tabela

  // Obtém o tipo de filtro selecionado
  const filtroTipo = document.getElementById("filtroTipo")
    ? document.getElementById("filtroTipo").value
    : "todos";

  // Filtra as movimentações
  let movimentacoesFiltradas = window.movimentacoes;
  if (filtroTipo !== "todos") {
    movimentacoesFiltradas = window.movimentacoes.filter(
      (m) => m.tipo === filtroTipo
    );
  }

  if (movimentacoesFiltradas.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 6;
    cell.textContent = "Nenhuma movimentação registrada para este filtro.";
    cell.style.textAlign = "center";
    console.log("Nenhuma movimentação para exibir com o filtro atual.");
    return;
  }

  movimentacoesFiltradas.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  movimentacoesFiltradas.forEach((mov) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = mov.data;
    row.insertCell().textContent = obterNomeTipoMovimentacao(mov.tipo);

    let nomeItem = "";
    let unidadeItem = "";

    // Determina o nome e unidade do item baseado no tipo de movimentação
    if (mov.tipo === "producao") {
      nomeItem = mov.produtoNome || "N/A";
      const produto = window.produtosAcabados.find(
        (p) => p.id === mov.produtoId
      );
      unidadeItem = produto ? produto.unidade : "unid.";
    } else if (mov.tipo === "entrada_materia" || mov.tipo === "saida_materia") {
      const materiaPrima = window.materiasPrimas.find(
        (mp) => mp.id === mov.ingredienteId
      );
      nomeItem = materiaPrima
        ? materiaPrima.nome
        : `ID: ${mov.ingredienteId} (Não encontrado)`;
      unidadeItem = materiaPrima ? materiaPrima.unidade : "unid.";
    } else if (mov.tipo === "venda") {
      nomeItem = mov.produtoNome || "N/A";
      const produto = window.produtosAcabados.find(
        (p) => p.id === mov.produtoId
      );
      unidadeItem = produto ? produto.unidade : "unid.";
    } else {
      nomeItem = mov.descricao || "N/A";
    }

    row.insertCell().textContent = nomeItem;
    row.insertCell().textContent = mov.quantidade.toFixed(2);
    row.insertCell().textContent = unidadeItem;

    // Coluna de detalhes (opcional, para informações extras)
    const detalhesCell = row.insertCell();
    if (mov.tipo === "producao" && mov.ingredientesConsumidos) {
      let detalhes = "Ingredientes: ";
      Object.values(mov.ingredientesConsumidos).forEach((ing) => {
        detalhes += `${ing.nome} (${ing.quantidade.toFixed(2)} ${
          ing.unidade
        }), `;
      });
      detalhesCell.textContent = detalhes.slice(0, -2);
    } else if (mov.tipo === "entrada_materia" || mov.tipo === "saida_materia") {
      detalhesCell.textContent = mov.motivo || "";
    } else if (mov.tipo === "venda") {
      // NOVO: Detalhes para vendas
      detalhesCell.textContent = `Cliente: ${
        mov.clienteNome || "Desconhecido"
      } - Motivo: ${mov.motivo || "Venda"}`;
    } else {
      detalhesCell.textContent = "";
    }
  });
  console.log(
    `Histórico de movimentações renderizado. Total de ${movimentacoesFiltradas.length} registros (Filtro: ${filtroTipo}).`
  );
}

// Função auxiliar para obter o nome amigável do tipo de movimentação
function obterNomeTipoMovimentacao(tipo) {
  switch (tipo) {
    case "producao":
      return "Produção";
    case "entrada_materia":
      return "Entrada Matéria-Prima";
    case "saida_materia":
      return "Saída Matéria-Prima";
    case "venda":
      return "Venda de Produto";
    default:
      return tipo.charAt(0).toUpperCase() + tipo.slice(1).replace("_", " ");
  }
}
