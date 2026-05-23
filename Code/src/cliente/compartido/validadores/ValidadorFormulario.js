export class ValidadorFormulario {
  static _EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static _TELEFONO_REGEX = /^\d{7,}$/;

  static esCorreoValido(correo) {
    return this._EMAIL_REGEX.test(correo);
  }

  static esTelefonoValido(telefono) {
    return this._TELEFONO_REGEX.test(telefono);
  }

  static esPasswordValida(password) {
    return !!password && password.length >= 6;
  }

  static noEstaVacio(valor) {
    return !!valor && valor.toString().trim().length > 0;
  }

  static sonIguales(a, b) {
    return a === b;
  }
}
