// js/clientes.js

document.addEventListener("DOMContentLoaded", () => {
  // A renderização inicial será chamada após os dados serem carregados do Supabase em main.js.
  // main.js dispara um evento 'dadosCarregados' após carregar os dados.
  document.addEventListener("dadosCarregados", renderizarClientes);

  // Adiciona listener para o botão "Adicionar Novo Cliente"
  const btnAdicionarCliente = document.querySelector(
    ".action-buttons .btn-primary"
  );
  if (btnAdicionarCliente) {
    btnAdicionarCliente.addEventListener("click", adicionarCliente);
  }

  // Adiciona listener para o botão "Salvar Cliente"
  const btnSalvarCliente = document.getElementById("btnSalvarCliente");
  if (btnSalvarCliente) {
    btnSalvarCliente.addEventListener("click", salvarCliente);
  }

  // Adiciona listener para o botão "Cancelar" no formulário de cliente
  const btnCancelarEdicaoCliente = document.querySelector(
    "#form-cliente .btn-secondary"
  );
  if (btnCancelarEdicaoCliente) {
    btnCancelarEdicaoCliente.addEventListener("click", cancelarEdicaoCliente);
  }
});

// ===========================================================================
// FUNÇÕES DE CLIENTES (CRUD AGORA PARA SUPABASE)
// ===========================================================================

// Renderiza a tabela de clientes
async function renderizarClientes() {
  console.log("-> renderizarClientes() chamado.");

  const tbody = document.querySelector("#tabela-clientes tbody");
  if (!tbody) {
    console.error("Elemento 'tabela-clientes tbody' não encontrado.");
    return;
  }

  tbody.innerHTML = ""; // Limpa a tabela

  // Carrega clientes do Supabase (para garantir dados mais recentes)
  const { data: clientesData, error: clientesError } = await window.supabase
    .from("clientes")
    .select("*")
    .order("nome", { ascending: true }); // Ordena por nome diretamente no DB

  if (clientesError) {
    console.error(
      "Erro ao carregar clientes para renderização:",
      clientesError.message
    );
    window.exibirMensagem("Erro ao carregar clientes do servidor.", "error");
    return;
  }
  window.clientes = clientesData; // Atualiza a array global com os dados do DB

  if (window.clientes && window.clientes.length > 0) {
    window.clientes.forEach((cliente) => {
      const row = tbody.insertRow();
      row.insertCell().textContent = cliente.id.substring(0, 8) + "..."; // Encurta UUID para exibição
      row.insertCell().textContent = cliente.nome;
      row.insertCell().textContent = cliente.telefone;
      row.insertCell().textContent = cliente.email;
      row.insertCell().textContent = `${cliente.endereco}, ${cliente.bairro}`;
      row.insertCell().textContent = `${cliente.cidade}/${cliente.estado}`;

      const actionsCell = row.insertCell();
      actionsCell.classList.add("actions");

      const editButton = document.createElement("button");
      editButton.textContent = "Editar";
      editButton.type = "button"; // Garante que não submeta o form
      editButton.classList.add("edit-btn");
      editButton.onclick = () => editarCliente(cliente.id);
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Excluir";
      deleteButton.type = "button"; // Garante que não submeta o form
      deleteButton.classList.add("delete-btn");
      deleteButton.onclick = () => excluirCliente(cliente.id);
      actionsCell.appendChild(deleteButton);
    });
    console.log("Tabela de clientes renderizada com sucesso.");
  } else {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 7;
    cell.textContent = "Nenhum cliente cadastrado.";
    cell.style.textAlign = "center";
    console.warn("Nenhum cliente disponível para renderizar.");
  }
}

// Exibe o formulário para adicionar um novo cliente
function adicionarCliente() {
  document.getElementById("form-cliente").style.display = "block";
  document.getElementById("clienteId").value = ""; // Limpa para nova adição
  document.getElementById("clienteForm").reset(); // Limpa os campos
  document.getElementById("historico-compras-cliente").style.display = "none"; // Esconde histórico
}

// Cancela a edição/adição e esconde o formulário
function cancelarEdicaoCliente() {
  document.getElementById("form-cliente").style.display = "none";
  document.getElementById("clienteForm").reset();
  document.getElementById("historico-compras-cliente").style.display = "none";
}

// Salva (adiciona ou edita) um cliente no Supabase
async function salvarCliente() {
  const id = document.getElementById("clienteId").value; // Se vazio, é nova inserção
  const nome = document.getElementById("nomeCliente").value.trim();
  const telefone = document.getElementById("telefoneCliente").value.trim();
  const email = document.getElementById("emailCliente").value.trim();
  const endereco = document.getElementById("enderecoCliente").value.trim();
  const bairro = document.getElementById("bairroCliente").value.trim();
  const cidade = document.getElementById("cidadeCliente").value.trim();
  const estado = document
    .getElementById("estadoCliente")
    .value.trim()
    .toUpperCase();
  const cep = document.getElementById("cepCliente").value.trim();

  // Validação básica
  if (!nome || !telefone || !endereco || !bairro || !cidade || !estado) {
    window.exibirMensagem(
      "Por favor, preencha os campos obrigatórios (Nome, Telefone, Endereço, Bairro, Cidade, Estado).",
      "error"
    );
    return;
  }

  // Objeto de dados para enviar ao Supabase (nomes de colunas do DB)
  const clienteData = {
    nome: nome,
    telefone: telefone,
    email: email,
    endereco: endereco,
    bairro: bairro,
    cidade: cidade,
    estado: estado,
    cep: cep,
  };

  let success = false;

  if (id) {
    // Se tem ID, é uma atualização
    clienteData.id = id; // Adiciona o ID ao objeto para o upsert
    const { error } = await window.supabase
      .from("clientes")
      .upsert(clienteData, { onConflict: "id" });
    if (error) {
      window.exibirMensagem(
        `Erro ao atualizar cliente: ${error.message}`,
        "error"
      );
      console.error("Erro ao atualizar cliente no Supabase:", error);
    } else {
      window.exibirMensagem("Cliente atualizado com sucesso!", "success");
      success = true;
    }
  } else {
    // Se não tem ID, é uma nova inserção
    const { data, error } = await window.supabase
      .from("clientes")
      .insert(clienteData)
      .select(); // .select() para retornar o cliente inserido com o ID gerado
    if (error) {
      window.exibirMensagem(
        `Erro ao cadastrar cliente: ${error.message}`,
        "error"
      );
      console.error("Erro ao cadastrar cliente no Supabase:", error);
    } else {
      window.exibirMensagem("Cliente cadastrado com sucesso!", "success");
      success = true;
    }
  }

  if (success) {
    // Recarrega os dados globais do cliente do Supabase e renderiza a tabela
    await window.carregarDados(); // Chama a função carregarDados de main.js para atualizar window.clientes
    renderizarClientes(); // Re-renderiza a tabela para exibir as alterações
    cancelarEdicaoCliente(); // Esconde e limpa o formulário
  }
}

// Preenche o formulário para edição de um cliente e carrega seu histórico de compras
async function editarCliente(id) {
  const cliente = window.clientes.find((c) => c.id === id); // Busca na array global (atualizada do Supabase)
  if (cliente) {
    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("nomeCliente").value = cliente.nome;
    document.getElementById("telefoneCliente").value = cliente.telefone;
    document.getElementById("emailCliente").value = cliente.email;
    document.getElementById("enderecoCliente").value = cliente.endereco;
    document.getElementById("bairroCliente").value = cliente.bairro;
    document.getElementById("cidadeCliente").value = cliente.cidade;
    document.getElementById("estadoCliente").value = cliente.estado;
    document.getElementById("cepCliente").value = cliente.cep;
    document.getElementById("form-cliente").style.display = "block"; // Exibe o formulário
    window.exibirMensagem(`Editando cliente: ${cliente.nome}`, "success");

    // Carrega e exibe o histórico de compras para este cliente
    // renderizarHistoricoComprasCliente busca diretamente do Supabase a cada chamada
    await renderizarHistoricoComprasCliente(cliente.id);
    document.getElementById("historico-compras-cliente").style.display =
      "block";
  } else {
    window.exibirMensagem("Cliente não encontrado para edição.", "error");
    // Tente recarregar para ter certeza que a array global está atualizada
    await window.carregarDados();
    const clienteRecarregar = window.clientes.find((c) => c.id === id);
    if (clienteRecarregar) {
      // Se encontrar após recarregar, tente editar novamente
      editarCliente(id);
    }
  }
}

// Exclui um cliente do Supabase
async function excluirCliente(id) {
  if (
    confirm(
      "Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
    )
  ) {
    // Opcional: Verificar se o cliente tem vendas associadas no DB
    // Isso exigiria uma query extra para movimentacoes. Melhor fazer isso no DB com RLS ou triggers.

    // Excluir do Supabase
    const { error } = await window.supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      window.exibirMensagem(
        `Erro ao excluir cliente: ${error.message}`,
        "error"
      );
      console.error("Erro ao excluir cliente no Supabase:", error);
    } else {
      // Opcional: Remover as movimentações de venda associadas a este cliente no DB (se houver CASCADE ou Trigger)
      // Caso contrário, essas movimentações no DB ficarão órfãs de cliente, mas ainda existirão.
      // Para manter a consistência do frontend, podemos filtrá-las da array local.
      window.movimentacoes = window.movimentacoes.filter(
        (mov) => !(mov.tipo === "venda" && mov.cliente_id === id)
      ); // Usa cliente_id da DB

      window.exibirMensagem("Cliente excluído com sucesso!", "success");
      // Recarrega clientes do Supabase (e outros dados se necessário) e renderiza a tabela
      await window.carregarDados();
      renderizarClientes();
    }
  }
}

// ===========================================================================
// FUNÇÕES DE HISTÓRICO DE COMPRAS DO CLIENTE
// ===========================================================================

// Renderiza o histórico de compras para um cliente específico
async function renderizarHistoricoComprasCliente(clientId) {
  const tbody = document.querySelector(
    "#tabela-historico-compras-cliente tbody"
  );
  if (!tbody) {
    console.error(
      "Elemento 'tabela-historico-compras-cliente tbody' não encontrado."
    );
    return;
  }

  tbody.innerHTML = ""; // Limpa a tabela

  // Carrega movimentações de venda do Supabase para o cliente específico
  const { data: comprasData, error: comprasError } = await window.supabase
    .from("movimentacoes")
    .select("*")
    .eq("tipo", "venda")
    .eq("cliente_id", clientId) // Usa o nome da coluna do DB
    .order("timestamp", { ascending: false }); // Ordena por data mais recente

  if (comprasError) {
    console.error(
      "Erro ao carregar histórico de compras do cliente:",
      comprasError.message
    );
    window.exibirMensagem(
      "Erro ao carregar histórico de compras do cliente.",
      "error"
    );
    return;
  }

  const comprasDoCliente = comprasData;

  if (comprasDoCliente.length > 0) {
    comprasDoCliente.forEach((compra) => {
      const row = tbody.insertRow();
      row.insertCell().textContent = compra.data;
      row.insertCell().textContent = compra.produto_nome; // Usa o nome da coluna do DB
      row.insertCell().textContent = compra.quantidade.toFixed(2);
      row.insertCell().textContent = compra.unidade;
      row.insertCell().textContent = compra.motivo || "Venda Registrada";
    });
    console.log(
      `Histórico de compras para cliente ID ${clientId} renderizado. Total de ${comprasDoCliente.length} compras.`
    );
  } else {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.textContent = "Nenhuma compra registrada para este cliente ainda.";
    cell.style.textAlign = "center";
    console.log(`Nenhuma compra encontrada para cliente ID ${clientId}.`);
  }
}
