class RepositorioPacientes {
  static #TABLA = 'pacientes';

  static async actualizarBloqueo(pacienteId, bloqueado) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .update({ bloqueado })
      .eq('id', pacienteId);

    return !resultado.error;
  }
}
