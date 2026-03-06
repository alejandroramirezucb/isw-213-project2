class GestorModales {
  static abrir(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('modal--oculto');
  }

  static cerrar(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('modal--oculto');
  }
}
