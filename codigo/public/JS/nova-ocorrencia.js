document.addEventListener("DOMContentLoaded", function () {
  const inputEndereco = document.querySelector('input[type="text"]');
  const selectTipo = document.querySelectorAll("select")[0];
  const selectPrioridade = document.querySelectorAll("select")[1];
  const descricaoOcorrencia = document.querySelector("textarea");

  const btnBuscarEndereco = document.querySelectorAll(".btn-mongodb-primary")[0];
  const btnRegistrarOcorrencia = document.querySelectorAll(".btn-mongodb-primary")[1];

  const mapa = L.map("mapa").setView([-19.9167, -43.9345], 12);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapa);

  let latitude = null;
  let longitude = null;

  mapa.on("click", function (evento) {
    latitude = evento.latlng.lat;
    longitude = evento.latlng.lng;

    L.marker([latitude, longitude]).addTo(mapa);

    console.log("Localização:", latitude, longitude);
  });

  btnBuscarEndereco.addEventListener("click", buscarEndereco);
  btnRegistrarOcorrencia.addEventListener("click", registrarOcorrencia);

  function buscarEndereco() {
    console.log("Endereço:", inputEndereco.value);
  }

  function registrarOcorrencia() {
    const ocorrencia = {
      endereco: inputEndereco.value,
      tipo: selectTipo.value,
      prioridade: selectPrioridade.value,
      descricao: descricaoOcorrencia.value,
      latitude: latitude,
      longitude: longitude
    };

    console.log(ocorrencia);
    alert("Ocorrência registrada!");
  }
});