class RenderizadorCitas {
  static calcularFechas(periodo) {
    const hoy = new Date();
    const fechaInicio = Fachada.obtenerFechaISO(hoy);
    let fechaFin = fechaInicio;

    if (periodo === 'semana') {
      const finSemana = new Date(hoy);
      finSemana.setDate(hoy.getDate() + (6 - hoy.getDay()));
      fechaFin = Fachada.obtenerFechaISO(finSemana);
    }

    return { inicio: fechaInicio, fin: fechaFin };
  }

  static actualizarTitulo(periodo, fechas) {
    const tituloPeriodo = document.getElementById('titulo-periodo');
    const fechaActualEl = document.getElementById('fecha-actual');

    if (periodo === 'semana') {
      tituloPeriodo.textContent = 'Citas de la Semana';
      fechaActualEl.textContent = `${Fachada.formatearFechaCorta(new Date(fechas.inicio + 'T00:00:00'))} - ${Fachada.formatearFechaCorta(new Date(fechas.fin + 'T00:00:00'))}`;
    } else {
      tituloPeriodo.textContent = 'Citas de Hoy';
      fechaActualEl.textContent = Fachada.formatearFechaCorta(new Date());
    }
  }

  static actualizarResumen(citas, esHoy) {
    const totalCitasDia = document.getElementById('total-citas-dia');
    const siguienteCitaHora = document.getElementById('siguiente-cita-hora');

    totalCitasDia.textContent = citas.length;

    if (esHoy && citas.length > 0) {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

      const siguienteCita = citas.find(
        (c) => c.bloques_horario.hora_inicio.substring(0, 5) > horaActual,
      );
      siguienteCitaHora.textContent = siguienteCita
        ? Fachada.formatearHora(siguienteCita.bloques_horario.hora_inicio)
        : 'Ninguna';
    } else {
      siguienteCitaHora.textContent =
        citas.length > 0
          ? Fachada.formatearHora(citas[0].bloques_horario.hora_inicio)
          : '--:--';
    }
  }

  static renderizar(citas) {
    const lista = document.getElementById('lista-citas-panel');
    const sinCitas = document.getElementById('sin-citas-panel');

    if (citas.length === 0) {
      lista.innerHTML = '';
      sinCitas.classList.remove('mensaje-vacio--oculto');
      return;
    }

    sinCitas.classList.add('mensaje-vacio--oculto');

    let html = '';
    citas.forEach((cita) => {
      html += `<article class="cita-item" data-cita-id="${cita.id}">
        <div class="cita-item__info">
          <span class="cita-item__fecha">${Fachada.formatearFechaCorta(new Date(cita.bloques_horario.fecha + 'T00:00:00'))}</span>
          <span class="cita-item__hora">${Fachada.formatearHora(cita.bloques_horario.hora_inicio)}</span>
          <span class="cita-item__paciente">${cita.pacientes.nombre} ${cita.pacientes.apellido}</span>
        </div>
        <span class="cita-item__estado cita-item__estado--confirmada">Confirmada</span>
      </article>`;
    });

    lista.innerHTML = html;
    this.#agregarEventos();
  }

  static #agregarEventos() {
    document
      .getElementById('lista-citas-panel')
      .querySelectorAll('.cita-item')
      .forEach((item) =>
        item.addEventListener('click', () =>
          GestorDetalleCita.mostrar(item.dataset.citaId),
        ),
      );
  }

  static async cargarPeriodo(periodo) {
    const psicologoId = EstadoPsicologo.obtener('psicologoId');
    const fechas = this.calcularFechas(periodo);

    this.actualizarTitulo(periodo, fechas);

    const citas = await RepositorioCitasPsicologo.obtenerPorPeriodo(
      psicologoId,
      fechas.inicio,
      fechas.fin,
    );
    EstadoPsicologo.establecer('citasCargadas', citas);

    this.actualizarResumen(citas, periodo === 'hoy');
    this.renderizar(citas);
  }
}
