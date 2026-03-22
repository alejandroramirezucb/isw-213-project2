class ServicioSesion {
  static redirigirPorRol(rol) {
    const url =
      rol === 'psicologo'
        ? Configuracion.RUTAS.PSICOLOGO
        : Configuracion.RUTAS.PACIENTE;
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
