class GestorFormularios {
  static #seccionLogin = null;
  static #seccionRegistro = null;

  static inicializar() {
    this.#seccionLogin = document.getElementById('seccion-login');
    this.#seccionRegistro = document.getElementById('seccion-registro');
  }

  static mostrarRegistro() {
    if (!this.#seccionLogin) this.inicializar();
    if (this.#seccionLogin) this.#seccionLogin.classList.add('auth--oculto');
    if (this.#seccionRegistro)
      this.#seccionRegistro.classList.remove('auth--oculto');
  }

  static mostrarLogin() {
    if (!this.#seccionLogin) this.inicializar();
    if (this.#seccionLogin) this.#seccionLogin.classList.remove('auth--oculto');
    if (this.#seccionRegistro)
      this.#seccionRegistro.classList.add('auth--oculto');
  }
}
