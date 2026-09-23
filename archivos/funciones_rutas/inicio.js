import { 
  abrirModal,
  cargarMapa,
  cerrarModal,
  crearEstrellas
 } from "./funciones_navegador.js";

// MOSTRAR MODALES

//Abrir .modal desde #contactar y #usuario
abrirModal("usuario", ".modal")
abrirModal("contactar", ".modal")


//Abrir .info
abrirModal("tarjeta1", ".info")
document.getElementById("tarjeta1").addEventListener("click",()=>{
  cargarMapa(-34.6037, -58.3816)
  document.querySelector(".puntos").innerHTML = 
    crearEstrellas(5);
})


//CERRAR MODALES
//Cerrar .info
cerrarModal("btn-cerrar-info", ".info")
// Cerrar .modal con X
cerrarModal("x", ".modal")


//Navegar por .modal
const tabs = document.querySelectorAll(".tab");
const contenidos = document.querySelectorAll(".contenido-tab");
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    // Quitar "activa" de todos los botones
    tabs.forEach(boton => {
      boton.classList.remove("activa");
    });
    // Ocultar todos los contenidos
    contenidos.forEach(contenido => {
      contenido.classList.remove("activo");
    });
    // Activar el botón seleccionado
    tab.classList.add("activa");
    // Obtener qué contenido corresponde al botón
    const id = tab.dataset.tab;
    // Mostrar ese contenido
    document.getElementById(id).classList.add("activo");
  });
});

  