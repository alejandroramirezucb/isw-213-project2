class ServicioAutenticacionPagina {
  static #URL_INDEX = 'index.html';

  static async verificar() {
    const resultado = await clienteSupabase.auth.getSession();
    if (!resultado.data.session) {
      window.location.href = this.#URL_INDEX;
      return null;
    }
    return resultado.data.session;
  }

  static async obtenerUsuario() {
    const resultado = await clienteSupabase.auth.getUser();
    if (!resultado.data.user) return null;

    const consulta = await clienteSupabase
      .from('usuarios_auth')
      .select('*, pacientes(*), psicologos(*)')
      .eq('id', resultado.data.user.id)
      .single();

    return {
      ...consulta.data,
      email: resultado.data.user.email,
    };
  }

  static async cerrarSesion() {
    await clienteSupabase.auth.signOut();
    window.location.href = this.#URL_INDEX;
  }
}
