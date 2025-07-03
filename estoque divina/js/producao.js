// js/producao.js

document.addEventListener("DOMContentLoaded", () => {
  popularSelectProdutosProducao();
  renderizarHistoricoProducao();
  document.getElementById("dataProducao").valueAsDate = new Date();

  // NOVO: Adiciona listener para o botão "Registrar Produção"
  const btnRegistrarProducao = document.getElementById("btnRegistrarProducao");
  if (btnRegistrarProducao) {
    console.log("Anexando listener a #btnRegistrarProducao"); // DEPURACAO
    btnRegistrarProducao.addEventListener("click", registrarProducao); // Chama a função diretamente no click
  } else {
    console.warn("Botão #btnRegistrarProducao não encontrado no DOM."); // DEPURACAO
  }
});

// ===========================================================================
// FUNÇÕES DE POPULAÇÃO E RENDERIZAÇÃO
// ===========================================================================

// Popula o <select> de produtos com os produtos acabados disponíveis
function popularSelectProdutosProducao() {
  const select = document.getElementById("selectProdutoProducao");

  if (!select) {
    console.error("Elemento 'selectProdutoProducao' não encontrado no DOM.");
    return;
  }

  select.innerHTML = '<option value="">Selecione um produto</option>';

  if (window.produtosAcabados && window.produtosAcabados.length > 0) {
    const produtosOrdenados = [...window.produtosAcabados].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );

    produtosOrdenados.forEach((produto) => {
      const option = document.createElement("option");
      option.value = produto.id;
      option.textContent = produto.nome;
      select.appendChild(option);
    });
    console.log("Dropdown de produtos populado com sucesso.");
  } else {
    console.warn(
      "Nenhum produto acabado disponível para popular o dropdown. Verifique 'produtos.html' ou 'main.js'."
    );
  }
}

// Renderiza o histórico de produção na tabela
function renderizarHistoricoProducao() {
  console.log("-> renderizarHistoricoProducao() chamado."); // DEPURACAO
  const tbody = document.querySelector("#tabela-producao tbody");

  if (!tbody) {
    console.error("Elemento 'tabela-producao tbody' não encontrado no DOM.");
    return;
  }

  tbody.innerHTML = "";

  const historicoProducao = window.movimentacoes.filter(
    (m) => m.tipo === "producao"
  );
  console.log("   Movimentações de produção filtradas:", historicoProducao); // DEPURACAO

  if (historicoProducao.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.textContent = "Nenhum registro de produção ainda.";
    cell.style.textAlign = "center";
    console.log("Nenhum registro de produção para exibir.");
    return;
  }

  historicoProducao.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  historicoProducao.forEach((producao) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = producao.data;
    row.insertCell().textContent = producao.produtoNome;
    row.insertCell().textContent = producao.quantidade.toFixed(2);
    const acoesCell = row.insertCell();

    const excluirBtn = document.createElement("button");
    excluirBtn.textContent = "Desfazer";
    excluirBtn.type = "button"; // Define o tipo como botão para não submeter
    excluirBtn.classList.add("btn-excluir");
    excluirBtn.onclick = () => desfazerProducao(producao.timestamp);
    acoesCell.appendChild(excluirBtn);
  });
  console.log(
    `Histórico de produção renderizado. Total de ${historicoProducao.length} registros.`
  );
}

// ===========================================================================
// LÓGICA DE REGISTRO DE PRODUÇÃO
// ===========================================================================

// Função para registrar a produção (chamada pelo click do botão)
function registrarProducao() {
  // Renomeada, não é mais um listener de submit
  console.log("-> registrarProducao() chamado."); // DEPURACAO
  const produtoId = parseInt(
    document.getElementById("selectProdutoProducao").value
  );
  const quantidadeProduzida = parseFloat(
    document.getElementById("quantidadeProduzida").value
  );
  const dataProducao = document.getElementById("dataProducao").value;

  // Validação básica dos campos
  if (
    !produtoId ||
    isNaN(quantidadeProduzida) ||
    quantidadeProduzida <= 0 ||
    !dataProducao
  ) {
    alert(
      "Por favor, selecione um produto, insira uma quantidade válida e uma data."
    );
    console.warn("Validação de campos falhou."); // DEPURACAO
    return;
  }
  console.log("   Campos validados."); // DEPURACAO

  // 1. Encontrar o produto acabado selecionado
  const produtoAcabado = window.produtosAcabados.find(
    (p) => p.id === produtoId
  );
  if (!produtoAcabado) {
    alert(
      "Produto selecionado não encontrado. Por favor, cadastre o produto acabado."
    );
    console.error("Produto acabado não encontrado:", produtoId); // DEPURACAO
    return;
  }
  console.log("   Produto acabado encontrado:", produtoAcabado.nome); // DEPURACAO

  // 2. Encontrar a receita para o produto selecionado
  const receitasDoProduto = window.receitas.filter(
    (r) => r.produtoId === produtoId
  );
  if (receitasDoProduto.length === 0) {
    alert(
      `Não há receita cadastrada para o produto "${produtoAcabado.nome}". Por favor, cadastre a receita primeiro.`
    );
    console.warn(`Nenhuma receita encontrada para produto ID ${produtoId}.`); // DEPURACAO
    return;
  }
  console.log("   Receita(s) encontrada(s):", receitasDoProduto); // DEPURACAO

  const ingredientesNecessarios = {};
  let estoqueSuficiente = true;
  const avisoEstoque = document.getElementById("aviso-estoque");
  avisoEstoque.textContent = "";
  avisoEstoque.style.color = "red";

  // 3. Calcular ingredientes necessários e verificar disponibilidade no estoque
  const listaResumo = document.getElementById("lista-resumo-ingredientes");
  listaResumo.innerHTML = "";
  document.getElementById("ingredientes-necessarios").style.display = "block";

  receitasDoProduto.forEach((itemReceita) => {
    const ingrediente = window.materiasPrimas.find(
      (i) => i.id === itemReceita.ingredienteId
    ); // CORRIGIDO: materiasPrimas
    if (!ingrediente) {
      console.warn(
        `Ingrediente com ID ${itemReceita.ingredienteId} não encontrado na lista de matérias-primas. Receita pode estar desatualizada.`
      );
      const li = document.createElement("li");
      li.textContent = `AVISO: Ingrediente (ID: ${itemReceita.ingredienteId}) não encontrado!`;
      li.style.color = "orange";
      listaResumo.appendChild(li);
      estoqueSuficiente = false;
      avisoEstoque.textContent =
        "Atenção: Alguns ingredientes da receita não foram encontrados no cadastro de matérias-primas.";
      return;
    }

    const quantidadeNecessaria = itemReceita.quantidade * quantidadeProduzida;

    ingredientesNecessarios[ingrediente.id] = {
      nome: ingrediente.nome,
      quantidade: quantidadeNecessaria,
      unidade: ingrediente.unidade,
      estoqueAtual: ingrediente.estoque,
    };

    const li = document.createElement("li");
    let textoLi = `${ingrediente.nome}: ${quantidadeNecessaria.toFixed(2)} ${
      ingrediente.unidade
    }`;

    if (ingrediente.estoque < quantidadeNecessaria) {
      estoqueSuficiente = false;
      textoLi += ` (FALTA: ${(
        quantidadeNecessaria - ingrediente.estoque
      ).toFixed(2)} ${ingrediente.unidade})`;
      li.style.color = "red";
    } else {
      textoLi += ` (Disponível: ${ingrediente.estoque.toFixed(2)} ${
        ingrediente.unidade
      })`;
    }
    li.textContent = textoLi;
    listaResumo.appendChild(li);
  });
  console.log(
    "   Verificação de estoque de ingredientes concluída. Estoque suficiente:",
    estoqueSuficiente
  ); // DEPURACAO

  if (!estoqueSuficiente) {
    alert(
      "Não é possível registrar a produção devido a estoque insuficiente de um ou mais ingredientes. Verifique o resumo."
    );
    avisoEstoque.textContent =
      "Estoque insuficiente para completar a produção. Ajuste a quantidade ou reponha o estoque.";
    return;
  }

  // 4. Se houver estoque suficiente, confirmar e registrar a produção
  if (
    !confirm("Confirmar registro de produção? Os estoques serão atualizados.")
  ) {
    console.log("Registro de produção cancelado pelo usuário.");
    return;
  }
  console.log("   Confirmação do usuário recebida."); // DEPURACAO

  // Dar baixa nos ingredientes consumidos
  for (const ingredienteIdKey in ingredientesNecessarios) {
    const itemConsumido = ingredientesNecessarios[ingredienteIdKey];
    const ingredienteIndex = window.materiasPrimas.findIndex(
      (i) => i.id === parseInt(ingredienteIdKey)
    ); // CORRIGIDO: materiasPrimas
    if (ingredienteIndex !== -1) {
      window.materiasPrimas[ingredienteIndex].estoque -=
        itemConsumido.quantidade;
    }
  }
  console.log("   Estoque de ingredientes baixado."); // DEPURACAO

  // Dar entrada no produto acabado
  const produtoAcabadoIndex = window.produtosAcabados.findIndex(
    (p) => p.id === produtoId
  );
  if (produtoAcabadoIndex !== -1) {
    if (
      typeof window.produtosAcabados[produtoAcabadoIndex].estoque ===
      "undefined"
    ) {
      window.produtosAcabados[produtoAcabadoIndex].estoque = 0;
    }
    window.produtosAcabados[produtoAcabadoIndex].estoque += quantidadeProduzida;
  } else {
    alert("Erro: Produto acabado não encontrado para atualização de estoque.");
    console.error(
      "Erro: Produto acabado não encontrado para atualização de estoque após confirmação."
    ); // DEPURACAO
    return;
  }
  console.log("   Estoque de produto acabado atualizado."); // DEPURACAO

  // 5. Registrar a movimentação de produção para o histórico
  window.movimentacoes.push({
    tipo: "producao",
    id: Date.now(),
    data: dataProducao,
    produtoId: produtoId,
    produtoNome: produtoAcabado.nome,
    quantidade: quantidadeProduzida,
    ingredientesConsumidos: ingredientesNecessarios,
    timestamp: new Date().toISOString(),
  });
  console.log("   Movimentação de produção registrada."); // DEPURACAO

  // 6. Salvar todas as alterações no localStorage
  console.log(
    "   Chamando window.salvarDados() para persistir as alterações de produção."
  ); // DEPURACAO
  window.salvarDados();
  console.log("   Dados de produção salvos."); // DEPURACAO

  // 7. Feedback ao usuário e atualização da interface
  alert("Produção registrada e estoques atualizados com sucesso!");
  document.getElementById("form-producao").reset(); // Limpa o formulário
  document.getElementById("ingredientes-necessarios").style.display = "none"; // Esconde o resumo
  avisoEstoque.textContent = ""; // Limpa qualquer aviso
  renderizarHistoricoProducao(); // Atualiza a tabela do histórico
  console.log("Processo de registro de produção concluído."); // DEPURACAO
}

// ===========================================================================
// FUNÇÃO PARA DESFAZER PRODUÇÃO (Opcional, mas útil)
// ===========================================================================

function desfazerProducao(timestampDaMovimentacao) {
  if (
    !confirm(
      "Tem certeza que deseja DESFAZER esta produção? Os estoques de produtos e ingredientes serão revertidos."
    )
  ) {
    return;
  }

  const index = window.movimentacoes.findIndex(
    (m) => m.timestamp === timestampDaMovimentacao && m.tipo === "producao"
  );

  if (index !== -1) {
    const producaoDesfeita = window.movimentacoes[index];

    // 1. Reverter baixa de ingredientes (devolver ao estoque)
    for (const ingredienteIdKey in producaoDesfeita.ingredientesConsumidos) {
      const itemRevertido =
        producaoDesfeita.ingredientesConsumidos[ingredienteIdKey];
      const ingredienteIndex = window.materiasPrimas.findIndex(
        (i) => i.id === parseInt(ingredienteIdKey)
      ); // CORRIGIDO: materiasPrimas
      if (ingredienteIndex !== -1) {
        window.materiasPrimas[ingredienteIndex].estoque +=
          itemRevertido.quantidade;
      } else {
        console.warn(
          `Ingrediente com ID ${ingredienteIdKey} não encontrado ao tentar reverter estoque.`
        );
      }
    }

    // 2. Reverter entrada de produto acabado (remover do estoque)
    const produtoAcabadoIndex = window.produtosAcabados.findIndex(
      (p) => p.id === producaoDesfeita.produtoId
    );
    if (produtoAcabadoIndex !== -1) {
      window.produtosAcabados[produtoAcabadoIndex].estoque -=
        producaoDesfeita.quantidade;
      if (window.produtosAcabados[produtoAcabadoIndex].estoque < 0) {
        window.produtosAcabados[produtoAcabadoIndex].estoque = 0;
      }
    } else {
      console.error(
        `Produto acabado com ID ${producaoDesfeita.produtoId} não encontrado ao tentar reverter estoque.`
      );
    }

    // 3. Remover a movimentação do histórico
    window.movimentacoes.splice(index, 1);

    window.salvarDados();
    alert("Produção desfeita e estoques revertidos com sucesso!");
    renderizarHistoricoProducao();
    console.log("Produção desfeita e dados revertidos.");
  } else {
    alert("Erro: Registro de produção não encontrado para desfazer.");
    console.error(
      "Registro de produção não encontrado para o timestamp:",
      timestampDaMovimentacao
    );
  }
}
