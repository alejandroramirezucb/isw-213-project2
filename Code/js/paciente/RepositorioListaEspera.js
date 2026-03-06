class RepositorioListaEspera {
  static async inscribir(pacienteId, fecha) {
    const existente = await clienteSupabase
      .from('lista_espera')
      .select('id')
      .eq('paciente_id', pacienteId)
      .eq('fecha', fecha)
      .maybeSingle();

    if (existente.data) return false;

    const resultado = await clienteSupabase.from('lista_espera').insert({
      paciente_id: pacienteId,
      fecha: fecha,
    });
    return !resultado.error;
  }

  static async verificarInscripcion(pacienteId, fecha) {
    const resultado = await clienteSupabase
      .from('lista_espera')
      .select('id')
      .eq('paciente_id', pacienteId)
      .eq('fecha', fecha)
      .maybeSingle();
    return !!resultado.data;
  }

  static async notificarLiberacion(fecha) {
    const resultado = await clienteSupabase
      .from('lista_espera')
      .select('paciente_id')
      .eq('fecha', fecha);

    if (!resultado.data || resultado.data.length === 0) return;

    const notificaciones = resultado.data.map((item) => ({
      destinatario_tipo: 'paciente',
      destinatario_id: item.paciente_id,
      tipo: 'lista_espera',
      canal: 'email',
    }));

    await clienteSupabase.from('notificaciones').insert(notificaciones);

    await clienteSupabase.from('lista_espera').delete().eq('fecha', fecha);
  }
}
