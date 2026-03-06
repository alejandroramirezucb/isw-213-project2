class ServicioSesion {
  static redirigirPorRol(rol) {
    window.location.href =
      rol === 'psicologo' ? 'psicologo.html' : 'paciente.html';
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
    if (usuarioAuth) this.redirigirPorRol(usuarioAuth.rol);
  }
}
