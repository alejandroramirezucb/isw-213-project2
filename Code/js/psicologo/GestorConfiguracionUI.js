class GestorConfiguracionUI {
  static establecerFechasPorDefecto() {
    const hoy = new Date();
    const enUnMes = new Date();
    enUnMes.setMonth(enUnMes.getMonth() + 1);

    const fechaDesde = document.getElementById('fecha-desde');
    const fechaHasta = document.getElementById('fecha-hasta');

    if (fechaDesde) fechaDesde.value = Fachada.obtenerFechaISO(hoy);
    if (fechaHasta) fechaHasta.value = Fachada.obtenerFechaISO(enUnMes);
  }

  static async cargarConfiguracion() {
    const psicologoId = EstadoPsicologo.obtener('psicologoId');
    const configuraciones = await RepositorioConfiguracion.obtener(psicologoId);

    configuraciones.forEach((config) => {
      const diaArticle = document.querySelector(
        `.configuracion__dia[data-dia="${config.dia_semana}"]`,
      );
      if (!diaArticle) return;

      const checkbox = diaArticle.querySelector('.configuracion__checkbox');
      const horaInicio = diaArticle.querySelector('[data-tipo="inicio"]');
      const horaFin = diaArticle.querySelector('[data-tipo="fin"]');
      const duracion = diaArticle.querySelector('.configuracion__duracion');
      const horariosDiv = diaArticle.querySelector('.configuracion__horarios');

      if (config.activo) {
        checkbox.checked = true;
        horariosDiv.classList.remove('configuracion__horarios--oculto');
      }

      if (horaInicio) horaInicio.value = config.hora_inicio.substring(0, 5);
      if (horaFin) horaFin.value = config.hora_fin.substring(0, 5);
      if (duracion) duracion.value = config.duracion_bloque_minutos;
    });
  }

  static obtenerConfiguracionesFormulario() {
    const psicologoId = EstadoPsicologo.obtener('psicologoId');
    const configuraciones = [];

    document.querySelectorAll('.configuracion__dia').forEach((diaArticle) => {
      const diaSemana = parseInt(diaArticle.dataset.dia);
      const checkbox = diaArticle.querySelector('.configuracion__checkbox');

      if (checkbox.checked) {
        const horaInicio = diaArticle.querySelector(
          '[data-tipo="inicio"]',
        ).value;
        const horaFin = diaArticle.querySelector('[data-tipo="fin"]').value;
        const duracion = parseInt(
          diaArticle.querySelector('.configuracion__duracion').value,
        );

        configuraciones.push({
          psicologo_id: psicologoId,
          dia_semana: diaSemana,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          duracion_bloque_minutos: duracion,
          activo: true,
        });
      }
    });

    return configuraciones;
  }

  static toggleHorariosDia(evento) {
    const checkbox = evento.target;
    const diaArticle = checkbox.closest('.configuracion__dia');
    const horariosDiv = diaArticle.querySelector('.configuracion__horarios');

    horariosDiv.classList.toggle(
      'configuracion__horarios--oculto',
      !checkbox.checked,
    );
  }
}
