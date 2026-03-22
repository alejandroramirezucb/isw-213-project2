class GestorMensajesBase {
  static obtenerTemporizador() {
    throw new Error('obtenerTemporizador debe ser implementado');
  }

  static asignarTemporizador(valor) {
    throw new Error('asignarTemporizador debe ser implementado');
  }

  static obtenerContenedor() {
    throw new Error('obtenerContenedor debe ser implementado');
  }

  static asignarContenedor(valor) {
    throw new Error('asignarContenedor debe ser implementado');
  }

  static obtenerTextoElemento() {
    throw new Error('obtenerTextoElemento debe ser implementado');
  }

  static asignarTextoElemento(valor) {
    throw new Error('asignarTextoElemento debe ser implementado');
  }

  static obtenerDuracion() {
    throw new Error('obtenerDuracion debe ser implementado');
  }

  static inicializar() {
    const contenedor = document.querySelector(
      Configuracion.SELECTORES_MENSAJES.CONTENEDOR_MENSAJES,
    );
    this.asignarContenedor(contenedor);

    if (contenedor) {
      const textoElemento = contenedor.querySelector(
        Configuracion.SELECTORES_MENSAJES.TEXTO_MENSAJES,
      );
      this.asignarTextoElemento(textoElemento);
    }
  }

  static mostrar(texto, tipo = 'info', duracion = null) {
    this.inicializar();

    const contenedor = this.obtenerContenedor();
    const textoElemento = this.obtenerTextoElemento();

    if (!contenedor || !textoElemento) return;

    const temporizador = this.obtenerTemporizador();
    if (temporizador) clearTimeout(temporizador);

    contenedor.classList.remove(
      Configuracion.CLASES_CSS.ACTIVO_MENSAJE_EXITO,
      Configuracion.CLASES_CSS.ACTIVO_MENSAJE_ERROR,
      Configuracion.CLASES_CSS.ACTIVO_MENSAJE_INFO,
      Configuracion.CLASES_CSS.OCULTO_MENSAJE,
    );

    contenedor.classList.add(`mensaje--${tipo}`);
    textoElemento.textContent = texto;

    const tiempoMuestra = duracion ?? this.obtenerDuracion();
    const nuevoTemporizador = setTimeout(() => {
      contenedor.classList.add(Configuracion.CLASES_CSS.OCULTO_MENSAJE);
    }, tiempoMuestra);

    this.asignarTemporizador(nuevoTemporizador);
  }
}
