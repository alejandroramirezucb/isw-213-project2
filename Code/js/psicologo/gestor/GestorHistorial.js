class GestorHistorial {
  static #lista = null;
  static #vacio = null;

  static inicializar() {
    this.#lista = document.getElementById('lista-historial');
    this.#vacio = document.getElementById('sin-historial');
  }

  static async cargar(busqueda = '') {
    const psicologoId = EstadoPsicologo.obtener('psicologoId');
    const historial =
      await RepositorioCitasPsicologo.obtenerHistorialPacientes(psicologoId);

    const filtrado = busqueda
      ? historial.filter((item) => {
          const nombre =
            `${item.paciente.nombre} ${item.paciente.apellido}`.toLowerCase();
          return nombre.includes(busqueda.toLowerCase());
        })
      : historial;

    if (filtrado.length === 0) {
      this.#lista.innerHTML = '';
      this.#vacio.classList.remove('mensaje-vacio--oculto');
      return;
    }

    this.#vacio.classList.add('mensaje-vacio--oculto');

    let html = '';
    filtrado.forEach((item) => {
      const total = item.citas.length;
      const completadas = item.citas.filter(
        (c) => c.estado === 'completada',
      ).length;
      const canceladas = item.citas.filter(
        (c) => c.estado === 'cancelada',
      ).length;
      const bloqueadoClase = item.paciente.bloqueado
        ? 'historial-paciente--bloqueado'
        : '';

      html += `<article class="historial-paciente ${bloqueadoClase}" data-paciente-id="${item.paciente.id}">
        <div class="historial-paciente__info">
          <span class="historial-paciente__nombre">${item.paciente.nombre} ${item.paciente.apellido}</span>
          <span class="historial-paciente__correo">${item.paciente.correo}</span>
          ${item.paciente.bloqueado ? '<span class="historial-paciente__estado">Bloqueado</span>' : ''}
        </div>
        <div class="historial-paciente__resumen">
          <span>${total} citas</span>
          <span class="historial-paciente__completadas">${completadas} completadas</span>
          <span class="historial-paciente__canceladas">${canceladas} canceladas</span>
        </div>
        <div class="historial-paciente__acciones">
          <button class="boton boton--secundario boton--pequeno btn-ver-historial" data-paciente-id="${item.paciente.id}">Ver historial</button>
          <button class="boton boton--pequeno ${item.paciente.bloqueado ? 'boton--primario' : 'boton--peligro'} btn-toggle-bloqueo"
            data-paciente-id="${item.paciente.id}"
            data-bloqueado="${item.paciente.bloqueado ? 'true' : 'false'}">
            ${item.paciente.bloqueado ? 'Desbloquear' : 'Bloquear'}
          </button>
        </div>
      </article>`;
    });

    this.#lista.innerHTML = html;
    this.#agregarEventos(filtrado);
  }

  static #agregarEventos(historial) {
    this.#lista.querySelectorAll('.btn-ver-historial').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pacienteId = btn.dataset.pacienteId;
        const item = historial.find((h) => h.paciente.id === pacienteId);
        if (item) this.#mostrarDetalle(item);
      });
    });

    this.#lista.querySelectorAll('.btn-toggle-bloqueo').forEach((btn) => {
      btn.addEventListener('click', () => {
        GestorRestriccion.toggleBloqueo(
          btn.dataset.pacienteId,
          btn.dataset.bloqueado === 'true',
        );
      });
    });
  }

  static #mostrarDetalle(item) {
    NavigacionFachada.abrirModal('modal-historial-paciente');

    document.getElementById('historial-nombre-paciente').textContent =
      `${item.paciente.nombre} ${item.paciente.apellido}`;

    let html = '';
    item.citas.forEach((cita) => {
      const estadoClase = `cita-item__estado--${cita.estado}`;
      const estadoTexto =
        cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);
      html += `<div class="cita-item">
        <div class="cita-item__info">
          <span class="cita-item__fecha">${FormateadorFecha.aTextoCorto(new Date(cita.fecha + 'T00:00:00'))}</span>
          <span class="cita-item__hora">${FormateadorHora.formatear(cita.hora)}</span>
        </div>
        <span class="cita-item__estado ${estadoClase}">${estadoTexto}</span>
      </div>`;
    });

    document.getElementById('lista-historial-paciente').innerHTML =
      html ||
      '<p style="text-align:center;color:var(--texto-sec)">Sin citas registradas</p>';

    const btnDescargar = document.getElementById('btn-descargar-historial');
    if (btnDescargar) {
      btnDescargar.onclick = () => this.#descargarHistorial(item);
    }
  }

  static #descargarHistorial(item) {
    const lineas = [
      `Historial de Citas - ${item.paciente.nombre} ${item.paciente.apellido}`,
      `Correo: ${item.paciente.correo}`,
      `Generado: ${new Date().toLocaleDateString('es-ES')}`,
      '',
      'Fecha\t\t\tHora\t\tEstado',
      '─'.repeat(50),
    ];

    item.citas.forEach((cita) => {
      lineas.push(
        `${FormateadorFecha.aTexto(new Date(cita.fecha + 'T00:00:00'))}\t${FormateadorHora.formatear(cita.hora)}\t${cita.estado}`,
      );
    });

    const blob = new Blob([lineas.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_${item.paciente.apellido}_${item.paciente.nombre}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
