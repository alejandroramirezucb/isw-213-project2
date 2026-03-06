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
          <span class="cita-item__fecha">${Fachada.formatearFechaCorta(new Date(cita.bloques_horario.fecha + 'T00:00:00'))}</span>
          <span class="cita-item__hora">${Fachada.formatearHora(cita.bloques_horario.hora_inicio)}</span>
        </div>
        <span class="cita-item__estado ${estadoClase}">${estadoTexto}</span>
      </article>`;
    });

    this.#lista.innerHTML = html;
  }
}
