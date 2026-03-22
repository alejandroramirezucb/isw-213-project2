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
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const pacienteId = btn.dataset.pacienteId;
        const bloqueadoActual = btn.dataset.bloqueado === 'true';
        
        btn.disabled = true;
        btn.textContent = bloqueadoActual ? 'Desbloqueando...' : 'Bloqueando...';
        
        await GestorRestriccion.toggleBloqueo(pacienteId, bloqueadoActual);
        
        const busqueda = document.getElementById('busqueda-paciente')?.value || '';
        await this.cargar(busqueda);
      });
    });
  }

  static #mostrarDetalle(item) {
    NavigacionFachada.abrirModal('modal-historial-paciente');

    const nombrePaciente = document.getElementById('historial-nombre-paciente');
    if (nombrePaciente) {
      nombrePaciente.textContent = `${item.paciente.nombre} ${item.paciente.apellido}`;
    }

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

    doc.setFillColor(66, 133, 244);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL DE CITAS', margin, 20);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Paciente: ${item.paciente.nombre} ${item.paciente.apellido}`,
      margin,
      32,
    );
    doc.text(`Correo: ${item.paciente.correo}`, margin, 38);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, margin, 44);

    cursorY = 55;

    const tableData = item.citas.map((cita) => [
      FormateadorFecha.aTexto(new Date(cita.fecha + 'T00:00:00')),
      FormateadorHora.formatear(cita.hora),
      cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1),
    ]);

    if (tableData.length === 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text('No hay citas para mostrar', margin, cursorY);
      doc.save(
        `historial_${item.paciente.apellido}_${item.paciente.nombre}.pdf`,
      );
      return;
    }

    if (doc.autoTable) {
      doc.autoTable({
        startY: cursorY,
        head: [['Fecha', 'Hora', 'Estado']],
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
          0: { halign: 'center', cellWidth: 60 },
          1: { halign: 'center', cellWidth: 40 },
          2: { halign: 'center', cellWidth: 40 },
        },
      });

      cursorY = doc.lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setFillColor(66, 133, 244);
      doc.setTextColor(255, 255, 255);

      const colWidths = [60, 40, 40];
      const headers = ['Fecha', 'Hora', 'Estado'];

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
          doc.rect(margin, cursorY - 3, 140, 8, 'F');
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
    doc.text(footerText, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });

    doc.save(`historial_${item.paciente.apellido}_${item.paciente.nombre}.pdf`);
  }
}
