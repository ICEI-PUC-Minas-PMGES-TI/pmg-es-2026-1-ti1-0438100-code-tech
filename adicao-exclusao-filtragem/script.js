const API = "http://localhost:3000/problemas";

// Mapeamento das categorias (para mostrar o nome)
const categorias = {
  1: "Buraco",
  2: "Vazamento",
  3: "Rachadura"
};

// Carrega e mostra os problemas na tela
function carregarProblemas(url = API) {
  fetch(url)
    .then(res => res.json())
    .then(problemas => {
      const lista = document.getElementById("lista");
      lista.innerHTML = "";

      problemas.forEach(problema => {
        const item = document.createElement("li");

        item.innerHTML = `
          <strong>${problema.titulo}</strong> - ${problema.descricao}
          <br>
          Tipo: ${categorias[problema.categoriaId]} | Status: ${problema.status}
          <br>
          <button onclick="excluir(${problema.id})">Excluir</button>
        `;

        lista.appendChild(item);
      });
    })
    .catch(erro => console.log("Erro ao carregar:", erro));
}

// Adiciona um novo problema
function adicionar() {
  const titulo = document.getElementById("titulo").value.trim();
  const descricao = document.getElementById("descricao").value.trim();
  const categoriaId = Number(document.getElementById("categoria").value);

  if (!titulo || !descricao) {
    alert("Preencha todos os campos!");
    return;
  }

  const novoProblema = {
    titulo,
    descricao,
    categoriaId,
    status: "aberto",
    data: new Date().toLocaleDateString()
  };

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
  .catch(erro => console.log("Erro ao adicionar:", erro));
}

// Remove um problema
function excluir(id) {
  const confirmar = confirm("Deseja realmente excluir?");
  if (!confirmar) return;

  fetch(`${API}/${id}`, {
    method: "DELETE"
  })
  .then(() => carregarProblemas())
  .catch(erro => console.log("Erro ao excluir:", erro));
}

// Filtra por categoria
function filtrar(categoriaId) {
  carregarProblemas(`${API}?categoriaId=${categoriaId}`);
}

// Mostra todos novamente
function mostrarTodos() {
  carregarProblemas();
}

// Limpa os inputs
function limparCampos() {
  document.getElementById("titulo").value = "";
  document.getElementById("descricao").value = "";
}

// Inicialização
carregarProblemas();