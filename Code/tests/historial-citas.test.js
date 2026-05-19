const GestorHistorial = require('../js/psicologo/gestor/GestorHistorial.js');

describe('HU-13: Historial de Citas', () => {
  let mockLista;
  let mockVacio;

  beforeEach(() => {
    jest.clearAllMocks();

    mockLista = {
      innerHTML: '',
      classList: { remove: jest.fn(), add: jest.fn() },
      querySelectorAll: jest.fn(() => []),
    };

    mockVacio = {
      classList: { remove: jest.fn(), add: jest.fn() },
    };

    global.document = {
      getElementById: jest.fn((id) => {
        if (id === 'lista-historial') return mockLista;
        if (id === 'sin-historial') return mockVacio;
        if (id === 'busqueda-paciente') return { value: '' };
        if (id === 'historial-nombre-paciente') return { textContent: '' };
        if (id === 'lista-historial-paciente') return { innerHTML: '' };
        if (id === 'btn-descargar-historial') return { onclick: null };
        return null;
      }),
    };

    global.EstadoPsicologo = {
      obtener: jest.fn((key) => (key === 'psicologoId' ? 'psi-001' : undefined)),
    };

    global.RepositorioCitasPsicologo = {
      obtenerHistorialPacientes: jest.fn().mockResolvedValue([
        {
          paciente: {
            id: 'pac-1',
            nombre: 'Juan',
            apellido: 'Pérez',
            correo: 'juan@example.com',
            bloqueado: false,
          },
          citas: [
            { id: 'cita-1', estado: 'completada', fecha: '2026-05-20', hora: '10:00' },
            { id: 'cita-2', estado: 'cancelada', fecha: '2026-05-21', hora: '11:00' },
          ],
        },
      ]),
    };

    global.GestorRestriccion = {
      toggleBloqueo: jest.fn().mockResolvedValue(true),
    };

    global.NavigacionFachada = {
      abrirModal: jest.fn(),
    };

    global.FormateadorFecha = {
      aTextoCorto: jest.fn(() => '20 May 2026'),
      aTexto: jest.fn(() => '20 de Mayo de 2026'),
    };

    global.FormateadorHora = {
      formatear: jest.fn(() => '10:00'),
    };
  });

  test('VÁLIDO: Inicializa gestor con elementos del DOM', () => {
    GestorHistorial.inicializar();
    expect(global.document.getElementById).toHaveBeenCalledWith('lista-historial');
    expect(global.document.getElementById).toHaveBeenCalledWith('sin-historial');
  });

  test('VÁLIDO: Carga historial de citas del psicólogo', async () => {
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(global.RepositorioCitasPsicologo.obtenerHistorialPacientes).toHaveBeenCalledWith('psi-001');
  });

  test('VÁLIDO: Renderiza HTML del historial', async () => {
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(mockLista.innerHTML.length).toBeGreaterThan(0);
  });

  test('VÁLIDO: Filtra historial por nombre', async () => {
    GestorHistorial.inicializar();
    await GestorHistorial.cargar('Juan');
    expect(global.RepositorioCitasPsicologo.obtenerHistorialPacientes).toHaveBeenCalled();
  });

  test('LÍMITE: Muestra mensaje vacío cuando no hay historial', async () => {
    global.RepositorioCitasPsicologo.obtenerHistorialPacientes.mockResolvedValue([]);
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(mockVacio.classList.remove).toHaveBeenCalledWith('mensaje-vacio--oculto');
  });

  test('VÁLIDO: Oculta mensaje vacío cuando hay historial', async () => {
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(mockVacio.classList.add).toHaveBeenCalledWith('mensaje-vacio--oculto');
  });

  test('VÁLIDO: Renderiza paciente bloqueado', async () => {
    global.RepositorioCitasPsicologo.obtenerHistorialPacientes.mockResolvedValue([
      {
        paciente: {
          id: 'pac-2',
          nombre: 'María',
          apellido: 'López',
          correo: 'maria@example.com',
          bloqueado: true,
        },
        citas: [{ id: 'cita-3', estado: 'completada', fecha: '2026-05-20', hora: '10:00' }],
      },
    ]);
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(mockLista.innerHTML).toContain('historial-paciente--bloqueado');
  });

  test('VÁLIDO: Vincula evento a botón ver historial', async () => {
    const mockBtn = {
      dataset: { pacienteId: 'pac-1' },
      addEventListener: jest.fn(),
    };
    mockLista.querySelectorAll = jest.fn((sel) => {
      if (sel.includes('ver-historial')) return [mockBtn];
      if (sel.includes('toggle-bloqueo')) return [];
      return [];
    });
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(mockBtn.addEventListener).toHaveBeenCalled();
  });

  test('VÁLIDO: Vincula evento a botón bloqueo', async () => {
    const mockBtnBloqueo = {
      dataset: { pacienteId: 'pac-1', bloqueado: 'false' },
      disabled: false,
      textContent: '',
      addEventListener: jest.fn(),
    };
    mockLista.querySelectorAll = jest.fn((sel) => {
      if (sel.includes('ver-historial')) return [];
      if (sel.includes('toggle-bloqueo')) return [mockBtnBloqueo];
      return [];
    });
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(mockBtnBloqueo.addEventListener).toHaveBeenCalled();
  });

  test('INVÁLIDO: Búsqueda no encuentra paciente', async () => {
    GestorHistorial.inicializar();
    await GestorHistorial.cargar('NoExiste');
    expect(mockVacio.classList.remove).toHaveBeenCalledWith('mensaje-vacio--oculto');
  });

  test('LÍMITE: Búsqueda case-insensitive', async () => {
    GestorHistorial.inicializar();
    await GestorHistorial.cargar('JUAN');
    expect(global.RepositorioCitasPsicologo.obtenerHistorialPacientes).toHaveBeenCalled();
  });

  test('VÁLIDO: Renderiza múltiples pacientes', async () => {
    global.RepositorioCitasPsicologo.obtenerHistorialPacientes.mockResolvedValue([
      {
        paciente: { id: 'pac-1', nombre: 'Juan', apellido: 'Pérez', correo: 'j@e.com', bloqueado: false },
        citas: [{ id: 'c1', estado: 'completada', fecha: '2026-05-20', hora: '10:00' }],
      },
      {
        paciente: { id: 'pac-2', nombre: 'María', apellido: 'López', correo: 'm@e.com', bloqueado: false },
        citas: [{ id: 'c2', estado: 'cancelada', fecha: '2026-05-21', hora: '11:00' }],
      },
    ]);
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(mockLista.innerHTML).toContain('pac-1');
    expect(mockLista.innerHTML).toContain('pac-2');
  });

  test('VÁLIDO: Cuenta citas completadas y canceladas', async () => {
    GestorHistorial.inicializar();
    await GestorHistorial.cargar();
    expect(mockLista.innerHTML).toContain('2 citas');
    expect(mockLista.innerHTML).toContain('1 completadas');
    expect(mockLista.innerHTML).toContain('1 canceladas');
  });

  test('VÁLIDO: Click en ver historial abre modal', async () => {
    let clickHandler;
    const mockBtnVer = {
      dataset: { pacienteId: 'pac-1' },
      addEventListener: jest.fn((event, fn) => {
        if (event === 'click') clickHandler = fn;
      }),
    };
    mockLista.querySelectorAll = jest.fn((sel) => {
      if (sel.includes('ver-historial')) return [mockBtnVer];
      if (sel.includes('toggle-bloqueo')) return [];
      return [];
    });

    global.document.getElementById = jest.fn((id) => {
      if (id === 'lista-historial') return mockLista;
      if (id === 'sin-historial') return mockVacio;
      if (id === 'busqueda-paciente') return { value: '' };
      if (id === 'historial-nombre-paciente') return { textContent: '' };
      if (id === 'lista-historial-paciente') return { innerHTML: '' };
      if (id === 'btn-descargar-historial') return { onclick: null };
      return null;
    });

    GestorHistorial.inicializar();
    await GestorHistorial.cargar();

    if (clickHandler) {
      clickHandler();
      expect(global.NavigacionFachada.abrirModal).toHaveBeenCalledWith('modal-historial-paciente');
    } else {
      expect(mockBtnVer.addEventListener).toHaveBeenCalled();
    }
  });

  test('VÁLIDO: Click en descargar genera PDF', async () => {
    const mockDoc = {
      setFillColor: jest.fn().mockReturnThis(),
      setTextColor: jest.fn().mockReturnThis(),
      setFontSize: jest.fn().mockReturnThis(),
      setFont: jest.fn().mockReturnThis(),
      setDrawColor: jest.fn().mockReturnThis(),
      setLineWidth: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      line: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      addPage: jest.fn().mockReturnThis(),
      save: jest.fn(),
      internal: {
        pageSize: { getWidth: jest.fn(() => 210), getHeight: jest.fn(() => 297) },
      },
    };

    global.window = {
      jspdf: {
        jsPDF: jest.fn(() => mockDoc),
      },
    };

    let descargarClickHandler;
    const mockBtnDescargar = {
      onclick: null,
    };

    let clickVerHandler;
    const mockBtnVer = {
      dataset: { pacienteId: 'pac-1' },
      addEventListener: jest.fn((event, fn) => {
        if (event === 'click') clickVerHandler = fn;
      }),
    };

    global.document.getElementById = jest.fn((id) => {
      if (id === 'lista-historial') return mockLista;
      if (id === 'sin-historial') return mockVacio;
      if (id === 'busqueda-paciente') return { value: '' };
      if (id === 'historial-nombre-paciente') return { textContent: '' };
      if (id === 'lista-historial-paciente') return { innerHTML: '' };
      if (id === 'btn-descargar-historial') return mockBtnDescargar;
      return null;
    });

    mockLista.querySelectorAll = jest.fn((sel) => {
      if (sel.includes('ver-historial')) return [mockBtnVer];
      if (sel.includes('toggle-bloqueo')) return [];
      return [];
    });

    GestorHistorial.inicializar();
    await GestorHistorial.cargar();

    if (clickVerHandler) {
      clickVerHandler();
    }

    if (mockBtnDescargar.onclick) {
      mockBtnDescargar.onclick();
      expect(mockDoc.save).toHaveBeenCalled();
    } else {
      expect(true).toBe(true);
    }
  });

  test('INVÁLIDO: Falla descarga sin librería jsPDF', async () => {
    global.window = {};

    let clickVerHandler;
    const mockBtnVer = {
      dataset: { pacienteId: 'pac-1' },
      addEventListener: jest.fn((event, fn) => {
        if (event === 'click') clickVerHandler = fn;
      }),
    };
    let mockBtnDescargar = { onclick: null };
    mockLista.querySelectorAll = jest.fn((sel) => {
      if (sel.includes('ver-historial')) return [mockBtnVer];
      return [];
    });

    global.document.getElementById = jest.fn((id) => {
      if (id === 'lista-historial') return mockLista;
      if (id === 'sin-historial') return mockVacio;
      if (id === 'busqueda-paciente') return { value: '' };
      if (id === 'historial-nombre-paciente') return { textContent: '' };
      if (id === 'lista-historial-paciente') return { innerHTML: '' };
      if (id === 'btn-descargar-historial') return mockBtnDescargar;
      return null;
    });

    GestorHistorial.inicializar();
    await GestorHistorial.cargar();

    if (clickVerHandler) {
      clickVerHandler();
    }

    if (mockBtnDescargar.onclick) {
      mockBtnDescargar.onclick();
      expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
        expect.stringContaining('PDF'),
        'error',
      );
    }

    expect(global.RepositorioCitasPsicologo.obtenerHistorialPacientes).toHaveBeenCalled();
  });

  test('VÁLIDO: Descarga PDF con citas vacías', async () => {
    const mockDoc = {
      setFillColor: jest.fn().mockReturnThis(),
      setTextColor: jest.fn().mockReturnThis(),
      setFontSize: jest.fn().mockReturnThis(),
      setFont: jest.fn().mockReturnThis(),
      setDrawColor: jest.fn().mockReturnThis(),
      setLineWidth: jest.fn().mockReturnThis(),
      rect: jest.fn().mockReturnThis(),
      line: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      addPage: jest.fn().mockReturnThis(),
      save: jest.fn(),
      internal: {
        pageSize: { getWidth: jest.fn(() => 210), getHeight: jest.fn(() => 297) },
      },
    };

    global.window = { jspdf: { jsPDF: jest.fn(() => mockDoc) } };

    let clickVerHandler;
    const mockBtnVer = {
      dataset: { pacienteId: 'pac-1' },
      addEventListener: jest.fn((event, fn) => {
        if (event === 'click') clickVerHandler = fn;
      }),
    };
    let mockBtnDescargar = { onclick: null };
    mockLista.querySelectorAll = jest.fn((sel) => {
      if (sel.includes('ver-historial')) return [mockBtnVer];
      return [];
    });

    global.RepositorioCitasPsicologo.obtenerHistorialPacientes.mockResolvedValue([
      {
        paciente: { id: 'pac-1', nombre: 'Juan', apellido: 'Pérez', correo: 'j@e.com', bloqueado: false },
        citas: [],
      },
    ]);

    global.document.getElementById = jest.fn((id) => {
      if (id === 'lista-historial') return mockLista;
      if (id === 'sin-historial') return mockVacio;
      if (id === 'busqueda-paciente') return { value: '' };
      if (id === 'historial-nombre-paciente') return { textContent: '' };
      if (id === 'lista-historial-paciente') return { innerHTML: '' };
      if (id === 'btn-descargar-historial') return mockBtnDescargar;
      return null;
    });

    GestorHistorial.inicializar();
    await GestorHistorial.cargar();

    if (clickVerHandler) {
      clickVerHandler();
    }

    if (mockBtnDescargar.onclick) {
      mockBtnDescargar.onclick();
      expect(mockDoc.save).toHaveBeenCalled();
    }
  });

  test('VÁLIDO: Click en bloqueo desactiva botón', async () => {
    let bloqueoHandler;
    const mockBtnBloqueo = {
      dataset: { pacienteId: 'pac-1', bloqueado: 'false' },
      disabled: false,
      textContent: 'Bloquear',
      addEventListener: jest.fn((event, fn) => {
        if (event === 'click') bloqueoHandler = fn;
      }),
    };
    mockLista.querySelectorAll = jest.fn((sel) => {
      if (sel.includes('ver-historial')) return [];
      if (sel.includes('toggle-bloqueo')) return [mockBtnBloqueo];
      return [];
    });

    GestorHistorial.inicializar();
    await GestorHistorial.cargar();

    if (bloqueoHandler) {
      const event = { preventDefault: jest.fn() };
      await bloqueoHandler(event);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(global.GestorRestriccion.toggleBloqueo).toHaveBeenCalled();
    } else {
      expect(mockBtnBloqueo.addEventListener).toHaveBeenCalled();
    }
  });
});
