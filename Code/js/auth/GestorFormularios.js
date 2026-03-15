class GestorFormularios {
  static #seccionLogin = null;
  static #seccionRegistro = null;
  static #SELECTOR_LOGIN = '#seccion-login';
  static #SELECTOR_REGISTRO = '#seccion-registro';
  static #CLASE_OCULTO = 'auth--oculto';

  static inicializar() {
    this.#seccionLogin = document.querySelector(this.#SELECTOR_LOGIN);
    this.#seccionRegistro = document.querySelector(this.#SELECTOR_REGISTRO);
  }

  static mostrarRegistro() {
    if (!this.#seccionLogin) this.inicializar();
    if (this.#seccionLogin) {
      this.#seccionLogin.classList.add(this.#CLASE_OCULTO);
    }
    if (this.#seccionRegistro) {
      this.#seccionRegistro.classList.remove(this.#CLASE_OCULTO);
    }
  }

  static mostrarLogin() {
    if (!this.#seccionLogin) this.inicializar();
    if (this.#seccionLogin) {
      this.#seccionLogin.classList.remove(this.#CLASE_OCULTO);
    }
    if (this.#seccionRegistro) {
      this.#seccionRegistro.classList.add(this.#CLASE_OCULTO);
    }
  }
}
