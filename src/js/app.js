// Para acceder a los elementos del HTML ya no usamos document.getElementById —
// usamos document.querySelector, que acepta cualquier selector CSS (#id, .clase,
// etiqueta...) y no solo ids. Por ejemplo: document.querySelector("#filtro-nombre").

async function obtenerPersonajes() {
  const respuesta = await fetch("https://rickandmortyapi.com/api/character");

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los personajes");
  }
  const datos = await respuesta.json();
  return datos.results;
}

function filtrarPorEstado(personajes, estado) {
  if (estado === "") {
    return personajes;
  }

  return personajes.filter(function (personaje) {
    return personaje.status.toLowerCase() === estado.toLowerCase();
  });
}

function filtrarPorEspecie(personajes, especie) {
  if (especie === "") {
    return personajes;
  }

  return personajes.filter(function (personaje) {
    return personaje.species.toLowerCase() === especie.toLowerCase();
  });
}

let personajes = [];
let ordenarAZ = false;

function aplicarFiltros() {
  const nombre = document.querySelector("#filtro-nombre").value.trim().toLowerCase();
  const estado = document.querySelector("#filtro-estado").value;
  const especie = document.querySelector("#filtro-especie").value;
  const limitar = document.querySelector("#limitar-resultados").checked;

  let filtrados = filtrarPorEstado(personajes, estado);
  filtrados = filtrarPorEspecie(filtrados, especie);
  filtrados = filtrados.filter(function (personaje) {
    return personaje.name.toLowerCase().includes(nombre);
  });

  if (ordenarAZ) {
    filtrados = [...filtrados].sort(function(a, b) {
      return a.name.localeCompare(b.name, "es", {
        sensitivity: "base"
      });
    });
  }

  const total = filtrados.length;

  actualizarEstadisticas(filtrados);

  if (limitar) {
    filtrados = filtrados.slice(0, 10);
  }

  pintarResultados(filtrados, total);
}

function actualizarEstadisticas(lista) {
  const vivos = lista.filter(function (personaje) {
    return personaje.status.toLowerCase() === "alive";
  }).length;

  const muertos = lista.filter(function (personaje) {
    return personaje.status.toLowerCase() === "dead";
  }).length;

  const desconocidos = lista.filter(function (personaje) {
    return personaje.status.toLowerCase() === "unknown";
  }).length;

  document.querySelector("#resumen-estados").textContent =
    vivos + " vivos · " +
    muertos + " muertos · " +
    desconocidos + " desconocidos";

  document.querySelector("#aviso-muertos").hidden = muertos === 0;
}

function pintarResultados(lista, total) {
  const contenedor = document.querySelector("#resultados");
  document.querySelector("#contador").textContent = total + " personajes encontrados · Mostrando " + lista.length;

  contenedor.innerHTML = lista.map(function (personaje) {
      const estado = personaje.status.toLowerCase();
      return `
        <article class="personaje-card">
          <img
            src="${personaje.image}"
            alt="${personaje.name}"
            loading="lazy"
          />

          <div class="personaje-info">
            <h3>${personaje.name}</h3>

            <div class="personaje-detalles">
              <span class="estado estado-${estado}">
                ${personaje.status}
              </span>

              <span class="especie">
                ${personaje.species}
              </span>
            </div>
          </div>
        </article>
      `;
    }).join("");
}

document.querySelector("#filtro-nombre").addEventListener("input", aplicarFiltros);
document.querySelector("#filtro-estado").addEventListener("change", aplicarFiltros);
document.querySelector("#filtro-especie").addEventListener("change", aplicarFiltros);
document.querySelector(".filtros").addEventListener("submit", function(evento){ 
  evento.preventDefault();
});

const botonOrdenar = document.querySelector("#ordenar-nombre");
botonOrdenar.addEventListener("click", function () {
  ordenarAZ = !ordenarAZ;
  botonOrdenar.setAttribute("aria-pressed", String(ordenarAZ));
  aplicarFiltros();
});

document
  .querySelector("#limitar-resultados")
  .addEventListener("change", aplicarFiltros);

document.querySelector("#limpiar-filtros").addEventListener("click", function () {
    document.querySelector(".filtros").reset();
    document.querySelector("#limitar-resultados").checked = false;
    ordenarAZ = false;
    botonOrdenar.setAttribute("aria-pressed", "false");
    aplicarFiltros();
});

obtenerPersonajes().then(function (datos) {
  personajes = datos;
  aplicarFiltros();
  })
  .catch(function (error) {
    console.error(error);
    document.querySelector("#contador").textContent = error.message;
});
