class EstadoPsicologo {
  static #estado = {
    usuario: null,
    psicologoId: null,
    citaSeleccionada: null,
    citasCargadas: [],
  };

  static obtener(clave) {
    return this.#estado[clave];
  }
  static establecer(clave, valor) {
    this.#estado[clave] = valor;
  }
}

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
    const resultado = await clienteSupabase.rpc(
      'generar_bloques_desde_configuracion',
      {
        p_profesional_id: psicologoId,
        p_fecha_inicio: fechaInicio,
        p_fecha_fin: fechaFin,
      },
    );
    return !resultado.error;
  }
}

class RepositorioCitasPsicologo {
  static async obtenerPorPeriodo(psicologoId, fechaInicio, fechaFin) {
    const resultado = await clienteSupabase
      .from('citas')
      .select(
        'id, estado, pacientes(id, nombre, apellido, correo, telefono), bloques_horario(fecha, hora_inicio, hora_fin)',
      )
      .eq('psicologo_id', psicologoId)
      .eq('estado', 'confirmada')
      .gte('bloques_horario.fecha', fechaInicio)
      .lte('bloques_horario.fecha', fechaFin)
      .order('bloques_horario(fecha)', { ascending: true })
      .order('bloques_horario(hora_inicio)', { ascending: true });

    if (!resultado.data) return [];
    return resultado.data.filter((c) => c.bloques_horario);
  }

  static async cancelar(citaId) {
    const resultado = await clienteSupabase.rpc(
      'cancelar_cita_y_liberar_bloque',
      {
        p_cita_id: citaId,
        p_cancelada_por: 'psicologo',
      },
    );
    return !resultado.error;
  }

  static async obtenerPacienteId(citaId) {
    const resultado = await clienteSupabase
      .from('citas')
      .select('paciente_id')
      .eq('id', citaId)
      .single();
    return resultado.data ? resultado.data.paciente_id : null;
  }

  static async crearNotificacion(pacienteId, citaId) {
    await clienteSupabase.from('notificaciones').insert({
      destinatario_tipo: 'paciente',
      destinatario_id: pacienteId,
      cita_id: citaId,
      tipo: 'cancelacion',
      canal: 'email',
    });
  }
}

class GestorConfiguracionUI {
  static establecerFechasPorDefecto() {
    const hoy = new Date();
    const enUnMes = new Date();
    enUnMes.setMonth(enUnMes.getMonth() + 1);

    const fechaDesde = document.getElementById('fecha-desde');
    const fechaHasta = document.getElementById('fecha-hasta');

    if (fechaDesde) fechaDesde.value = obtenerFechaISO(hoy);
    if (fechaHasta) fechaHasta.value = obtenerFechaISO(enUnMes);
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

class GestorHorarios {
  static async guardar(evento) {
    evento.preventDefault();

    try {
      const psicologoId = EstadoPsicologo.obtener('psicologoId');

      await RepositorioConfiguracion.eliminar(psicologoId);

      const configuraciones =
        GestorConfiguracionUI.obtenerConfiguracionesFormulario();

      if (configuraciones.length > 0) {
        const guardado =
          await RepositorioConfiguracion.guardar(configuraciones);
        if (!guardado) throw new Error('Error al guardar configuración');
      }

      const fechaDesde = document.getElementById('fecha-desde').value;
      const fechaHasta = document.getElementById('fecha-hasta').value;

      if (fechaDesde && fechaHasta) {
        const generado = await RepositorioConfiguracion.generarBloques(
          psicologoId,
          fechaDesde,
          fechaHasta,
        );
        if (!generado) throw new Error('Error al generar bloques');
      }

      mostrarMensaje('Configuración guardada y bloques generados', 'exito');
    } catch (error) {
      mostrarMensaje('Error al guardar la configuración', 'error');
    }
  }
}

class RenderizadorCitas {
  static calcularFechas(periodo) {
    const hoy = new Date();
    const fechaInicio = obtenerFechaISO(hoy);
    let fechaFin = fechaInicio;

    if (periodo === 'semana') {
      const finSemana = new Date(hoy);
      finSemana.setDate(hoy.getDate() + (6 - hoy.getDay()));
      fechaFin = obtenerFechaISO(finSemana);
    }

    return { inicio: fechaInicio, fin: fechaFin };
  }

  static actualizarTitulo(periodo, fechas) {
    const tituloPeriodo = document.getElementById('titulo-periodo');
    const fechaActualEl = document.getElementById('fecha-actual');

    if (periodo === 'semana') {
      tituloPeriodo.textContent = 'Citas de la Semana';
      fechaActualEl.textContent = `${formatearFechaCorta(new Date(fechas.inicio + 'T00:00:00'))} - ${formatearFechaCorta(new Date(fechas.fin + 'T00:00:00'))}`;
    } else {
      tituloPeriodo.textContent = 'Citas de Hoy';
      fechaActualEl.textContent = formatearFechaCorta(new Date());
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
        ? formatearHora(siguienteCita.bloques_horario.hora_inicio)
        : 'Ninguna';
    } else {
      siguienteCitaHora.textContent =
        citas.length > 0
          ? formatearHora(citas[0].bloques_horario.hora_inicio)
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
          <span class="cita-item__fecha">${formatearFechaCorta(new Date(cita.bloques_horario.fecha + 'T00:00:00'))}</span>
          <span class="cita-item__hora">${formatearHora(cita.bloques_horario.hora_inicio)}</span>
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

class GestorDetalleCita {
  static mostrar(citaId) {
    const citas = EstadoPsicologo.obtener('citasCargadas');
    const cita = citas.find((c) => c.id === citaId);
    if (!cita) return;

    EstadoPsicologo.establecer('citaSeleccionada', citaId);

    document.getElementById('detalle-paciente').textContent =
      `${cita.pacientes.nombre} ${cita.pacientes.apellido}`;
    document.getElementById('detalle-correo').textContent =
      cita.pacientes.correo;
    document.getElementById('detalle-telefono').textContent =
      cita.pacientes.telefono || 'No registrado';
    document.getElementById('detalle-fecha').textContent = formatearFecha(
      new Date(cita.bloques_horario.fecha + 'T00:00:00'),
    );
    document.getElementById('detalle-hora').textContent =
      `${formatearHora(cita.bloques_horario.hora_inicio)} - ${formatearHora(cita.bloques_horario.hora_fin)}`;
    document.getElementById('detalle-estado').textContent =
      cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);

    abrirModal('modal-detalle-cita');
  }

  static async cancelar() {
    const citaId = EstadoPsicologo.obtener('citaSeleccionada');
    if (!citaId) return;

    const exito = await RepositorioCitasPsicologo.cancelar(citaId);

    if (exito) {
      const pacienteId =
        await RepositorioCitasPsicologo.obtenerPacienteId(citaId);
      if (pacienteId) {
        await RepositorioCitasPsicologo.crearNotificacion(pacienteId, citaId);
      }

      mostrarMensaje('Cita cancelada. Se ha notificado al paciente.', 'exito');
      cerrarModal('modal-detalle-cita');

      const periodoActivo = document.querySelector('.periodo__boton--activo');
      const periodo = periodoActivo ? periodoActivo.dataset.periodo : 'hoy';
      RenderizadorCitas.cargarPeriodo(periodo);
    } else {
      mostrarMensaje('Error al cancelar la cita', 'error');
    }
  }
}

class ControladorEventosPsicologo {
  static inicializar() {
    document.querySelectorAll('.navegacion__boton').forEach((boton) => {
      boton.addEventListener('click', () => cambiarVista(boton.dataset.vista));
    });

    document.querySelectorAll('.periodo__boton').forEach((boton) => {
      boton.addEventListener('click', () => {
        document
          .querySelectorAll('.periodo__boton')
          .forEach((b) => b.classList.remove('periodo__boton--activo'));
        boton.classList.add('periodo__boton--activo');
        RenderizadorCitas.cargarPeriodo(boton.dataset.periodo);
      });
    });

    document
      .getElementById('btn-cerrar-sesion')
      ?.addEventListener('click', cerrarSesion);

    document
      .getElementById('formulario-horarios')
      ?.addEventListener('submit', (e) => GestorHorarios.guardar(e));

    document
      .querySelectorAll('.configuracion__checkbox')
      .forEach((checkbox) => {
        checkbox.addEventListener(
          'change',
          GestorConfiguracionUI.toggleHorariosDia,
        );
      });

    document
      .getElementById('btn-cerrar-detalle')
      ?.addEventListener('click', () => cerrarModal('modal-detalle-cita'));
    document
      .getElementById('btn-cerrar-detalle-2')
      ?.addEventListener('click', () => cerrarModal('modal-detalle-cita'));
    document
      .getElementById('btn-cancelar-cita-psicologo')
      ?.addEventListener('click', () => GestorDetalleCita.cancelar());
  }
}

class AplicacionPsicologo {
  static async inicializar() {
    const sesion = await verificarAutenticacion();
    if (!sesion) return;

    const usuario = await obtenerUsuarioActual();
    if (!usuario || usuario.rol !== 'psicologo') {
      window.location.href = 'index.html';
      return;
    }

    EstadoPsicologo.establecer('usuario', usuario);
    EstadoPsicologo.establecer('psicologoId', usuario.psicologo_id);

    const nombreElemento = document.getElementById('nombre-usuario');
    if (nombreElemento && usuario.psicologos) {
      nombreElemento.textContent = `Dr. ${usuario.psicologos.nombre} ${usuario.psicologos.apellido}`;
    }

    GestorConfiguracionUI.establecerFechasPorDefecto();
    ControladorEventosPsicologo.inicializar();
    await GestorConfiguracionUI.cargarConfiguracion();
    await RenderizadorCitas.cargarPeriodo('hoy');
  }
}

document.addEventListener('DOMContentLoaded', () =>
  AplicacionPsicologo.inicializar(),
);
