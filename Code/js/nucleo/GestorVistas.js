class GestorVistas {
  static cambiar(vistaId) {
    document
      .querySelectorAll('.vista')
      .forEach((v) => v.classList.remove('vista--activa'));
    const vista = document.getElementById(`vista-${vistaId}`);
    if (vista) vista.classList.add('vista--activa');

    document.querySelectorAll('.navegacion__boton').forEach((b) => {
      b.classList.toggle(
        'navegacion__boton--activo',
        b.dataset.vista === vistaId,
      );
    });
  }
}
