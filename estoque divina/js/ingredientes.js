// js/ingredientes.js

document.addEventListener("DOMContentLoaded", () => {
  // A renderização inicial agora será chamada após os dados serem carregados do Supabase em main.js
  // A função carregarDados de main.js já atualiza window.materiasPrimas.
  // Assim, não chamamos renderizarMateriasPrimas() diretamente aqui.
  renderizarMateriasPrimas(); // Chamando aqui após DOMContentLoaded, pois main.js já disparou carregarDados.

  // --- Listeners para os botões principais de Ação ---
  const btnAdicionarMateriaPrima = document.querySelector(
    ".action-buttons .btn-primary"
  );
  if (btnAdicionarMateriaPrima) {
    btnAdicionarMateriaPrima.addEventListener("click", adicionarMateriaPrima);
  }

  const btnRegistrarEntrada = document.getElementById("btnRegistrarEntrada");
  if (btnRegistrarEntrada) {
    btnRegistrarEntrada.addEventListener("click", mostrarFormEntradaMP);
  }

  const btnRegistrarSaidaMateriaPrima = document.getElementById(
    "btnRegistrarSaidaMateriaPrima"
  );
  if (btnRegistrarSaidaMateriaPrima) {
    btnRegistrarSaidaMateriaPrima.addEventListener("click", mostrarFormSaidaMP);
  }

  // --- Listeners para os botões de Salvar/Confirmar (dentro dos formulários) ---

  // Botão Salvar Matéria-Prima (do formulário de adicionar/editar MP)
  const btnSalvarMateriaPrima = document.getElementById(
    "btnSalvarMateriaPrima"
  );
  if (btnSalvarMateriaPrima) {
    btnSalvarMateriaPrima.addEventListener("click", salvarMateriaPrima);
  } else {
    console.warn("Botão #btnSalvarMateriaPrima não encontrado no DOM.");
  }

  // Botão Confirmar Entrada (do formulário de entrada MP)
  const btnConfirmarEntradaMP = document.getElementById(
    "btnConfirmarEntradaMP"
  );
  if (btnConfirmarEntradaMP) {
    btnConfirmarEntradaMP.addEventListener(
      "click",
      registrarEntradaMateriaPrima
    );
  } else {
    console.warn("Botão #btnConfirmarEntradaMP não encontrado no DOM.");
  }

  // Botão Confirmar Saída (do formulário de saída MP)
  const btnConfirmarSaidaMP = document.getElementById("btnConfirmarSaidaMP");
  if (btnConfirmarSaidaMP) {
    btnConfirmarSaidaMP.addEventListener("click", registrarSaidaMateriaPrima);
  } else {
    console.warn("Botão #btnConfirmarSaidaMP não encontrado no DOM.");
  }

  // --- Define a data atual como padrão nos campos de data ---
  document.getElementById("dataEntrada").valueAsDate = new Date();
  document.getElementById("dataSaidaMP").valueAsDate = new Date();
});

// ===========================================================================
// FUNÇÕES DE EXIBIÇÃO/OCULTAÇÃO DE FORMULÁRIOS
// ===========================================================================

function adicionarMateriaPrima() {
  document.getElementById("form-materia-prima").style.display = "block";
  document.getElementById("form-entrada-mp").style.display = "none";
  document.getElementById("form-saida-mp").style.display = "none";
  document.getElementById("materiaPrimaId").value = "";
  document.getElementById("materiaPrimaForm").reset();
  document.getElementById("estoqueMateriaPrimaInicial").value = "0";
}

function cancelarEdicaoMateriaPrima() {
  document.getElementById("form-materia-prima").style.display = "none";
  document.getElementById("materiaPrimaForm").reset();
}

function mostrarFormEntradaMP() {
  document.getElementById("form-entrada-mp").style.display = "block";
  document.getElementById("form-materia-prima").style.display = "none";
  document.getElementById("form-saida-mp").style.display = "none";
  document.getElementById("entradaMateriaPrimaForm").reset();
  popularSelectMateriasPrimasEntrada();
  document.getElementById("unidadeQuantidadeEntrada").textContent = "";
  document.getElementById("dataEntrada").valueAsDate = new Date();
}

function cancelarEntradaMateriaPrima() {
  document.getElementById("form-entrada-mp").style.display = "none";
  document.getElementById("entradaMateriaPrimaForm").reset();
  document.getElementById("unidadeQuantidadeEntrada").textContent = "";
}

function mostrarFormSaidaMP() {
  document.getElementById("form-saida-mp").style.display = "block";
  document.getElementById("form-materia-prima").style.display = "none";
  document.getElementById("form-entrada-mp").style.display = "none";
  document.getElementById("saidaMateriaPrimaForm").reset();
  popularSelectMateriasPrimasSaida();
  document.getElementById("unidadeQuantidadeSaidaMP").textContent = "";
  document.getElementById("dataSaidaMP").valueAsDate = new Date();
}

function cancelarSaidaMateriaPrima() {
  document.getElementById("form-saida-mp").style.display = "none";
  document.getElementById("saidaMateriaPrimaForm").reset();
  document.getElementById("unidadeQuantidadeSaidaMP").textContent = "";
}

// ===========================================================================
// FUNÇÕES DE RENDENIZAÇÃO DA TABELA DE MATÉRIAS-PRIMAS
// ===========================================================================

// Renderiza a tabela de matérias-primas (AGORA USANDO DADOS SUPABASE)
async function renderizarMateriasPrimas() {
  // AGORA É ASYNC
  console.log("-> renderizarMateriasPrimas() chamado.");

  const tbody = document.querySelector("#tabela-materias-primas tbody");
  if (!tbody) {
    console.error(
      "Elemento 'tabela-materias-primas tbody' não encontrado no DOM."
    );
    return;
  }

  tbody.innerHTML = "";

  // Carrega matérias-primas do Supabase (para garantir dados mais recentes)
  let { data: materiasPrimasData, error: materiasPrimasError } =
    await window.supabase // Usa o cliente Supabase global
      .from("materias_primas") // Nome da sua tabela no Supabase
      .select("*");
  if (materiasPrimasError) {
    console.error(
      "Erro ao carregar matérias-primas para renderização:",
      materiasPrimasError.message
    );
    window.exibirMensagem(
      "Erro ao carregar matérias-primas do servidor.",
      "error"
    );
    return;
  }
  window.materiasPrimas = materiasPrimasData; // Atualiza a array global com os dados do DB

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
      row.insertCell().textContent = mp.id.substring(0, 8) + "..."; // Encurta UUID para exibição
      row.insertCell().textContent = mp.nome;
      row.insertCell().textContent = mp.unidade;
      const estoqueFormatado =
        mp.estoque !== undefined && mp.estoque !== null
          ? mp.estoque.toFixed(2)
          : "0.00";
      row.insertCell().textContent = estoqueFormatado;

      const acoesCell = row.insertCell();

      const editarBtn = document.createElement("button");
      editarBtn.textContent = "Editar";
      editarBtn.type = "button";
      editarBtn.onclick = () => editarMateriaPrima(mp.id);
      acoesCell.appendChild(editarBtn);

      const excluirBtn = document.createElement("button");
      excluirBtn.textContent = "Excluir";
      excluirBtn.type = "button";
      excluirBtn.classList.add("btn-excluir");
      excluirBtn.onclick = () => excluirMateriaPrima(mp.id);
      acoesCell.appendChild(excluirBtn);
    });
    console.log("Tabela de matérias-primas renderizada com itens.");
  } else {
    const row = tbody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 5;
    cell.textContent = "Nenhuma matéria-prima cadastrada.";
    cell.style.textAlign = "center";
    console.warn("Nenhuma matéria-prima disponível para renderizar.");
  }
}

// Popula o select de matérias-primas no formulário de ENTRADA
async function popularSelectMateriasPrimasEntrada() {
  // AGORA É ASYNC
  const select = document.getElementById("selectMateriaPrimaEntrada");
  if (!select) {
    console.error("Elemento 'selectMateriaPrimaEntrada' não encontrado.");
    return;
  }

  select.innerHTML = '<option value="">Selecione a matéria-prima</option>';
  // Garante que window.materiasPrimas está atualizado antes de popular
  let { data: materiasData, error: materiasError } = await window.supabase
    .from("materias_primas")
    .select("*");
  if (materiasError) {
    console.error(
      "Erro ao carregar matérias-primas para select de entrada:",
      materiasError.message
    );
    return;
  }
  window.materiasPrimas = materiasData; // Atualiza array global

  if (window.materiasPrimas && window.materiasPrimas.length > 0) {
    const materiasPrimasOrdenadas = [...window.materiasPrimas].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
    materiasPrimasOrdenadas.forEach((mp) => {
      const option = document.createElement("option");
      option.value = mp.id;
      option.textContent = mp.nome;
      option.dataset.unidade = mp.unidade;
      select.appendChild(option);
    });
    console.log("Dropdown de matérias-primas para entrada populado.");
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhuma matéria-prima cadastrada.";
    option.disabled = true;
    select.appendChild(option);
    console.warn("Nenhuma matéria-prima para popular o dropdown de entrada.");
  }
}

// Popula o select de matérias-primas no formulário de SAÍDA
async function popularSelectMateriasPrimasSaida() {
  // AGORA É ASYNC
  const select = document.getElementById("selectMateriaPrimaSaida");
  if (!select) {
    console.error("Elemento 'selectMateriaPrimaSaida' não encontrado.");
    return;
  }

  select.innerHTML = '<option value="">Selecione a matéria-prima</option>';
  // Garante que window.materiasPrimas está atualizado antes de popular
  let { data: materiasData, error: materiasError } = await window.supabase
    .from("materias_primas")
    .select("*");
  if (materiasError) {
    console.error(
      "Erro ao carregar matérias-primas para select de saída:",
      materiasError.message
    );
    return;
  }
  window.materiasPrimas = materiasData; // Atualiza array global

  if (window.materiasPrimas && window.materiasPrimas.length > 0) {
    const materiasPrimasOrdenadas = [...window.materiasPrimas].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
    materiasPrimasOrdenadas.forEach((mp) => {
      const option = document.createElement("option");
      option.value = mp.id;
      option.textContent = `${mp.nome} (Estoque: ${mp.estoque.toFixed(2)} ${
        mp.unidade
      })`; // Exibe estoque no nome
      option.dataset.unidade = mp.unidade;
      option.dataset.estoque = mp.estoque;
      select.appendChild(option);
    });
    console.log("Dropdown de matérias-primas para saída populado.");
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Nenhuma matéria-prima cadastrada.";
    option.disabled = true;
    select.appendChild(option);
    console.warn("Nenhuma matéria-prima para popular o dropdown de saída.");
  }
}

function atualizarUnidadeEntrada() {
  const select = document.getElementById("selectMateriaPrimaEntrada");
  const unidadeSpan = document.getElementById("unidadeQuantidadeEntrada");

  if (select && unidadeSpan) {
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.value !== "") {
      unidadeSpan.textContent = selectedOption.dataset.unidade || "";
    } else {
      unidadeSpan.textContent = "";
    }
  }
}

function atualizarUnidadeSaidaMP() {
  const select = document.getElementById("selectMateriaPrimaSaida");
  const unidadeSpan = document.getElementById("unidadeQuantidadeSaidaMP");

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
// FUNÇÕES DE CRUD DE MATÉRIAS-PRIMAS (AGORA PARA SUPABASE)
// ===========================================================================

async function salvarMateriaPrima() {
  // AGORA É ASYNC
  console.log("-> salvarMateriaPrima() chamado.");
  const id = document.getElementById("materiaPrimaId").value; // ID pode ser UUID
  const nome = document.getElementById("nomeMateriaPrima").value.trim();
  const unidade = document.getElementById("unidadeMateriaPrima").value.trim();
  const estoqueInicial = parseFloat(
    document.getElementById("estoqueMateriaPrimaInicial").value
  );

  if (!nome || !unidade) {
    window.exibirMensagem(
      "Por favor, preencha o nome e a unidade da matéria-prima.",
      "error"
    );
    return;
  }
  // A validação de estoque inicial é aplicada apenas se for uma NOVA adição (id vazio)
  if (!id && (isNaN(estoqueInicial) || estoqueInicial < 0)) {
    window.exibirMensagem(
      "Por favor, insira um valor válido para o estoque inicial (0 ou mais).",
      "error"
    );
    return;
  }

  let materiaPrimaData = { nome, unidade };
  let success = false;

  if (id) {
    // Edição de matéria-prima existente
    materiaPrimaData.id = id; // Supabase precisa do ID para upsert (UUID)
    const { error } = await window.supabase
      .from("materias_primas")
      .upsert(materiaPrimaData, { onConflict: "id" });
    if (error) {
      window.exibirMensagem(
        `Erro ao atualizar matéria-prima: ${error.message}`,
        "error"
      );
      console.error("Erro ao atualizar matéria-prima no Supabase:", error);
    } else {
      window.exibirMensagem("Matéria-prima atualizada com sucesso!", "success");
      success = true;
    }
  } else {
    // Adição de nova matéria-prima (Supabase gera o UUID para o ID)
    // O campo 'estoque' tem valor padrão no DB, mas podemos enviar o estoque inicial
    materiaPrimaData.estoque = estoqueInicial;
    const { data, error } = await window.supabase
      .from("materias_primas")
      .insert(materiaPrimaData)
      .select(); // .select() para retornar o inserido
    if (error) {
      window.exibirMensagem(
        `Erro ao adicionar matéria-prima: ${error.message}`,
        "error"
      );
      console.error("Erro ao adicionar matéria-prima no Supabase:", error);
    } else {
      window.exibirMensagem("Matéria-prima adicionada com sucesso!", "success");
      success = true;
    }
  }

  if (success) {
    // Recarrega os dados globais de matérias-primas do Supabase e renderiza a tabela
    await window.carregarDados(); // carregarDados já atualiza window.materiasPrimas
    renderizarMateriasPrimas();
    document.getElementById("form-materia-prima").style.display = "none";
    document.getElementById("materiaPrimaForm").reset();
  }
}

async function editarMateriaPrima(id) {
  // AGORA É ASYNC
  console.log("-> editarMateriaPrima() chamado para ID:", id);
  const mp = window.materiasPrimas.find((m) => m.id === id);
  if (mp) {
    console.log("   Matéria-prima encontrada para edição:", mp);
    document.getElementById("materiaPrimaId").value = mp.id;
    document.getElementById("nomeMateriaPrima").value = mp.nome;
    document.getElementById("unidadeMateriaPrima").value = mp.unidade;
    document.getElementById("estoqueMateriaPrimaInicial").value = mp.estoque;

    document.getElementById("form-materia-prima").style.display = "block";
    document.getElementById("form-entrada-mp").style.display = "none";
    document.getElementById("form-saida-mp").style.display = "none";
  } else {
    console.error("Matéria-prima com ID", id, "não encontrada para edição.");
    window.exibirMensagem("Matéria-prima não encontrada para edição.", "error");
    await window.carregarDados(); // Tente recarregar e buscar novamente
    const mpRecarregar = window.materiasPrimas.find((m) => m.id === id);
    if (mpRecarregar) {
      // Se encontrar após recarregar, tente editar novamente
      editarMateriaPrima(id);
    }
  }
}

async function excluirMateriaPrima(id) {
  // AGORA É ASYNC
  if (
    confirm(
      "Tem certeza que deseja excluir esta matéria-prima? Esta ação não pode ser desfeita."
    )
  ) {
    // Opcional: Verificar se a matéria-prima está em alguma receita no DB (quando migrado)
    const estaEmReceita = window.receitas.some((r) => r.ingredienteId === id);
    if (estaEmReceita) {
      if (
        !confirm(
          "Esta matéria-prima está sendo utilizada em uma ou mais receitas. Excluí-la pode afetar a integridade das receitas. Deseja continuar mesmo assim?"
        )
      ) {
        return;
      }
    }

    // Opcional: Verificar se a matéria-prima tem estoque no DB
    const materiaPrima = window.materiasPrimas.find((mp) => mp.id === id);
    if (materiaPrima && materiaPrima.estoque > 0) {
      if (
        !confirm(
          `Esta matéria-prima ainda possui ${materiaPrima.estoque.toFixed(2)} ${
            materiaPrima.unidade
          } em estoque. Excluí-la removerá o registro do estoque e do histórico. Deseja continuar?`
        )
      ) {
        return;
      }
    }

    // Excluir do Supabase
    const { error } = await window.supabase
      .from("materias_primas")
      .delete()
      .eq("id", id);

    if (error) {
      window.exibirMensagem(
        `Erro ao excluir matéria-prima: ${error.message}`,
        "error"
      );
      console.error("Erro ao excluir matéria-prima no Supabase:", error);
    } else {
      // Opcional: Remover movimentações relacionadas a esta matéria-prima (quando migrado)
      // window.movimentacoes = window.movimentacoes.filter(...);

      window.exibirMensagem("Matéria-prima excluída com sucesso!", "success");
      await window.carregarDados(); // Recarrega matérias-primas (e outros dados se necessário) do Supabase
      renderizarMateriasPrimas();
    }
  }
}

// ===========================================================================
// FUNÇÃO DE REGISTRO DE ENTRADA DE MATÉRIA-PRIMA (AGORA PARA SUPABASE)
// ===========================================================================

async function registrarEntradaMateriaPrima() {
  // AGORA É ASYNC
  const materiaPrimaId = document.getElementById(
    "selectMateriaPrimaEntrada"
  ).value; // ID é UUID
  const quantidade = parseFloat(
    document.getElementById("quantidadeEntrada").value
  );
  const dataEntrada = document.getElementById("dataEntrada").value;
  const motivo = document.getElementById("motivoEntrada").value.trim();

  if (!materiaPrimaId || isNaN(quantidade) || quantidade <= 0 || !dataEntrada) {
    window.exibirMensagem(
      "Por favor, selecione a matéria-prima, insira uma quantidade e uma data.",
      "error"
    );
    return;
  }

  const materiaPrima = window.materiasPrimas.find(
    (mp) => mp.id === materiaPrimaId
  ); // Busca por UUID
  if (!materiaPrima) {
    window.exibirMensagem(
      "Matéria-prima selecionada não encontrada no cadastro.",
      "error"
    );
    return;
  }

  // Atualiza o estoque no Supabase
  const novoEstoque = materiaPrima.estoque + quantidade;
  const { error: updateError } = await window.supabase
    .from("materias_primas")
    .update({ estoque: novoEstoque })
    .eq("id", materiaPrimaId);

  if (updateError) {
    window.exibirMensagem(
      `Erro ao registrar entrada: ${updateError.message}`,
      "error"
    );
    console.error("Erro ao atualizar estoque de MP no Supabase:", updateError);
    return;
  }

  // Registrar movimentação (ainda no LocalStorage, mas prepararemos para o DB)
  const novaMovimentacao = {
    id:
      window.movimentacoes.length > 0
        ? Math.max(...window.movimentacoes.map((m) => m.id)) + 1
        : 1, // ID temporário
    timestamp: new Date().toISOString(),
    data: dataEntrada,
    tipo: "entrada_materia",
    ingredienteId: materiaPrimaId,
    ingredienteNome: materiaPrima.nome,
    quantidade: quantidade,
    unidade: materiaPrima.unidade,
    motivo: motivo,
  };
  window.movimentacoes.push(novaMovimentacao);
  window.salvarDados(); // Salva no localStorage (por enquanto)

  window.exibirMensagem(
    `Entrada de ${quantidade.toFixed(2)} ${materiaPrima.unidade} de "${
      materiaPrima.nome
    }" registrada!`,
    "success"
  );
  await window.carregarDados(); // Recarrega matérias-primas para atualizar o estoque na tabela
  renderizarMateriasPrimas();
  cancelarEntradaMateriaPrima();
}

// ===========================================================================
// FUNÇÃO DE REGISTRO DE SAÍDA DE MATÉRIA-PRIMA (AGORA PARA SUPABASE)
// ===========================================================================

async function registrarSaidaMateriaPrima() {
  // AGORA É ASYNC
  const materiaPrimaId = document.getElementById(
    "selectMateriaPrimaSaida"
  ).value; // ID é UUID
  const quantidade = parseFloat(
    document.getElementById("quantidadeSaidaMP").value
  );
  const dataSaida = document.getElementById("dataSaidaMP").value;
  const motivo = document.getElementById("motivoSaidaMP").value.trim();

  if (
    !materiaPrimaId ||
    isNaN(quantidade) ||
    quantidade <= 0 ||
    !dataSaida ||
    !motivo
  ) {
    window.exibirMensagem(
      "Por favor, selecione a matéria-prima, insira uma quantidade, uma data e um motivo.",
      "error"
    );
    return;
  }

  const materiaPrima = window.materiasPrimas.find(
    (mp) => mp.id === materiaPrimaId
  ); // Busca por UUID
  if (!materiaPrima) {
    window.exibirMensagem(
      "Matéria-prima selecionada não encontrada no cadastro.",
      "error"
    );
    return;
  }

  if (materiaPrima.estoque < quantidade) {
    window.exibirMensagem(
      `Estoque insuficiente! Disponível: ${materiaPrima.estoque.toFixed(2)} ${
        materiaPrima.unidade
      }.`,
      "error"
    );
    return;
  }

  // Atualiza o estoque no Supabase
  const novoEstoque = materiaPrima.estoque - quantidade;
  const { error: updateError } = await window.supabase
    .from("materias_primas")
    .update({ estoque: novoEstoque })
    .eq("id", materiaPrimaId);

  if (updateError) {
    window.exibirMensagem(
      `Erro ao registrar saída: ${updateError.message}`,
      "error"
    );
    console.error("Erro ao atualizar estoque de MP no Supabase:", updateError);
    return;
  }

  // Registrar movimentação (ainda no LocalStorage, mas prepararemos para o DB)
  const novaMovimentacao = {
    id:
      window.movimentacoes.length > 0
        ? Math.max(...window.movimentacoes.map((m) => m.id)) + 1
        : 1, // ID temporário
    timestamp: new Date().toISOString(),
    data: dataSaida,
    tipo: "saida_materia",
    ingredienteId: materiaPrimaId,
    ingredienteNome: materiaPrima.nome,
    quantidade: quantidade,
    unidade: materiaPrima.unidade,
    motivo: motivo,
  };
  window.movimentacoes.push(novaMovimentacao);
  window.salvarDados(); // Salva no localStorage (por enquanto)

  window.exibirMensagem(
    `Saída de ${quantidade.toFixed(2)} ${materiaPrima.unidade} de "${
      materiaPrima.nome
    }" por "${motivo}" registrada!`,
    "success"
  );
  await window.carregarDados(); // Recarrega matérias-primas para atualizar o estoque na tabela
  renderizarMateriasPrimas();
  cancelarSaidaMateriaPrima();
}
