class AlmacenLocal {
  static #prefijo = 'psicoraiden_';

  static obtener(clave, defecto = null) {
    try {
      const valor = localStorage.getItem(this.#obtenerClaveCompleta(clave));
      return valor ? JSON.parse(valor) : defecto;
    } catch (error) {
      return defecto;
    }
  }

  static establecer(clave, valor) {
    try {
      localStorage.setItem(
        this.#obtenerClaveCompleta(clave),
        JSON.stringify(valor),
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  static eliminar(clave) {
    try {
      localStorage.removeItem(this.#obtenerClaveCompleta(clave));
      return true;
    } catch (error) {
      return false;
    }
  }

  static limpiar() {
    try {
      const claves = Object.keys(localStorage);
      claves.forEach((clave) => {
        if (clave.startsWith(this.#prefijo)) {
          localStorage.removeItem(clave);
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  static existe(clave) {
    return localStorage.getItem(this.#obtenerClaveCompleta(clave)) !== null;
  }

  static #obtenerClaveCompleta(clave) {
    return `${this.#prefijo}${clave}`;
  }

  static establecerPrefijo(prefijo) {
    this.#prefijo = prefijo;
  }
}
