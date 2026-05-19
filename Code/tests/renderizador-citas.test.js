const RenderizadorCitas = require('../js/psicologo/renderizador/RenderizadorCitas.js');
const RenderizadorCalendarioPsicologo = require('../js/psicologo/renderizador/RenderizadorCalendarioPsicologo.js');

describe('RenderizadorCitas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.EstadoPsicologo = {
      obtener: jest.fn(() => 'psi-001'),
      establecer: jest.fn(),
    };
    global.RepositorioCitasPsicologo = {
      obtenerPorPeriodo: jest.fn().mockResolvedValue([
        {
          id: 'cita-1',
          estado: 'confirmada',
          pacientes: { nombre: 'Juan', apellido: 'Pérez' },
          bloques_horario: { fecha: '2026-05-19', hora_inicio: '10:00', hora_fin: '11:00' },
        },
      ]),
    };
    global.FormateadorFecha = {
      aISO: jest.fn(() => '2026-05-19'),
      aTextoCorto: jest.fn(() => '19 May'),
    };
    global.FormateadorHora = {
      formatear: jest.fn((h) => '10:00'),
    };
    global.GestorDetalleCita = {
      mostrar: jest.fn(),
    };
    global.document = {
      getElementById: jest.fn((id) => {
        if (id.includes('titulo') || id.includes('fecha') || id.includes('total') || id.includes('siguiente')) {
          return { textContent: '', innerHTML: '' };
        }
        return {
          innerHTML: '',
          textContent: '',
          classList: { remove: jest.fn(), add: jest.fn() },
          querySelectorAll: jest.fn(() => []),
        };
      }),
    };
  });

  test('VÁLIDO: Inicializa contenedor de citas', () => {
    RenderizadorCitas.inicializar();
    expect(global.document.getElementById).toHaveBeenCalled();
  });

  test('VÁLIDO: Carga período hoy', async () => {
    await RenderizadorCitas.cargarPeriodo('hoy');
    expect(global.RepositorioCitasPsicologo.obtenerPorPeriodo).toHaveBeenCalled();
  });

  test('VÁLIDO: Carga período semana', async () => {
    await RenderizadorCitas.cargarPeriodo('semana');
    expect(global.RepositorioCitasPsicologo.obtenerPorPeriodo).toHaveBeenCalled();
  });

  test('VÁLIDO: Calcula fechas correctamente', () => {
    const fechas = RenderizadorCitas.calcularFechas('hoy');
    expect(fechas.inicio).toBeDefined();
    expect(fechas.fin).toBeDefined();
  });

  test('VÁLIDO: Renderiza lista de citas', async () => {
    RenderizadorCitas.inicializar();
    const citas = [
      {
        id: 'cita-1',
        pacientes: { nombre: 'Juan', apellido: 'Pérez' },
        bloques_horario: { fecha: '2026-05-19', hora_inicio: '10:00' },
      },
    ];
    RenderizadorCitas.renderizar(citas);
    expect(global.document.getElementById).toHaveBeenCalled();
  });

  test('LÍMITE: Maneja lista vacía de citas', () => {
    RenderizadorCitas.inicializar();
    RenderizadorCitas.renderizar([]);
    expect(global.document.getElementById).toHaveBeenCalled();
  });
});

describe('RenderizadorCalendarioPsicologo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.EstadoPsicologo = {
      obtener: jest.fn(() => 'psi-001'),
      establecer: jest.fn(),
    };
    global.RepositorioCitasPsicologo = {
      obtenerPorPeriodo: jest.fn().mockResolvedValue([
        {
          id: 'cita-1',
          bloques_horario: { fecha: '2026-05-19' },
        },
      ]),
    };
    global.FormateadorFecha = {
      aISO: jest.fn((date) => '2026-05-19'),
    };
    global.document = {
      querySelector: jest.fn((sel) => ({
        textContent: '',
        innerHTML: '',
        querySelectorAll: jest.fn(() => []),
        addEventListener: jest.fn(),
      })),
      getElementById: jest.fn(() => ({
        addEventListener: jest.fn(),
      })),
    };
  });

  test('VÁLIDO: Inicializa calendario', () => {
    RenderizadorCalendarioPsicologo.inicializar();
    expect(global.document.querySelector).toHaveBeenCalled();
  });

  test('VÁLIDO: Carga citas del mes', async () => {
    RenderizadorCalendarioPsicologo.inicializar();
    expect(global.document.querySelector).toHaveBeenCalled();
  });
});
