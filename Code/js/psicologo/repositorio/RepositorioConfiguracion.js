class RepositorioConfiguracion {
  static #configCache = new Map();
  static #DURACION_CACHE = 60000;

  static #esCacheValido(timestamp) {
    return Date.now() - timestamp < this.#DURACION_CACHE;
  }

  static async obtener(psicologoId) {
    const cached = this.#configCache.get(psicologoId);
    if (cached && this.#esCacheValido(cached.timestamp)) {
      return cached.datos;
    }

    const resultado = await clienteSupabase
      .from('configuracion_horario')
      .select('*')
      .eq('psicologo_id', psicologoId);

    const datos = resultado.data || [];
    this.#configCache.set(psicologoId, { datos, timestamp: Date.now() });
    return datos;
  }

  static async guardarYGenerarBloques(
    psicologoId,
    configuraciones,
    fechaInicio,
    fechaFin,
  ) {
    if (!configuraciones || configuraciones.length === 0) {
      console.log('No hay configuraciones para guardar');
      return true;
    }

    try {
      console.log(
        'Eliminando configuración anterior para psicólogo:',
        psicologoId,
      );
      const deleteConfig = await clienteSupabase
        .from('configuracion_horario')
        .delete()
        .eq('psicologo_id', psicologoId);

      if (deleteConfig.error) {
        console.error(
          'Error eliminando configuración anterior:',
          deleteConfig.error,
        );
      }

      console.log('Insertando nuevas configuraciones:', configuraciones);
      const guardarResultado = await clienteSupabase
        .from('configuracion_horario')
        .insert(configuraciones)
        .select();

      if (guardarResultado.error) {
        console.error(
          'Error al guardar configuración:',
          guardarResultado.error,
        );
        return false;
      }

      console.log('Configuración guardada exitosamente');

      const bloques = this.#generarBloques(
        psicologoId,
        configuraciones,
        fechaInicio,
        fechaFin,
      );

      console.log('Bloques generados:', bloques.length);

      if (bloques.length > 0) {
        // Obtener bloques existentes para evitar duplicados
        console.log('Verificando bloques existentes...');
        const existentes = await clienteSupabase
          .from('bloques_horario')
          .select('fecha, hora_inicio')
          .eq('psicologo_id', psicologoId)
          .gte('fecha', fechaInicio)
          .lte('fecha', fechaFin);

        const existentesSet = new Set(
          (existentes.data || []).map((b) => `${b.fecha}-${b.hora_inicio}`),
        );

        // Filtrar solo bloques nuevos
        const bloquesNuevos = bloques.filter(
          (b) => !existentesSet.has(`${b.fecha}-${b.hora_inicio}`),
        );

        console.log(`Bloques nuevos a insertar: ${bloquesNuevos.length}`);

        if (bloquesNuevos.length > 0) {
          console.log('Insertando bloques nuevos...');
          const insertResultado = await clienteSupabase
            .from('bloques_horario')
            .insert(bloquesNuevos)
            .select();

          if (insertResultado.error) {
            console.error('Error al insertar bloques:', insertResultado.error);
            return false;
          }
          console.log('Bloques insertados correctamente');
        } else {
          console.log('No hay bloques nuevos que insertar');
        }
      }

      this.#configCache.delete(psicologoId);
      console.log('Guardado completado exitosamente');
      return true;
    } catch (error) {
      console.error('Error en guardarYGenerarBloques:', error);
      return false;
    }
  }

  static #generarBloques(psicologoId, configuraciones, fechaInicio, fechaFin) {
    const configPorDia = {};
    configuraciones.forEach((c) => {
      if (c.activo) configPorDia[c.dia_semana] = c;
    });

    const bloques = [];
    const dInicio = new Date(fechaInicio + 'T00:00:00');
    const dFin = new Date(fechaFin + 'T00:00:00');

    const d = new Date(dInicio);
    while (d <= dFin) {
      const config = configPorDia[d.getDay()];
      if (config) {
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
      d.setDate(d.getDate() + 1);
    }

    return bloques;
  }

  static async generarBloques(psicologoId, fechaInicio, fechaFin) {
    const configuraciones = await this.obtener(psicologoId);
    if (!configuraciones || configuraciones.length === 0) return true;

    try {
      await clienteSupabase
        .from('bloques_horario')
        .delete()
        .eq('psicologo_id', psicologoId)
        .eq('estado', 'disponible')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin);

      const bloques = this.#generarBloques(
        psicologoId,
        configuraciones,
        fechaInicio,
        fechaFin,
      );

      if (bloques.length === 0) return true;
      const resultado = await clienteSupabase
        .from('bloques_horario')
        .insert(bloques);
      return !resultado.error;
    } catch (_) {
      return false;
    }
  }
}
