class RepositorioConfiguracion {
  static async obtener(psicologoId) {
    const resultado = await clienteSupabase
      .from('configuracion_horario')
      .select('*')
      .eq('psicologo_id', psicologoId);
    return resultado.data || [];
  }

  static async eliminar(psicologoId) {
    await clienteSupabase
      .from('configuracion_horario')
      .delete()
      .eq('psicologo_id', psicologoId);
  }

  static async guardar(configuraciones) {
    if (configuraciones.length === 0) return true;
    const resultado = await clienteSupabase
      .from('configuracion_horario')
      .insert(configuraciones);
    return !resultado.error;
  }

  static async generarBloques(psicologoId, fechaInicio, fechaFin) {
    const configuraciones = await this.obtener(psicologoId);
    if (configuraciones.length === 0) return true;

    await clienteSupabase
      .from('bloques_horario')
      .delete()
      .eq('psicologo_id', psicologoId)
      .eq('estado', 'disponible')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);

    const configPorDia = {};
    configuraciones.forEach((c) => {
      if (c.activo) configPorDia[c.dia_semana] = c;
    });

    const bloques = [];
    const dInicio = new Date(fechaInicio + 'T00:00:00');
    const dFin = new Date(fechaFin + 'T00:00:00');

    for (let d = new Date(dInicio); d <= dFin; d.setDate(d.getDate() + 1)) {
      const config = configPorDia[d.getDay()];
      if (!config) continue;

      const fechaStr = d.toISOString().slice(0, 10);
      const [hIni, mIni] = config.hora_inicio.split(':').map(Number);
      const [hFin, mFin] = config.hora_fin.split(':').map(Number);
      const duracion = config.duracion_bloque_minutos;

      let minutos = hIni * 60 + mIni;
      const minutosMax = hFin * 60 + mFin;

      while (minutos + duracion <= minutosMax) {
        const hB = Math.floor(minutos / 60);
        const mB = minutos % 60;
        const hBFin = Math.floor((minutos + duracion) / 60);
        const mBFin = (minutos + duracion) % 60;
        bloques.push({
          psicologo_id: psicologoId,
          fecha: fechaStr,
          hora_inicio: `${String(hB).padStart(2, '0')}:${String(mB).padStart(2, '0')}:00`,
          hora_fin: `${String(hBFin).padStart(2, '0')}:${String(mBFin).padStart(2, '0')}:00`,
          estado: 'disponible',
        });
        minutos += duracion;
      }
    }

    if (bloques.length === 0) return true;
    const resultado = await clienteSupabase
      .from('bloques_horario')
      .insert(bloques);
    return !resultado.error;
  }
}
