document.addEventListener("DOMContentLoaded", () => {
  const botaoCadastrar = document.getElementById("btnCadastrar");

  botaoCadastrar.addEventListener("click", cadastrarOcorrencia);
});

function cadastrarOcorrencia() {
  const endereco = document.getElementById("endereco").value.trim();
  const bairro = document.getElementById("bairro").value.trim();
  const tipo = document.getElementById("tipo").value;
  const prioridade = document.getElementById("prioridade").value;
  const descricao = document.getElementById("descricao").value.trim();

  if (endereco === "" || bairro === "" || descricao === "") {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  const ocorrencia = {
    id: Date.now(),
    tipo: tipo,
    endereco: endereco,
    bairro: bairro,
    data: new Date().toLocaleDateString("pt-BR"),
    status: "Pendente",
    prioridade: prioridade,
    descricao: descricao,
    curtidas: 0,
    latitude: -19.916,
    longitude: -43.934
  };

  const ocorrencias =
    JSON.parse(localStorage.getItem("ocorrencias")) || [];

  ocorrencias.push(ocorrencia);

  localStorage.setItem(
    "ocorrencias",
    JSON.stringify(ocorrencias)
  );

  alert("Ocorrência cadastrada com sucesso!");

  window.location.href = "ocorrencias.html";
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");

  sidebar.classList.toggle("sidebar-open");
}

function selecionarTipoNova(valor, texto) {
  document.getElementById("tipo").value = valor;
  document.getElementById("textoTipo").innerText = texto;
}

function selecionarPrioridadeNova(valor, texto) {
  document.getElementById("prioridade").value = valor;
  document.getElementById("textoPrioridade").innerText = texto;
}