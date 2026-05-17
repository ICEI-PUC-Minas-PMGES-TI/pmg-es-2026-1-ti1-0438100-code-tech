// ADICIONAR OCORRENCIA
function adicionarOcorrencia() {

  // CAMPOS
  const endereco =
    document.getElementById(
      "endereco"
    ).value;

  const bairro =
    document.getElementById(
      "bairro"
    ).value;

  const tipo =
    document.getElementById(
      "tipo"
    ).value;

  const prioridade =
    document.getElementById(
      "prioridade"
    ).value;

  const descricao =
    document.getElementById(
      "descricao"
    ).value;

  // VALIDACAO
  if (

    endereco === "" ||

    bairro === "" ||

    descricao === ""

  ) {

    alert(
      "Preencha todos os campos"
    );

    return;

  }

  // NOVA OCORRENCIA
  const novaOcorrencia = {

    id: Date.now(),

    endereco: endereco,

    bairro: bairro,

    tipo: tipo,

    prioridade: prioridade,

    descricao: descricao,

    status: "Pendente",

    data: new Date()
      .toLocaleDateString(),

    latitude: -19.916,

    longitude: -43.934

  };

  // ENVIAR
  fetch(
    "http://localhost:3000/ocorrencias",
    {

      method: "POST",

      headers: {

        "Content-Type":
          "application/json"

      },

      body: JSON.stringify(
        novaOcorrencia
      )

    }
  )

  .then(response =>
    response.json()
  )

  .then(() => {

    alert(
      "Ocorrência cadastrada!"
    );

    window.location.href =
      "ocorrencias.html";

  })

  .catch(error => {

    console.log(error);

    alert(
      "Erro ao cadastrar"
    );

  });

}