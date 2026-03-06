class EstadoPaciente {
  static #estado = {
    usuario: null,
    pacienteId: null,
    fechaActual: new Date(),
    fechaSeleccionada: null,
    bloqueSeleccionado: null,
    citaACancelar: null,
    citaAReprogramar: null,
    modoReprogramacion: false,
  };

  static obtener(clave) {
    return this.#estado[clave];
  }
  static establecer(clave, valor) {
    this.#estado[clave] = valor;
  }
  static reiniciarBloque() {
    this.#estado.bloqueSeleccionado = null;
  }
}

class RepositorioBloques {
  static async obtenerDisponibilidadMes(anio, mes) {
    const fechaInicio = `${anio}-${String(mes + 1).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
    const fechaFin = `${anio}-${String(mes + 1).padStart(2, '0')}-${ultimoDia}`;

    const resultado = await clienteSupabase
      .from('bloques_horario')
      .select('fecha')
      .eq('estado', 'disponible')
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin);

    const disponibilidad = {};
    if (resultado.data) {
      resultado.data.forEach((bloque) => {
        disponibilidad[bloque.fecha] = true;
      });
    }
    return disponibilidad;
  }

  static async obtenerPorFecha(fecha) {
    await clienteSupabase.rpc('liberar_bloques_expirados');

    const resultado = await clienteSupabase
      .from('bloques_horario')
      .select('*')
      .eq('fecha', fecha)
      .in('estado', ['disponible', 'bloqueado_temporal'])
      .order('hora_inicio');

    return resultado.data || [];
  }

  static async bloquearTemporal(bloqueId) {
    const resultado = await clienteSupabase.rpc('bloquear_bloque_temporal', {
      p_bloque_id: bloqueId,
      p_minutos: 5,
    });
    return !resultado.error;
  }

  static async liberarTemporal(bloqueId) {
    await clienteSupabase
      .from('bloques_horario')
      .update({ estado: 'disponible', bloqueado_hasta: null })
      .eq('id', bloqueId)
      .eq('estado', 'bloqueado_temporal');
  }

  static async marcarReservado(bloqueId) {
    const resultado = await clienteSupabase
      .from('bloques_horario')
      .update({ estado: 'reservado', bloqueado_hasta: null })
      .eq('id', bloqueId);
    return !resultado.error;
  }

  static async obtenerProfesional(bloqueId) {
    const resultado = await clienteSupabase
      .from('bloques_horario')
      .select('psicologo_id')
      .eq('id', bloqueId)
      .single();
    return resultado.data;
  }
}

class RepositorioCitas {
  static async crear(pacienteId, profesionalId, bloqueId) {
    const resultado = await clienteSupabase.from('citas').insert({
      paciente_id: pacienteId,
      psicologo_id: profesionalId,
      bloque_id: bloqueId,
      estado: 'confirmada',
    });
    return !resultado.error;
  }

  static async obtenerProxima(pacienteId) {
    const hoy = obtenerFechaISO(new Date());

    const resultado = await clienteSupabase
      .from('citas')
      .select('id, estado, bloques_horario(fecha, hora_inicio, hora_fin)')
      .eq('paciente_id', pacienteId)
      .eq('estado', 'confirmada')
      .gte('bloques_horario.fecha', hoy)
      .order('bloques_horario(fecha)', { ascending: true })
      .limit(1);

    if (resultado.data?.length > 0 && resultado.data[0].bloques_horario) {
      return resultado.data[0];
    }
    return null;
  }

  static async obtenerPorFiltro(pacienteId, filtro) {
    const hoy = obtenerFechaISO(new Date());

    let query = clienteSupabase
      .from('citas')
      .select(
        'id, estado, creado_en, bloques_horario(fecha, hora_inicio, hora_fin)',
      )
      .eq('paciente_id', pacienteId);

    if (filtro === 'proximas') {
      query = query
        .eq('estado', 'confirmada')
        .gte('bloques_horario.fecha', hoy);
    } else if (filtro === 'pasadas') {
      query = query
        .in('estado', ['completada', 'confirmada'])
        .lt('bloques_horario.fecha', hoy);
    } else if (filtro === 'canceladas') {
      query = query.eq('estado', 'cancelada');
    }

    const resultado = await query.order('bloques_horario(fecha)', {
      ascending: filtro === 'proximas',
    });
    return resultado.data || [];
  }

  static async cancelar(citaId) {
    const resultado = await clienteSupabase.rpc(
      'cancelar_cita_y_liberar_bloque',
      {
        p_cita_id: citaId,
        p_cancelada_por: 'paciente',
      },
    );
    return !resultado.error;
  }

  static async crearNotificacion(pacienteId, tipo, citaId) {
    await clienteSupabase.from('notificaciones').insert({
      destinatario_tipo: 'paciente',
      destinatario_id: pacienteId,
      cita_id: citaId,
      tipo: tipo,
      canal: 'email',
    });
  }
}

class RenderizadorCalendario {
  static #contenedor = null;
  static #tituloMes = null;

  static inicializar() {
    this.#contenedor = document.getElementById('calendario-dias');
    this.#tituloMes = document.getElementById('calendario-mes');
  }

  static async renderizar() {
    const fechaActual = EstadoPaciente.obtener('fechaActual');
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();

    this.#tituloMes.textContent = `${NOMBRES_MESES[mes]} ${anio}`;

    const primerDia = new Date(anio, mes, 1);
    const ultimoDia = new Date(anio, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();

    const disponibilidad = await RepositorioBloques.obtenerDisponibilidadMes(
      anio,
      mes,
    );

    let html = '';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    for (let i = 0; i < diaInicioSemana; i++) {
      html +=
        '<button class="calendario__dia calendario__dia--vacio"></button>';
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      fechaDia.setHours(0, 0, 0, 0);
      const fechaISO = obtenerFechaISO(fechaDia);

      let clases = 'calendario__dia';
      const esPasado = fechaDia < hoy;

      if (fechaDia.getTime() === hoy.getTime())
        clases += ' calendario__dia--hoy';
      if (esPasado) clases += ' calendario__dia--pasado';
      if (!disponibilidad[fechaISO] && !esPasado)
        clases += ' calendario__dia--sin-disponibilidad';

      html += `<button class="${clases}" data-fecha="${fechaISO}"${esPasado ? ' disabled' : ''}>${dia}</button>`;
    }

    this.#contenedor.innerHTML = html;
    this.#agregarEventos();
  }

  static #agregarEventos() {
    this.#contenedor
      .querySelectorAll(
        '.calendario__dia:not(.calendario__dia--vacio):not(.calendario__dia--pasado)',
      )
      .forEach((dia) =>
        dia.addEventListener('click', () => this.#seleccionarDia(dia)),
      );
  }

  static async #seleccionarDia(elemento) {
    const fecha = elemento.dataset.fecha;

    this.#contenedor.querySelectorAll('.calendario__dia').forEach((d) => {
      d.classList.remove('calendario__dia--seleccionado');
    });
    elemento.classList.add('calendario__dia--seleccionado');

    EstadoPaciente.establecer('fechaSeleccionada', fecha);
    document.getElementById('fecha-seleccionada').textContent =
      formatearFechaCorta(new Date(fecha + 'T00:00:00'));

    await RenderizadorHorarios.cargar(fecha);
  }
}

class RenderizadorHorarios {
  static #seccion = null;
  static #lista = null;
  static #vacio = null;

  static inicializar() {
    this.#seccion = document.getElementById('seccion-horarios');
    this.#lista = document.getElementById('lista-horarios');
    this.#vacio = document.getElementById('sin-horarios');
  }

  static async cargar(fecha) {
    this.#seccion.classList.remove('horarios--oculto');
    this.#lista.innerHTML = '<p class="cargando">Cargando horarios...</p>';

    const bloques = await RepositorioBloques.obtenerPorFecha(fecha);

    if (bloques.length === 0) {
      this.#lista.innerHTML = '';
      this.#vacio.classList.remove('horarios__vacio--oculto');
      return;
    }

    this.#vacio.classList.add('horarios__vacio--oculto');

    let html = '';
    bloques.forEach((bloque) => {
      const hora = formatearHora(bloque.hora_inicio);
      const bloqueado = bloque.estado === 'bloqueado_temporal';
      const clases =
        'horarios__boton' + (bloqueado ? ' horarios__boton--bloqueado' : '');
      html += `<button class="${clases}" data-bloque-id="${bloque.id}"${bloqueado ? ' disabled' : ''}>${hora}</button>`;
    });

    this.#lista.innerHTML = html;
    this.#agregarEventos();
  }

  static #agregarEventos() {
    this.#lista
      .querySelectorAll('.horarios__boton:not(.horarios__boton--bloqueado)')
      .forEach((btn) =>
        btn.addEventListener('click', () => this.#seleccionarHorario(btn)),
      );
  }

  static async #seleccionarHorario(boton) {
    const usuario = EstadoPaciente.obtener('usuario');
    if (usuario.pacientes?.bloqueado) {
      mostrarMensaje(
        'No es posible agendar en este momento, comuníquese directamente con administración.',
        'error',
      );
      return;
    }

    const bloqueId = boton.dataset.bloqueId;
    const exito = await RepositorioBloques.bloquearTemporal(bloqueId);

    if (!exito) {
      mostrarMensaje('Este horario ya no está disponible', 'error');
      await this.cargar(EstadoPaciente.obtener('fechaSeleccionada'));
      return;
    }

    EstadoPaciente.establecer('bloqueSeleccionado', bloqueId);

    this.#lista.querySelectorAll('.horarios__boton').forEach((b) => {
      b.classList.remove('horarios__boton--seleccionado');
    });
    boton.classList.add('horarios__boton--seleccionado');

    const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
    document.getElementById('resumen-fecha').textContent = formatearFecha(
      new Date(fechaSel + 'T00:00:00'),
    );
    document.getElementById('resumen-hora').textContent = boton.textContent;

    const esReprogramacion = EstadoPaciente.obtener('modoReprogramacion');
    const tituloModal = document.getElementById('titulo-modal-reserva');
    const textoConfirmacion = document.getElementById(
      'texto-confirmacion-reserva',
    );

    if (esReprogramacion) {
      tituloModal.textContent = 'Confirmar Reprogramación';
      textoConfirmacion.textContent =
        '¿Deseas reprogramar tu cita a este nuevo horario?';
    } else {
      tituloModal.textContent = 'Confirmar Reserva';
      textoConfirmacion.textContent = '¿Deseas confirmar esta cita?';
    }

    abrirModal('modal-reserva');
  }
}

class GestorReservas {
  static async confirmar() {
    const bloqueId = EstadoPaciente.obtener('bloqueSeleccionado');
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const usuario = EstadoPaciente.obtener('usuario');

    if (!bloqueId || !pacienteId) return;

    if (usuario.pacientes?.bloqueado) {
      mostrarMensaje('No es posible agendar en este momento', 'error');
      this.cerrarModal();
      return;
    }

    try {
      const esReprogramacion = EstadoPaciente.obtener('modoReprogramacion');

      if (esReprogramacion) {
        const citaAnterior = EstadoPaciente.obtener('citaAReprogramar');
        if (citaAnterior) {
          await RepositorioCitas.cancelar(citaAnterior);
        }
      }

      const bloque = await RepositorioBloques.obtenerProfesional(bloqueId);
      const citaCreada = await RepositorioCitas.crear(
        pacienteId,
        bloque.psicologo_id,
        bloqueId,
      );

      if (!citaCreada) throw new Error('Error al crear cita');

      const bloqueActualizado =
        await RepositorioBloques.marcarReservado(bloqueId);
      if (!bloqueActualizado) throw new Error('Error al actualizar bloque');

      await RepositorioCitas.crearNotificacion(
        pacienteId,
        'confirmacion',
        null,
      );

      if (esReprogramacion) {
        mostrarMensaje('Cita reprogramada exitosamente', 'exito');
        GestorReprogramacion.salir();
      } else {
        mostrarMensaje('Cita reservada exitosamente', 'exito');
      }

      this.cerrarModal(true);

      const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
      await RenderizadorHorarios.cargar(fechaSel);
      await GestorProximaCita.cargar();
    } catch (error) {
      mostrarMensaje('Error al reservar la cita', 'error');
      await RepositorioBloques.liberarTemporal(bloqueId);
    }
  }

  static async cerrarModal(reservaExitosa = false) {
    cerrarModal('modal-reserva');

    const bloqueId = EstadoPaciente.obtener('bloqueSeleccionado');
    if (bloqueId && !reservaExitosa) {
      await RepositorioBloques.liberarTemporal(bloqueId);
      EstadoPaciente.reiniciarBloque();

      const fechaSel = EstadoPaciente.obtener('fechaSeleccionada');
      if (fechaSel) {
        await RenderizadorHorarios.cargar(fechaSel);
      }
    }

    if (!reservaExitosa) {
      EstadoPaciente.reiniciarBloque();
    }
  }
}

class GestorReprogramacion {
  static iniciar() {
    const citaId = EstadoPaciente.obtener('citaACancelar');
    if (!citaId) return;

    const proxima = document.getElementById('proxima-cita');
    const fechaTexto =
      document.getElementById('proxima-cita-fecha')?.textContent;
    const horaTexto = document.getElementById('proxima-cita-hora')?.textContent;

    if (!this.#verificarLimite24h(fechaTexto, horaTexto)) {
      mostrarMensaje(
        'No es posible reprogramar con menos de 24 horas de anticipación',
        'error',
      );
      return;
    }

    EstadoPaciente.establecer('modoReprogramacion', true);
    EstadoPaciente.establecer('citaAReprogramar', citaId);

    const banner = document.getElementById('banner-reprogramacion');
    const textoReprog = document.getElementById('texto-reprogramacion');
    banner.classList.remove('banner-reprogramacion--oculto');
    textoReprog.textContent =
      'Selecciona un nuevo día y horario para reprogramar tu cita';
  }

  static salir() {
    EstadoPaciente.establecer('modoReprogramacion', false);
    EstadoPaciente.establecer('citaAReprogramar', null);

    const banner = document.getElementById('banner-reprogramacion');
    banner.classList.add('banner-reprogramacion--oculto');
  }

  static #verificarLimite24h(fechaTexto, horaTexto) {
    if (!fechaTexto || !horaTexto) return false;

    const ahora = new Date();
    const meses = FormateadorFecha.MESES;
    const partes = fechaTexto.split(' de ');
    if (partes.length < 2) return true;

    const dia = parseInt(partes[0]);
    const mesIndex = meses.indexOf(partes[1]);
    if (mesIndex === -1) return true;

    const anio = ahora.getFullYear();
    const horaPartes = horaTexto.split(':');
    const fechaCita = new Date(
      anio,
      mesIndex,
      dia,
      parseInt(horaPartes[0]),
      parseInt(horaPartes[1]),
    );

    const diferenciaMs = fechaCita.getTime() - ahora.getTime();
    const horasRestantes = diferenciaMs / (1000 * 60 * 60);

    return horasRestantes >= 24;
  }
}

class GestorProximaCita {
  static #contenedor = null;

  static inicializar() {
    this.#contenedor = document.getElementById('proxima-cita');
  }

  static async cargar() {
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const cita = await RepositorioCitas.obtenerProxima(pacienteId);

    if (cita) {
      this.#contenedor.classList.remove('tarjeta-cita--oculta');
      document.getElementById('proxima-cita-fecha').textContent =
        formatearFechaCorta(new Date(cita.bloques_horario.fecha + 'T00:00:00'));
      document.getElementById('proxima-cita-hora').textContent = formatearHora(
        cita.bloques_horario.hora_inicio,
      );
      EstadoPaciente.establecer('citaACancelar', cita.id);
    } else {
      this.#contenedor.classList.add('tarjeta-cita--oculta');
      EstadoPaciente.establecer('citaACancelar', null);
    }
  }
}

class GestorMisCitas {
  static #lista = null;
  static #vacio = null;

  static inicializar() {
    this.#lista = document.getElementById('lista-mis-citas');
    this.#vacio = document.getElementById('sin-citas');
  }

  static async cargar(filtro) {
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const citas = await RepositorioCitas.obtenerPorFiltro(pacienteId, filtro);

    if (citas.length === 0) {
      this.#lista.innerHTML = '';
      this.#vacio.classList.remove('mensaje-vacio--oculto');
      return;
    }

    this.#vacio.classList.add('mensaje-vacio--oculto');

    let html = '';
    citas.forEach((cita) => {
      if (!cita.bloques_horario) return;

      const estadoClase = `cita-item__estado--${cita.estado}`;
      const estadoTexto =
        cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);

      html += `<article class="cita-item">
        <div class="cita-item__info">
          <span class="cita-item__fecha">${formatearFechaCorta(new Date(cita.bloques_horario.fecha + 'T00:00:00'))}</span>
          <span class="cita-item__hora">${formatearHora(cita.bloques_horario.hora_inicio)}</span>
        </div>
        <span class="cita-item__estado ${estadoClase}">${estadoTexto}</span>
      </article>`;
    });

    this.#lista.innerHTML = html;
  }
}

class GestorCancelacion {
  static mostrarModal() {
    abrirModal('modal-cancelacion');
  }

  static async cancelar() {
    const citaId = EstadoPaciente.obtener('citaACancelar');
    if (!citaId) return;

    const exito = await RepositorioCitas.cancelar(citaId);

    if (exito) {
      mostrarMensaje('Cita cancelada exitosamente', 'exito');
      cerrarModal('modal-cancelacion');
      await GestorProximaCita.cargar();
      await RenderizadorCalendario.renderizar();
    } else {
      mostrarMensaje('Error al cancelar la cita', 'error');
    }
  }
}

class ControladorEventosPaciente {
  static inicializar() {
    document.querySelectorAll('.navegacion__boton').forEach((boton) => {
      boton.addEventListener('click', () => {
        cambiarVista(boton.dataset.vista);
        if (boton.dataset.vista === 'mis-citas') {
          GestorMisCitas.cargar('proximas');
        }
      });
    });

    document
      .getElementById('btn-mes-anterior')
      ?.addEventListener('click', () => {
        const fecha = EstadoPaciente.obtener('fechaActual');
        fecha.setMonth(fecha.getMonth() - 1);
        RenderizadorCalendario.renderizar();
      });

    document
      .getElementById('btn-mes-siguiente')
      ?.addEventListener('click', () => {
        const fecha = EstadoPaciente.obtener('fechaActual');
        fecha.setMonth(fecha.getMonth() + 1);
        RenderizadorCalendario.renderizar();
      });

    document
      .getElementById('btn-cerrar-sesion')
      ?.addEventListener('click', cerrarSesion);

    document
      .getElementById('btn-cerrar-modal')
      ?.addEventListener('click', () => GestorReservas.cerrarModal());
    document
      .getElementById('btn-cancelar-reserva')
      ?.addEventListener('click', () => GestorReservas.cerrarModal());
    document
      .getElementById('btn-confirmar-reserva')
      ?.addEventListener('click', () => GestorReservas.confirmar());

    document
      .getElementById('btn-cerrar-modal-cancelacion')
      ?.addEventListener('click', () => cerrarModal('modal-cancelacion'));
    document
      .getElementById('btn-no-cancelar')
      ?.addEventListener('click', () => cerrarModal('modal-cancelacion'));
    document
      .getElementById('btn-si-cancelar')
      ?.addEventListener('click', () => GestorCancelacion.cancelar());

    document
      .getElementById('btn-cancelar-proxima')
      ?.addEventListener('click', () => GestorCancelacion.mostrarModal());
    document
      .getElementById('btn-reprogramar-proxima')
      ?.addEventListener('click', () => GestorReprogramacion.iniciar());
    document
      .getElementById('btn-cancelar-reprogramacion')
      ?.addEventListener('click', () => GestorReprogramacion.salir());

    document.querySelectorAll('.filtros__boton').forEach((boton) => {
      boton.addEventListener('click', () => {
        document
          .querySelectorAll('.filtros__boton')
          .forEach((b) => b.classList.remove('filtros__boton--activo'));
        boton.classList.add('filtros__boton--activo');
        GestorMisCitas.cargar(boton.dataset.filtro);
      });
    });
  }
}

class AplicacionPaciente {
  static async inicializar() {
    const sesion = await verificarAutenticacion();
    if (!sesion) return;

    const usuario = await obtenerUsuarioActual();
    if (!usuario || usuario.rol !== 'paciente') {
      window.location.href = 'index.html';
      return;
    }

    EstadoPaciente.establecer('usuario', usuario);
    EstadoPaciente.establecer('pacienteId', usuario.paciente_id);

    const nombreElemento = document.getElementById('nombre-usuario');
    if (nombreElemento && usuario.pacientes) {
      nombreElemento.textContent = `${usuario.pacientes.nombre} ${usuario.pacientes.apellido}`;
    }

    if (usuario.pacientes?.bloqueado) {
      mostrarMensaje(
        'No es posible agendar en este momento, comuníquese directamente con administración.',
        'error',
        10000,
      );
    }

    RenderizadorCalendario.inicializar();
    RenderizadorHorarios.inicializar();
    GestorProximaCita.inicializar();
    GestorMisCitas.inicializar();
    ControladorEventosPaciente.inicializar();

    await RenderizadorCalendario.renderizar();
    await GestorProximaCita.cargar();
  }
}

document.addEventListener('DOMContentLoaded', () =>
  AplicacionPaciente.inicializar(),
);
