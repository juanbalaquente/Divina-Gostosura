// js/main.js

// --- CONFIGURAÇÃO SUPABASE ---
const SUPABASE_URL = "SUA_URL_DO_PROJETO_SUPABASE";
const SUPABASE_ANON_KEY = "SUA_CHAVE_ANON_SUPABASE";

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase client initialized:", supabase);
// ------------------------------------

// Variáveis globais para armazenar os dados do sistema
let produtosAcabados = [];
let materiasPrimas = [];
let receitas = [];
let movimentacoes = [];
let clientes = [];

// Chave para armazenar os dados no localStorage (ainda manteremos como fallback ou cache inicial)
const STORAGE_KEY_PRODUTOS = "produtosAcabados";
const STORAGE_KEY_MATERIAS = "materiasPrimas";
const STORAGE_KEY_RECEITAS = "receitas";
const STORAGE_KEY_MOVIMENTACOES = "movimentacoes";
const STORAGE_KEY_CLIENTES = "clientes";

// ===========================================================================
// FUNÇÕES DE CARREGAMENTO E SALVAMENTO DE DADOS (AGORA PARA SUPABASE)
// ===========================================================================

// Função para carregar dados do Supabase
async function carregarDados() {
  console.log("Tentando carregar dados do Supabase...");

  try {
    // Carregar Produtos Acabados
    let { data: produtosData, error: produtosError } = await supabase
      .from("produtos")
      .select("*");
    if (produtosError) throw produtosError;
    produtosAcabados = produtosData;
    console.log("Produtos Acabados carregados do Supabase:", produtosAcabados);

    // Carregar Matérias-Primas (AGORA DO SUPABASE)
    let { data: materiasData, error: materiasError } = await supabase
      .from("materias_primas") // Nome da sua tabela no Supabase
      .select("*");
    if (materiasError) throw materiasError;
    materiasPrimas = materiasData;
    console.log("Matérias-Primas carregadas do Supabase:", materiasPrimas);

    // Carregar Clientes
    let { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .select("*");
    if (clientesError) throw clientesError;
    clientes = clientesData;
    console.log("Clientes carregados do Supabase:", clientes);

    // --- Receitas (ainda não migradas) ---
    const storedReceitas = localStorage.getItem(STORAGE_KEY_RECEITAS);
    if (storedReceitas) {
      receitas = JSON.parse(storedReceitas);
    } else {
      receitas = [
        {
          id: 1001,
          produtoAcabadoId: 1,
          ingredientes: [
            {
              id: 101,
              nome: "Farinha de Trigo",
              quantidade: 0.5,
              unidade: "Kg",
            },
          ],
        },
      ];
    }
    console.log(
      "Receitas carregadas (provisoriamente do LocalStorage):",
      receitas
    );

    // --- Movimentações (ainda não migradas) ---
    const storedMovimentacoes = localStorage.getItem(STORAGE_KEY_MOVIMENTACOES);
    if (storedMovimentacoes) {
      movimentacoes = JSON.parse(storedMovimentacoes);
    } else {
      movimentacoes = [];
    }
    console.log(
      "Movimentações carregadas (provisoriamente do LocalStorage):",
      movimentacoes
    );

    console.log(
      "Carga de dados do Supabase concluída para tabelas migradas. Outros dados carregados do LocalStorage."
    );
  } catch (error) {
    console.error("Erro ao carregar dados do Supabase:", error.message);
    console.warn(
      "Falha ao carregar do Supabase. Tentando carregar do LocalStorage como fallback..."
    );
    carregarDadosFromLocalStorageFallback();
    window.exibirMensagem(
      `Erro ao carregar dados do servidor: ${error.message}. Carregando dados locais.`,
      "error"
    );
  }
}

// Função de fallback para carregar do LocalStorage (continua sendo importante)
function carregarDadosFromLocalStorageFallback() {
  produtosAcabados = JSON.parse(
    localStorage.getItem(STORAGE_KEY_PRODUTOS) || "[]"
  );
  materiasPrimas = JSON.parse(
    localStorage.getItem(STORAGE_KEY_MATERIAS) || "[]"
  );
  receitas = JSON.parse(localStorage.getItem(STORAGE_KEY_RECEITAS) || "[]");
  movimentacoes = JSON.parse(
    localStorage.getItem(STORAGE_KEY_MOVIMENTACOES) || "[]"
  );
  clientes = JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTES) || "[]");
  console.log("Dados carregados do LocalStorage (fallback).");
}

// Função genérica para salvar/operar dados no Supabase.
// Ela é um modelo, o CRUD real será feito diretamente em cada arquivo JS da página.
async function salvarDados(
  tableName,
  dataToSave,
  isDelete = false,
  idToDelete = null
) {
  console.log(`Iniciando salvamento/operação para a tabela ${tableName}...`);
  try {
    if (isDelete) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", idToDelete);
      if (error) throw error;
      console.log(
        `Item ID ${idToDelete} deletado de ${tableName} com sucesso!`
      );
    } else {
      const { data, error } = await supabase
        .from(tableName)
        .upsert(dataToSave, { onConflict: "id" });

      if (error) throw error;
      console.log(
        `Dados salvos/atualizados em ${tableName} com sucesso!`,
        data
      );
    }
    return { success: true };
  } catch (error) {
    console.error(
      `ERRO GRAVE ao salvar dados em ${tableName} no Supabase:`,
      error.message
    );
    alert(
      `Erro ao salvar dados no servidor para ${tableName}: ${error.message}. Os dados podem não ter sido salvos. Verifique o console.`
    );
    // Fallback: Salvar em localStorage se o Supabase falhar (para as arrays que ainda não foram migradas individualmente).
    // Isso é uma segurança temporária. Idealmente, cada arquivo JS cuidaria de seu próprio fallback.
    localStorage.setItem(
      STORAGE_KEY_PRODUTOS,
      JSON.stringify(produtosAcabados)
    );
    localStorage.setItem(STORAGE_KEY_MATERIAS, JSON.stringify(materiasPrimas));
    localStorage.setItem(STORAGE_KEY_RECEITAS, JSON.stringify(receitas));
    localStorage.setItem(
      STORAGE_KEY_MOVIMENTACOES,
      JSON.stringify(movimentacoes)
    );
    localStorage.setItem(STORAGE_KEY_CLIENTES, JSON.stringify(clientes));

    return { success: false, error: error.message };
  }
}

// ... (restante do main.js: exibirMensagem, DOMContentLoaded listener, etc.) ...
document.addEventListener("DOMContentLoaded", () => {
  carregarDados();
});

// Expõe as variáveis e funções para serem acessíveis por outros scripts
window.produtosAcabados = produtosAcabados;
window.materiasPrimas = materiasPrimas;
window.receitas = receitas;
window.movimentacoes = movimentacoes;
window.clientes = clientes;
window.salvarDados = salvarDados;
window.exibirMensagem = exibirMensagem;
window.supabase = supabase;

console.log("main.js carregado e variáveis expostas.");
