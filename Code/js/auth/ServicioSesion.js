class ServicioSesion {
  static #URL_PSICOLOGO = 'psicologo.html';
  static #URL_PACIENTE = 'paciente.html';

  static redirigirPorRol(rol) {
    const url = rol === 'psicologo' ? this.#URL_PSICOLOGO : this.#URL_PACIENTE;
    window.location.href = url;
  }

  static async obtenerRol(usuarioId) {
    const resultado = await clienteSupabase
      .from('usuarios_auth')
      .select('rol')
      .eq('id', usuarioId)
      .single();
    return resultado.data;
  }

  static async verificarActiva() {
    const resultado = await clienteSupabase.auth.getSession();
    if (!resultado.data.session) return;

    const usuarioAuth = await this.obtenerRol(resultado.data.session.user.id);
    if (usuarioAuth) {
      this.redirigirPorRol(usuarioAuth.rol);
    }
  }
}
