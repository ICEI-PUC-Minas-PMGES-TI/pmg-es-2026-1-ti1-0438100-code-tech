document.addEventListener("DOMContentLoaded", () => {

  const botaoCadastrar =
    document.getElementById("btnCadastrar");

  botaoCadastrar.addEventListener(
    "click",
    cadastrarOcorrencia
  );

});

function cadastrarOcorrencia() {

  const endereco =
    document.getElementById("endereco").value;

  const tipo =
    document.getElementById("tipo").value;

  const prioridade =
    document.getElementById("prioridade").value;

  const descricao =
    document.getElementById("descricao").value;

  if (
    endereco === "" ||
    descricao === ""
  ) {

    alert(
      "Preencha todos os campos!"
    );

    return;

  }

  const ocorrencia = {

  id: Date.now(),

  tipo: tipo,

  endereco: endereco,

  bairro: "Não informado",

  data: new Date()
    .toLocaleDateString("pt-BR"),

  status: "Pendente",

  prioridade: prioridade,

  descricao: descricao,

  curtidas: 0

};

  let ocorrencias =
    JSON.parse(
      localStorage.getItem(
        "ocorrencias"
      )
    ) || [];

  ocorrencias.push(ocorrencia);

  localStorage.setItem(
    "ocorrencias",
    JSON.stringify(ocorrencias)
  );

  alert(
    "Ocorrência cadastrada com sucesso!"
  );

  window.location.href =
    "ocorrencias.html";

}