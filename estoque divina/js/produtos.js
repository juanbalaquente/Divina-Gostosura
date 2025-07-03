// js/produtos.js

document.addEventListener("DOMContentLoaded", () => {
  // A renderização inicial será chamada após os dados serem carregados do Supabase em main.js
  // A função carregarDados de main.js já chama renderizarProdutos() internamente.
  // Assim, não chamamos renderizarProdutos() diretamente aqui, para evitar duplicidade ou dados antigos.

  // Botões principais
  const btnAdicionarProduto = document.querySelector(
    ".action-buttons .btn-primary"
  );
  if (btnAdicionarProduto) {
    btnAdicionarProduto.addEventListener("click", adicionarProduto);
  }
  const btnRegistrarSaidaProduto = document.getElementById(
    "btnRegistrarSaidaProduto"
  );
  if (btnRegistrarSaidaProduto) {
    btnRegistrarSaidaProduto.addEventListener("click", mostrarFormSaidaProduto);
  }

  // Botão Salvar Produto
  const btnSalvarProduto = document.getElementById("btnSalvarProduto");
  if (btnSalvarProduto) {
    btnSalvarProduto.addEventListener("click", salvarProduto);
  }

  // Botão Confirmar Saída/Venda
  const btnConfirmarSaidaProduto = document.getElementById(
    "btnConfirmarSaidaProduto"
  );
  if (btnConfirmarSaidaProduto) {
    btnConfirmarSaidaProduto.addEventListener("click", registrarSaidaProduto);
  }

  // Listener para o select de produto na saída para atualizar a unidade
  const selectProdutoSaida = document.getElementById("selectProdutoSaida");
  if (selectProdutoSaida) {
    selectProdutoSaida.addEventListener("change", atualizarUnidadeSaida);
  }

  // Preenche a data atual no campo de data de saída
  document.getElementById("dataSaida").valueAsDate = new Date();
});

// ===========================================================================
// FUNÇÕES DE EXIBIÇÃO/OCULTAÇÃO DE FORMULÁRIOS
// ===========================================================================

function adicionarProduto() {
  document.getElementById("form-produto").style.display = "block";
  document.getElementById("form-saida-produto").style.display = "none";
  document.getElementById("produtoId").value = "";
  document.getElementById("produtoForm").reset();
}

function cancelarEdicaoProduto() {
  document.getElementById("form-produto").style.display = "none";
  document.getElementById("produtoForm").reset();
}

function mostrarFormSaidaProduto() {
  document.getElementById("form-saida-produto").style.display = "block";
  document.getElementById("form-produto").style.display = "none";
  document.getElementById("saidaProdutoForm").reset();
  popularSelectProdutosSaida(); // Popula o dropdown de produtos
  popularSelectClientesSaida(); // Popula o dropdown de clientes
  document.getElementById("unidadeQuantidadeSaida").textContent = "";
  document.getElementById("dataSaida").valueAsDate = new Date();
}

function cancelarSaidaProduto() {
  document.getElementById("form-saida-produto").style.display = "none";
  document.getElementById("saidaProdutoForm").reset();
  document.getElementById("unidadeQuantidadeSaida").textContent = "";
}

// ===========================================================================
// FUNÇÕES DE RENDENIZAÇÃO DA TABELA DE PRODUTOS
// ===========================================================================

// Renderiza a tabela de produtos acabados (AGORA USANDO DADOS SUPABASE)
async function renderizarProdutos() {
  // AGORA É ASYNC
  const tbody = document.querySelector("#tabela-produtos tbody");
  if (!tbody) {
    console.error("Elemento 'tabela-produtos tbody' não encontrado.");
    return;
  }

  tbody.innerHTML = "";

  // Carrega clientes do Supabase (para garantir dados mais recentes)
  let { data: produtosData, error: produtosError } = await window.supabase // Usa o cliente Supabase global
    .from("produtos")
    .select("*");
  if (produtosError) {
    console.error(
      "Erro ao carregar produtos para renderização:",
      produtosError.message
    );
    window.exibirMensagem("Erro ao carregar produtos do servidor.", "error");
    return;
  }
  window.produtosAcabados = produtosData; // Atualiza a array global com os dados do DB

  if (window.produtosAcabados && window.produtosAcabados.length > 0) {
    const produtosOrdenados = [...window.produtosAcabados].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );

    produtosOrdenados.forEach((produto) => {
      const row = tbody.insertRow();
      row.insertCell().textContent = produto.id.substring(0, 8) + "..."; // Encurta UUID para exibição
      row.insertCell().textContent = produto.nome;
      row.insertCell().textContent = produto.unidade;
      row.insertCell().textContent = produto.estoque.toFixed(2);

      const actionsCell = row.insertCell();
      actionsCell.classList.add("actions");

      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.type = "button";
      editButton.classList.add("edit-btn");
      editButton.onclick = () => editarProduto(produto.id);
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Excluir";
      deleteButton.type = "button";
      deleteButton.classList.add("delete-btn");
      deleteButton.onclick = () => excluirProduto(produto.id);
      actionsCell.appendChild(deleteButton);
    });
    console.log("Tabela de produtos acabados renderizada.");
  } else {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.textContent = "Nenhum produto acabado cadastrado.";
    cell.style.textAlign = "center";
    console.warn("Nenhum produto acabado disponível para renderizar.");
  }
}

// Popula o select de produtos para o formulário de SAÍDA/VENDA
async function popularSelectProdutosSaida() {
  // AGORA É ASYNC
  const select = document.getElementById("selectProdutoSaida");
  if (!select) {
    console.error("Elemento 'selectProdutoSaida' não encontrado.");
    return;
  }

  select.innerHTML = '<option value="">Selecione o produto</option>';
  // Garante que window.produtosAcabados está atualizado antes de popular
  let { data: produtosData, error: produtosError } = await window.supabase
    .from("produtos")
    .select("*");
  if (produtosError) {
    console.error(
      "Erro ao carregar produtos para select de saída:",
      produtosError.message
    );
    return;
  }
  window.produtosAcabados = produtosData; // Atualiza array global

  if (window.produtosAcabados && window.produtosAcabados.length > 0) {
    const produtosOrdenados = [...window.produtosAcabados].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
    produtosOrdenados.forEach((produto) => {
      const option = document.createElement("option");
      option.value = produto.id;
      option.textContent = `${produto.nome} (Estoque: ${produto.estoque.toFixed(
        2
      )} ${produto.unidade})`;
      option.dataset.unidade = produto.unidade;
      option.dataset.estoque = produto.estoque;
      select.appendChild(option);
    });
    console.log("Dropdown de produtos para saída populado.");
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhum produto acabado cadastrado.";
    option.disabled = true;
    select.appendChild(option);
    console.warn("Nenhum produto acabado para popular o dropdown de saída.");
  }
}

// Popula o select de clientes para o formulário de SAÍDA/VENDA
async function popularSelectClientesSaida() {
  // AGORA É ASYNC
  const select = document.getElementById("selectClienteSaida");
  if (!select) {
    console.error("Elemento 'selectClienteSaida' não encontrado.");
    return;
  }

  select.innerHTML = '<option value="">Selecione o cliente</option>';
  // Garante que window.clientes está atualizado antes de popular
  let { data: clientesData, error: clientesError } = await window.supabase
    .from("clientes")
    .select("*");
  if (clientesError) {
    console.error(
      "Erro ao carregar clientes para select de saída:",
      clientesError.message
    );
    return;
  }
  window.clientes = clientesData; // Atualiza array global

  if (window.clientes && window.clientes.length > 0) {
    const clientesOrdenados = [...window.clientes].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
    clientesOrdenados.forEach((cliente) => {
      const option = document.createElement("option");
      option.value = cliente.id;
      option.textContent = cliente.nome;
      select.appendChild(option);
    });
    console.log("Dropdown de clientes para saída populado.");
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhum cliente cadastrado.";
    option.disabled = true;
    select.appendChild(option);
    console.warn("Nenhum cliente disponível para popular o dropdown de saída.");
  }
}

// Atualiza o texto da unidade ao lado do campo de quantidade para SAÍDA
function atualizarUnidadeSaida() {
  const select = document.getElementById("selectProdutoSaida");
  const unidadeSpan = document.getElementById("unidadeQuantidadeSaida");

  if (select && unidadeSpan) {
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.value !== "") {
      unidadeSpan.textContent = selectedOption.dataset.unidade || "";
    } else {
      unidadeSpan.textContent = "";
    }
  }
}

// ===========================================================================
// FUNÇÕES DE CRUD DE PRODUTOS (AGORA PARA SUPABASE)
// ===========================================================================

// Salva (adiciona ou edita) um produto
async function salvarProduto() {
  // AGORA É ASYNC
  const id = document.getElementById("produtoId").value; // ID será um UUID do Supabase
  const nome = document.getElementById("nomeProduto").value.trim();
  const unidade = document.getElementById("unidadeProduto").value.trim();
  const precoVenda = parseFloat(document.getElementById("precoProduto").value);

  if (!nome || !unidade || isNaN(precoVenda)) {
    window.exibirMensagem(
      "Por favor, preencha todos os campos do produto corretamente.",
      "error"
    );
    return;
  }

  let produtoData = { nome, unidade, preco_venda: precoVenda }; // Use nome da coluna do DB (preco_venda)

  let success = false;
  if (id) {
    // Edição de produto existente
    produtoData.id = id; // Supabase precisa do ID para upsert de UUID
    const { error } = await window.supabase
      .from("produtos")
      .upsert(produtoData, { onConflict: "id" });
    if (error) {
      window.exibirMensagem(
        `Erro ao atualizar produto: ${error.message}`,
        "error"
      );
      console.error("Erro ao atualizar produto no Supabase:", error);
    } else {
      window.exibirMensagem("Produto atualizado com sucesso!", "success");
      success = true;
    }
  } else {
    // Novo produto (Supabase gera o UUID para o ID se não for fornecido)
    // O campo 'estoque' tem valor padrão no DB, então não precisamos enviá-lo explicitamente aqui
    const { data, error } = await window.supabase
      .from("produtos")
      .insert(produtoData)
      .select(); // .select() para retornar o produto inserido
    if (error) {
      window.exibirMensagem(
        `Erro ao cadastrar produto: ${error.message}`,
        "error"
      );
      console.error("Erro ao cadastrar produto no Supabase:", error);
    } else {
      window.exibirMensagem("Produto cadastrado com sucesso!", "success");
      success = true;
    }
  }

  if (success) {
    // Recarrega os dados globais de produtos do Supabase e renderiza a tabela
    await window.carregarDados(); // carregarDados já atualiza window.produtosAcabados
    renderizarProdutos();
    document.getElementById("produtoForm").reset();
    document.getElementById("produtoId").value = "";
    popularSelectProdutosSaida(); // Atualiza o dropdown de saída
  }
}

// Preenche o formulário para edição de um produto
async function editarProduto(id) {
  // AGORA É ASYNC
  const produto = window.produtosAcabados.find((p) => p.id === id); // Busca na array global (que está atualizada do Supabase)
  if (produto) {
    document.getElementById("produtoId").value = produto.id;
    document.getElementById("nomeProduto").value = produto.nome;
    document.getElementById("unidadeProduto").value = produto.unidade;
    document.getElementById("precoProduto").value = produto.preco_venda; // Use preco_venda do DB
    document.getElementById("form-produto").style.display = "block";
    document.getElementById("form-saida-produto").style.display = "none";
    window.exibirMensagem(`Editando produto: ${produto.nome}`, "success");
  } else {
    window.exibirMensagem("Produto não encontrado para edição.", "error");
    // Tente recarregar para ter certeza que a array global está atualizada
    await window.carregarDados();
    const produtoRecarregar = window.produtosAcabados.find((p) => p.id === id);
    if (produtoRecarregar) {
      // Se encontrar após recarregar, tente editar novamente
      editarProduto(id);
    }
  }
}

// Exclui um produto
async function excluirProduto(id) {
  // AGORA É ASYNC
  if (
    confirm(
      "Tem certeza que deseja excluir este produto acabado? Esta ação não pode ser desfeita."
    )
  ) {
    // Opcional: Verificar se o produto tem alguma receita associada no DB (ainda não migrado)
    // const temReceita = window.receitas.some(r => r.produtoAcabadoId === id);

    // Opcional: Verificar se o produto tem estoque no DB (já no objeto 'produto')
    const produto = window.produtosAcabados.find((p) => p.id === id);
    if (produto && produto.estoque > 0) {
      if (
        !confirm(
          `Este produto ainda possui ${produto.estoque.toFixed(2)} ${
            produto.unidade
          } em estoque. Excluí-lo removerá o registro do estoque e do histórico. Deseja continuar?`
        )
      ) {
        return;
      }
    }

    // Excluir do Supabase
    const { error } = await window.supabase
      .from("produtos")
      .delete()
      .eq("id", id);

    if (error) {
      window.exibirMensagem(
        `Erro ao excluir produto: ${error.message}`,
        "error"
      );
      console.error("Erro ao excluir produto no Supabase:", error);
    } else {
      // Opcional: Remover receitas associadas no DB (quando migrado)
      // window.receitas = window.receitas.filter(r => r.produtoAcabadoId !== id);
      // Opcional: Remover movimentações relacionadas a este produto (produções, vendas) no DB (quando migrado)
      // window.movimentacoes = window.movimentacoes.filter(...);

      window.exibirMensagem("Produto excluído com sucesso!", "success");
      await window.carregarDados(); // Recarrega produtos (e outros dados se necessário) do Supabase
      renderizarProdutos();
      popularSelectProdutosSaida();
    }
  }
}

// ===========================================================================
// FUNÇÕES DE SAÍDA/VENDA DE PRODUTOS ACABADOS (AGORA PARA SUPABASE)
// ===========================================================================

// Registra a saída/venda de um produto acabado
async function registrarSaidaProduto() {
  // AGORA É ASYNC
  const produtoId = document.getElementById("selectProdutoSaida").value; // ID do produto (UUID)
  const quantidade = parseFloat(
    document.getElementById("quantidadeSaida").value
  );
  const clienteId = document.getElementById("selectClienteSaida").value; // ID do cliente (UUID)
  const dataSaida = document.getElementById("dataSaida").value;
  const motivo = document.getElementById("motivoSaida").value.trim();

  if (
    !produtoId ||
    isNaN(quantidade) ||
    quantidade <= 0 ||
    !clienteId ||
    !dataSaida
  ) {
    window.exibirMensagem(
      "Por favor, preencha todos os campos da saída/venda (Produto, Quantidade, Cliente e Data).",
      "error"
    );
    return;
  }

  const produto = window.produtosAcabados.find((p) => p.id === produtoId);
  const cliente = window.clientes.find((c) => c.id === clienteId);

  if (!produto) {
    window.exibirMensagem("Produto não encontrado.", "error");
    return;
  }
  if (!cliente) {
    window.exibirMensagem("Cliente selecionado não encontrado.", "error");
    return;
  }

  if (produto.estoque < quantidade) {
    window.exibirMensagem(
      `Estoque insuficiente de ${
        produto.nome
      }. Disponível: ${produto.estoque.toFixed(2)} ${produto.unidade}.`,
      "error"
    );
    return;
  }

  // Atualiza o estoque no Supabase
  const novoEstoque = produto.estoque - quantidade;
  const { error: updateError } = await window.supabase
    .from("produtos")
    .update({ estoque: novoEstoque })
    .eq("id", produtoId);

  if (updateError) {
    window.exibirMensagem(
      `Erro ao atualizar estoque do produto: ${updateError.message}`,
      "error"
    );
    console.error(
      "Erro ao atualizar estoque do produto no Supabase:",
      updateError
    );
    return;
  }

  // Registrar movimentação (ainda no LocalStorage por enquanto, mas prepararemos para o DB)
  const novaMovimentacao = {
    id:
      window.movimentacoes.length > 0
        ? Math.max(...window.movimentacoes.map((m) => m.id)) + 1
        : 1, // ID temporário
    timestamp: new Date().toISOString(),
    data: dataSaida,
    tipo: "venda",
    produtoId: produto.id,
    produtoNome: produto.nome,
    quantidade: quantidade,
    unidade: produto.unidade,
    clienteId: cliente.id,
    clienteNome: cliente.nome,
    motivo: motivo,
  };
  window.movimentacoes.push(novaMovimentacao);
  window.salvarDados(); // Isso salva movimentações no localStorage (por enquanto)

  window.exibirMensagem(
    `Saída/Venda de ${quantidade.toFixed(2)} ${produto.unidade} de ${
      produto.nome
    } para ${cliente.nome} registrada com sucesso!`,
    "success"
  );
  await window.carregarDados(); // Recarrega produtos para atualizar o estoque na tabela
  renderizarProdutos();
  cancelarSaidaProduto();
}
