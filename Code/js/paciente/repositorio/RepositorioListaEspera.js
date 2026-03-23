class RepositorioListaEspera {
  static #TABLA = 'lista_espera';

  static async anadirAEspera(pacienteId, psicologoId, fecha) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .insert({
        paciente_id: pacienteId,
        psicologo_id: psicologoId,
        fecha: fecha,
        notificado: false,
      })
      .select('id');

    if (resultado.error) {
      if (resultado.error.code === '23505') {
        console.log('ℹ️ Paciente ya está en la lista de espera para esta fecha');
        return true;
      }
      if (resultado.error.status === 403 || resultado.error.code === '42501') {
        console.warn('Sin permiso para añadir a lista de espera (RLS):', resultado.error.message);
        return false;
      }
      console.error('Error al añadir a lista de espera:', resultado.error.message);
      return false;
    }

    if (!resultado.data || resultado.data.length === 0) {
      console.warn('Inserción exitosa pero sin datos retornados');
      return true;
    }

    return !!resultado.data?.[0]?.id;
  }

  static async obtenerPosicion(pacienteId, psicologoId, fecha) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .select('id, paciente_id, creado_en')
      .eq('psicologo_id', psicologoId)
      .eq('fecha', fecha)
      .eq('notificado', false)
      .order('creado_en', { ascending: true });

    if (resultado.error || !Array.isArray(resultado.data)) {
      return null;
    }

    const posicion = resultado.data.findIndex(
      (row) => row.paciente_id === pacienteId,
    );
    return posicion >= 0 ? posicion + 1 : null;
  }

  static async obtenerClientesEnEsperaParaFecha(psicologoId, fecha) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .select('id, paciente_id, creado_en, notificado')
      .eq('psicologo_id', psicologoId)
      .eq('fecha', fecha)
      .eq('notificado', false)
      .order('creado_en', { ascending: true });

    return Array.isArray(resultado.data) ? resultado.data : [];
  }

  static async estaEnEspera(pacienteId, psicologoId, fecha) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .select('id')
      .eq('paciente_id', pacienteId)
      .eq('psicologo_id', psicologoId)
      .eq('fecha', fecha)
      .eq('notificado', false)
      .limit(1);

    return Array.isArray(resultado.data) && resultado.data.length > 0;
  }

  static async obtenerEsperasDePaciente(pacienteId) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .select('id, fecha, psicologo_id, notificado, creado_en')
      .eq('paciente_id', pacienteId)
      .eq('notificado', false)
      .order('creado_en', { ascending: false });

    return Array.isArray(resultado.data) ? resultado.data : [];
  }

  static async cancelarEspera(esperaId) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .delete()
      .eq('id', esperaId);

    return !resultado.error;
  }

  static async obtenerProximoEnEspera(psicologoId, fecha) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .select('id, paciente_id, usuarios_auth(id, email, nombre, apellido)')
      .eq('psicologo_id', psicologoId)
      .eq('fecha', fecha)
      .eq('notificado', false)
      .order('creado_en', { ascending: true })
      .limit(1);

    return Array.isArray(resultado.data) && resultado.data.length > 0
      ? resultado.data[0]
      : null;
  }

  static async marcarComoNotificado(esperaId) {
    const resultado = await clienteSupabase
      .from(this.#TABLA)
      .update({ notificado: true })
      .eq('id', esperaId);

    return !resultado.error;
  }
}

if (typeof window !== 'undefined') {
} else {
  module.exports = RepositorioListaEspera;
}
