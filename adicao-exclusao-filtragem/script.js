const API = "http://localhost:3000/problemas";

// Mapeamento das categorias
const categorias = {
  1: "Buraco",
  2: "Vazamento",
  3: "Rachadura"
};

// ==============================
// Carregar problemas
// ==============================

function carregarProblemas(url = API) {

  fetch(url)

    .then(resposta => resposta.json())

    .then(problemas => {

      const lista = document.getElementById("lista");

      // Limpa lista antes de renderizar
      lista.innerHTML = "";

      // Percorre os problemas
      problemas.forEach(problema => {

        // Cria item da lista
        const item = document.createElement("li");

        // Classes Bootstrap
        item.classList.add(
          "list-group-item",
          "d-flex",
          "justify-content-between",
          "align-items-center"
        );

        // Conteúdo do item
        item.innerHTML = `
          <div>

            <strong>${problema.titulo}</strong>

            <br>

            ${problema.descricao}

            <br>

            <small class="text-secondary">
              Tipo: ${categorias[problema.categoriaId]}
            </small>

          </div>

          <button
            class="btn btn-danger btn-sm"
            onclick="excluir(${problema.id})"
          >
            Excluir
          </button>
        `;

        // Adiciona item na lista
        lista.appendChild(item);

      });

    })

    .catch(erro => {
      console.log("Erro ao carregar problemas:", erro);
    });

}

// ==============================
// Adicionar problema
// ==============================

function adicionar() {

  const titulo = document
    .getElementById("titulo")
    .value
    .trim();

  const descricao = document
    .getElementById("descricao")
    .value
    .trim();

  const categoriaId = Number(
    document.getElementById("categoria").value
  );

  // Validação simples
  if (!titulo || !descricao) {

    alert("Preencha todos os campos!");

    return;
  }

  // Objeto do problema
  const novoProblema = {

    titulo,
    descricao,
    categoriaId,
    status: "aberto",
    data: new Date().toLocaleDateString()

  };

  // Requisição POST
  fetch(API, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(novoProblema)

  })

    .then(() => {

      carregarProblemas();

      limparCampos();

    })

    .catch(erro => {
      console.log("Erro ao adicionar:", erro);
    });

}

// ==============================
// Excluir problema
// ==============================

function excluir(id) {

  const confirmar = confirm(
    "Deseja realmente excluir esta ocorrência?"
  );

  if (!confirmar) return;

  fetch(`${API}/${id}`, {

    method: "DELETE"

  })

    .then(() => {
      carregarProblemas();
    })

    .catch(erro => {
      console.log("Erro ao excluir:", erro);
    });

}

// ==============================
// Filtrar problemas
// ==============================

function filtrar(categoriaId) {

  carregarProblemas(
    `${API}?categoriaId=${categoriaId}`
  );

}

// ==============================
// Mostrar todos
// ==============================

function mostrarTodos() {

  carregarProblemas();

}

// ==============================
// Limpar campos
// ==============================

function limparCampos() {

  document.getElementById("titulo").value = "";

  document.getElementById("descricao").value = "";

}

// ==============================
// Inicialização
// ==============================

carregarProblemas();