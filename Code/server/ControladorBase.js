class ControladorBase {
  #cliente;

  constructor(cliente) {
    this.#cliente = cliente;
  }

  obtenerCliente() {
    return this.#cliente;
  }

  async leerCuerpo(req) {
    return new Promise((resolve) => {
      let cuerpo = '';
      req.on('data', (chunk) => {
        cuerpo += chunk;
      });
      req.on('end', () => resolve(cuerpo));
    });
  }

  responder(res, status, datos) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(datos));
  }

  analizarJSON(texto) {
    try {
      return JSON.parse(texto);
    } catch {
      return null;
    }
  }

  validarCamposRequeridos(datos, campos) {
    return campos.every((campo) => datos[campo]);
  }

  extraerMensajeError(respuesta) {
    return (
      respuesta?.msg ||
      respuesta?.message ||
      respuesta?.error_description ||
      respuesta?.details ||
      respuesta?.hint ||
      'Error desconocido'
    );
  }
}

module.exports = ControladorBase;
