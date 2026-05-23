export class ControladorAuth {
  constructor(modelo) {
    this._modelo = modelo;
    this._bindEventos();
  }

  _bindEventos() {
    document.addEventListener('auth:loginEnviado', (e) =>
      this._modelo.iniciarSesion(e.detail.correo, e.detail.password),
    );
    document.addEventListener('auth:registroEnviado', (e) =>
      this._modelo.registrar(e.detail),
    );
  }
}
