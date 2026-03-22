class ValidadorFormulario {
  static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static TELEFONO_REGEX = /^\d{7,}$/;

  static esCorreoValido(correo) {
    return this.EMAIL_REGEX.test(correo);
  }

  static esTelefonoValido(telefono) {
    return this.TELEFONO_REGEX.test(telefono);
  }

  static esPasswordValida(password) {
    return password && password.length >= 6;
  }

  static esTextoValido(texto, minimo = 2) {
    return texto && texto.trim().length >= minimo;
  }

  static noEstaVacio(valor) {
    return valor && valor.toString().trim().length > 0;
  }

  static sonIguales(valor1, valor2) {
    return valor1 === valor2;
  }

  static validarCamposRequeridos(valores = {}) {
    return Object.values(valores).every((valor) =>
      this.noEstaVacio(valor),
    );
  }

  static validarMultiple(validaciones = {}) {
    const errores = {};

    Object.entries(validaciones).forEach(([campo, validar]) => {
      const resultado = validar();
      if (resultado !== true) {
        errores[campo] = resultado;
      }
    });

    return Object.keys(errores).length === 0 ? null : errores;
  }
}
