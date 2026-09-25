

// Mostrar modales

function abrirModal(id, claseModal) {
  const boton = document.getElementById(id);
  const modal = document.querySelector(claseModal);
  boton.addEventListener("click", (e) => {
    //e.stopPropagation();
    modal.style.display = "flex";
    //modal.style.left = e.clientX + "px";
    //modal.style.top = e.clientY + "px";
  });
  /*document.addEventListener("click", (e) => {
    if (modal.style.display === "flex" &&!modal.contains(e.target)){
      modal.style.display = "none";
    }
  });*/
}

function mostrarModal(claseModal, estado) {
    const modal = document.querySelector(claseModal);
    modal.style.display = estado;
}

//Cerrar Modales

function cerrarModal(idBoton, claseModal) {
    document.getElementById(idBoton).addEventListener("click", () => {
      document.querySelector(claseModal).style.display = "none";
    });
}

function cerrardialog(idBoton, dialog) {
    document.getElementById(idBoton).addEventListener("click", () => {
      dialog.close()
    });
}

//Crear Mapa

function cargarMapa(lat, log){
    if (mapa) {
        mapa.remove();
      }

      // Inicializar mapa
      var mapa = L.map('mapa').setView([lat, log], 13);
    
      // Capa base (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapa);

      // Dibujar un círculo en lugar de un marcador
      L.circle([lat, log], {
        radius: 1000, // radio en metros (ejemplo: 1000m ≈ 1km)
        color: 'blue',
        fillColor: '#3f83f8',
        fillOpacity: 0.3
      }).addTo(mapa)
        .openPopup();

}

//Crear Estrellas de puntos por comentarios

function crearEstrellas(puntos){
    var cantidad = ""
    for(var i = 0; i< puntos; i++){
        cantidad += "★"
    }
    return cantidad
}

function swichClases(clase1, clase2){
    elementoConLaClase.classList.remove(claseSwich)
    elementoSinLaClase.classList.add(claseSwich)
}

export {
abrirModal,
cerrarModal,
cargarMapa,
crearEstrellas,
swichClases,
mostrarModal,
cerrardialog
};
