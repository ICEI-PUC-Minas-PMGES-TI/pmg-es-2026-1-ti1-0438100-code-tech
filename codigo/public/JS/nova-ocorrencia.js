document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("formOcorrencia");
  const endereco = document.getElementById("endereco");
  const tipo = document.getElementById("tipo");
  const descricao = document.getElementById("descricao");
  const coordenadas = document.getElementById("coordenadas");
  const progress = document.getElementById("progress");
  const progressBar = document.getElementById("progressBar");
  const dragDrop = document.getElementById("dragDrop");
  const inputFotos = document.getElementById("inputFotos");
  const fotosContainer = document.getElementById("fotosContainer");

  const btnBuscar = document.querySelector(".input-group .btn-mongodb-primary");

  let latitude = null;
  let longitude = null;
  let marcador = null;
  let timeout = null;
  let fotos = [];

  const mapa = L.map("mapa").setView([-19.9167, -43.9345], 7);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(mapa);

});

const limitesMG = L.latLngBounds(
  L.latLng(-22.9068, -46.2576),
  L.latLng(-14.8831, -39.8622)
);

mapa.setMaxBounds(limitesMG);

mapa.on("drag", function () {
  mapa.panInsideBounds(limitesMG, { animate: false });
});

function atualizarMapa() {

  mapa.setView([latitude, longitude], 15);

  if (marcador) {
    mapa.removeLayer(marcador);
  }

  marcador = L.marker([latitude, longitude]).addTo(mapa);

  coordenadas.textContent = `
    Lat: ${latitude.toFixed(4)} |
    Lng: ${longitude.toFixed(4)}
  `;
}

mapa.on("click", function (evento) {

  latitude = evento.latlng.lat;
  longitude = evento.latlng.lng;

  atualizarMapa();
});
