class GestorMisCitas {
  static #SELECTOR_LISTA = '#lista-mis-citas';
  static #SELECTOR_VACIO = '#sin-citas';
  static #SELECTOR_EXPORTAR = '#btn-exportar-pdf';
  static #CLASE_VACIO_OCULTO = 'mensaje-vacio--oculto';

  static #lista = null;
  static #vacio = null;
  static #botonExportar = null;
  static #filtroActual = 'proximas';
  static #citasActuales = [];

  static inicializar() {
    this.#lista = document.querySelector(this.#SELECTOR_LISTA);
    this.#vacio = document.querySelector(this.#SELECTOR_VACIO);
    this.#botonExportar = document.querySelector(this.#SELECTOR_EXPORTAR);

    if (this.#botonExportar) {
      this.#botonExportar.addEventListener('click', () => this.exportarPdf());
    }
  }

  static async cargar(filtro = 'proximas') {
    this.#filtroActual = filtro;
    const pacienteId = EstadoPaciente.obtener('pacienteId');
    const citas = await RepositorioCitas.obtenerPorFiltro(pacienteId, filtro);

    this.#citasActuales = citas;

    if (citas.length === 0) {
      this.#lista.innerHTML = '';
      this.#vacio.classList.remove(this.#CLASE_VACIO_OCULTO);
      return;
    }

    this.#vacio.classList.add(this.#CLASE_VACIO_OCULTO);

    let html = '';
    citas.forEach((cita) => {
      if (!cita.bloques_horario) return;

      const estadoClase = `cita-item__estado--${cita.estado}`;
      const estadoTexto =
        cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);

      html += `<article class="cita-item" data-cita-id="${cita.id}" data-estado="${cita.estado}">
        <div class="cita-item__info">
          <span class="cita-item__fecha">${FormateadorFecha.aTextoCorto(
            new Date(cita.bloques_horario.fecha + 'T00:00:00'),
          )}</span>
          <span class="cita-item__hora">${FormateadorHora.formatear(
            cita.bloques_horario.hora_inicio,
          )}</span>
        </div>
        <span class="cita-item__estado ${estadoClase}">${estadoTexto}</span>
      </article>`;
    });

    this.#lista.innerHTML = html;
    this.#agregarEventos(citas);
  }

  static #agregarEventos(citas) {
    this.#lista.querySelectorAll('.cita-item').forEach((elemento) => {
      elemento.addEventListener('click', () => {
        const citaId = elemento.dataset.citaId;
        const cita = citas.find((c) => c.id === citaId);

        if (cita && this.#filtroActual === 'proximas') {
          EstadoPaciente.establecer('citaACancelar', citaId);
          GestorCancelacion.mostrarModal();
        }
      });
    });
  }

  static exportarPdf() {
    if (!this.#citasActuales || this.#citasActuales.length === 0) {
      MensajesFachada.mostrar('No hay citas para exportar', 'error');
      return;
    }

    const pdfLib = window.jspdf;
    if (!pdfLib || !pdfLib.jsPDF) {
      MensajesFachada.mostrar(
        'No se pudo generar el PDF (biblioteca no cargada)',
        'error',
      );
      return;
    }

    const { jsPDF } = pdfLib;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let cursorY = margin;

    const usuario = EstadoPaciente.obtener('usuario');
    const nombrePaciente = usuario
      ? `${usuario.pacientes.nombre} ${usuario.pacientes.apellido}`
      : 'Paciente';

    doc.setFillColor(66, 133, 244); 
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL DE CITAS', margin, 20);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(`Paciente: ${nombrePaciente}`, margin, 32);
    doc.text(`Exportado: ${new Date().toLocaleDateString()}`, margin, 38);

    cursorY = 55;

    
    const tableData = this.#citasActuales
      .map((cita) => {
        if (!cita.bloques_horario) return null;

        const fecha = FormateadorFecha.aTextoCorto(
          new Date(cita.bloques_horario.fecha + 'T00:00:00'),
        );
        const hora = FormateadorHora.formatear(
          cita.bloques_horario.hora_inicio,
        );
        const duracion = `${cita.bloques_horario.hora_inicio.substring(0, 5)} - ${cita.bloques_horario.hora_fin.substring(0, 5)}`;
        const estado =
          cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);

        return [fecha, duracion, estado];
      })
      .filter((row) => row !== null);

    if (tableData.length === 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text('No hay citas para mostrar', margin, cursorY);
      doc.save('historial-citas.pdf');
      return;
    }

    
    if (doc.autoTable) {
      doc.autoTable({
        startY: cursorY,
        head: [['Fecha', 'Horario', 'Estado']],
        body: tableData,
        margin: { left: margin, right: margin },
        headStyles: {
          fillColor: [66, 133, 244],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          textColor: 0,
          halign: 'center',
        },
        alternateRowStyles: {
          fillColor: [242, 242, 242],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 40 },
          1: { halign: 'center', cellWidth: 50 },
          2: { halign: 'center', cellWidth: 40 },
        },
      });

      cursorY = doc.lastAutoTable.finalY + 10;
    } else {
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setFillColor(66, 133, 244);
      doc.setTextColor(255, 255, 255);

      const colWidths = [40, 50, 40];
      const headers = ['Fecha', 'Horario', 'Estado'];

      headers.forEach((header, i) => {
        const xPos = margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.rect(xPos, cursorY, colWidths[i], 8, 'F');
        doc.text(header, xPos + 2, cursorY + 5);
      });

      cursorY += 10;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);

      tableData.forEach((row, idx) => {
        if (cursorY > pageHeight - 20) {
          doc.addPage();
          cursorY = margin;
        }

        if (idx % 2 === 0) {
          doc.setFillColor(242, 242, 242);
          doc.rect(margin, cursorY - 3, 130, 8, 'F');
        }

        row.forEach((cell, i) => {
          const xPos =
            margin + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
          doc.text(cell, xPos + 2, cursorY + 2);
        });

        cursorY += 8;
      });
    }

    
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    const footerText = `Documento generado automáticamente - ${new Date().toLocaleString()}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save('historial-citas.pdf');
    MensajesFachada.mostrar('PDF descargado exitosamente', 'exito');
  }
}
