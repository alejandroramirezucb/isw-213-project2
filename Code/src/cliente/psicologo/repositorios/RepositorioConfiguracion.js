import { supabase } from '../../compartido/config/ClienteSupabase.js';

const DURACION_CACHE_MS = 60000;

export class RepositorioConfiguracion {
  static _cache = new Map();

  static async obtener(psicologoId) {
    const registroCache = this._cache.get(psicologoId);
    if (registroCache && Date.now() - registroCache.timestamp < DURACION_CACHE_MS) {
      return registroCache.datos;
    }
    const { data } = await supabase.from('configuracion_horario').select('*').eq('psicologo_id', psicologoId);
    const datos = data || [];
    this._cache.set(psicologoId, { datos, timestamp: Date.now() });
    return datos;
  }

  static async guardarYGenerarBloques(psicologoId, configuraciones, fechaInicio, fechaFin) {
    if (!configuraciones?.length) return true;
    try {
      await supabase.from('configuracion_horario').delete().eq('psicologo_id', psicologoId);
      const { error: errorInsertConfig } = await supabase.from('configuracion_horario').insert(configuraciones);
      if (errorInsertConfig) return false;

      const bloques = this._generarBloques(psicologoId, configuraciones, fechaInicio, fechaFin);
      if (!bloques.length) { this._cache.delete(psicologoId); return true; }

      const { data: bloquesExistentes } = await supabase
        .from('bloques_horario')
        .select('fecha, hora_inicio')
        .eq('psicologo_id', psicologoId)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin);

      const clavesBloqueExistente = new Set(
        (bloquesExistentes || []).map((bloque) => `${bloque.fecha}-${bloque.hora_inicio}`),
      );
      const bloquesNuevos = bloques.filter(
        (bloque) => !clavesBloqueExistente.has(`${bloque.fecha}-${bloque.hora_inicio}`),
      );

      if (bloquesNuevos.length) {
        const { error: errorInsertBloques } = await supabase.from('bloques_horario').insert(bloquesNuevos);
        if (errorInsertBloques) return false;
      }

      this._cache.delete(psicologoId);
      return true;
    } catch { return false; }
  }

  static _generarBloques(psicologoId, configuraciones, fechaInicio, fechaFin) {
    const configPorDiaSemana = Object.fromEntries(
      configuraciones.filter((config) => config.activo).map((config) => [config.dia_semana, config]),
    );
    const bloques = [];
    const fechaActual = new Date(fechaInicio + 'T00:00:00');
    const fechaLimite = new Date(fechaFin + 'T00:00:00');

    while (fechaActual <= fechaLimite) {
      const configDia = configPorDiaSemana[fechaActual.getDay()];
      if (configDia) {
        const anio = fechaActual.getFullYear();
        const mesPadded = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const diaPadded = String(fechaActual.getDate()).padStart(2, '0');
        const fechaISO = `${anio}-${mesPadded}-${diaPadded}`;

        const [horaInicioH, horaInicioM] = configDia.hora_inicio.split(':').map(Number);
        const [horaFinH, horaFinM] = configDia.hora_fin.split(':').map(Number);
        let minutosActual = horaInicioH * 60 + horaInicioM;
        const minutosLimite = horaFinH * 60 + horaFinM;

        while (minutosActual + configDia.duracion_bloque_minutos <= minutosLimite) {
          const inicioH = Math.floor(minutosActual / 60);
          const inicioM = minutosActual % 60;
          const finH = Math.floor((minutosActual + configDia.duracion_bloque_minutos) / 60);
          const finM = (minutosActual + configDia.duracion_bloque_minutos) % 60;
          bloques.push({
            psicologo_id: psicologoId,
            fecha: fechaISO,
            hora_inicio: `${String(inicioH).padStart(2, '0')}:${String(inicioM).padStart(2, '0')}:00`,
            hora_fin: `${String(finH).padStart(2, '0')}:${String(finM).padStart(2, '0')}:00`,
            estado: 'disponible',
          });
          minutosActual += configDia.duracion_bloque_minutos;
        }
      }
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
    return bloques;
  }
}
