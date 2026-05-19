const GestorDetalleCita = require('../js/psicologo/gestor/GestorDetalleCita.js');

describe('GestorDetalleCita', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.EstadoPsicologo = {
      obtener: jest.fn((key) => {
        if (key === 'citasCargadas') {
          return [
            {
              id: 'cita-1',
              estado: 'confirmada',
              pacientes: {
                nombre: 'Juan',
                apellido: 'Pérez',
                correo: 'juan@example.com',
                telefono: '1234567890',
              },
              bloques_horario: {
                fecha: '2026-05-19',
                hora_inicio: '10:00',
                hora_fin: '11:00',
              },
            },
          ];
        }
        return null;
      }),
      establecer: jest.fn(),
    };
    global.FormateadorFecha = {
      aTexto: jest.fn(() => '19 May 2026'),
    };
    global.FormateadorHora = {
      formatear: jest.fn((h) => '10:00'),
    };
    global.NavigacionFachada = {
      abrirModal: jest.fn(),
      cerrarModal: jest.fn(),
    };
    global.RepositorioCitasPsicologo = {
      cancelarConNotificacion: jest.fn().mockResolvedValue(true),
    };
    global.MensajesFachada = {
      mostrar: jest.fn(),
    };
    global.RenderizadorCitas = {
      cargarPeriodo: jest.fn(),
    };
    global.document = {
      getElementById: jest.fn((id) => {
        if (id.startsWith('detalle-')) {
          return { textContent: '' };
        }
        return null;
      }),
      querySelector: jest.fn(() => ({
        dataset: { periodo: 'hoy' },
        classList: { add: jest.fn(), remove: jest.fn() },
      })),
    };
  });

  test('VÁLIDO: Muestra detalle de cita', () => {
    GestorDetalleCita.mostrar('cita-1');
    expect(global.NavigacionFachada.abrirModal).toHaveBeenCalledWith('modal-detalle-cita');
  });

  test('VÁLIDO: Establece cita seleccionada', () => {
    GestorDetalleCita.mostrar('cita-1');
    expect(global.EstadoPsicologo.establecer).toHaveBeenCalled();
  });

  test('LÍMITE: Ignora cita inexistente', () => {
    GestorDetalleCita.mostrar('cita-inexistente');
    expect(global.NavigacionFachada.abrirModal).not.toHaveBeenCalled();
  });

  test('LÍMITE: Ignora cuando no hay citas cargadas', () => {
    global.EstadoPsicologo.obtener.mockReturnValue(null);
    GestorDetalleCita.mostrar('cita-1');
    expect(global.NavigacionFachada.abrirModal).not.toHaveBeenCalled();
  });

  test('VÁLIDO: Cancela cita exitosamente', async () => {
    global.EstadoPsicologo.obtener.mockImplementation((key) => {
      if (key === 'citaSeleccionada') return 'cita-1';
      if (key === 'citasCargadas') return [{ id: 'cita-1' }];
      return null;
    });
    await GestorDetalleCita.cancelar();
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
      expect.stringContaining('Cita cancelada'),
      'exito',
    );
  });

  test('INVÁLIDO: Maneja error al cancelar cita', async () => {
    global.RepositorioCitasPsicologo.cancelarConNotificacion.mockResolvedValue(false);
    global.EstadoPsicologo.obtener.mockImplementation((key) => {
      if (key === 'citaSeleccionada') return 'cita-1';
      return null;
    });
    await GestorDetalleCita.cancelar();
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
      'Error al cancelar la cita',
      'error',
    );
  });

  test('LÍMITE: Ignora cancelación sin cita seleccionada', async () => {
    global.EstadoPsicologo.obtener.mockReturnValue(null);
    await GestorDetalleCita.cancelar();
    expect(global.RepositorioCitasPsicologo.cancelarConNotificacion).not.toHaveBeenCalled();
  });

  test('LÍMITE: Muestra detalle cuando elementos DOM son null', () => {
    global.document.getElementById = jest.fn(() => null);
    GestorDetalleCita.mostrar('cita-1');
    expect(global.NavigacionFachada.abrirModal).toHaveBeenCalledWith('modal-detalle-cita');
  });

  test('VÁLIDO: Muestra teléfono no registrado si paciente no tiene teléfono', () => {
    global.EstadoPsicologo.obtener.mockReturnValue([
      {
        id: 'cita-2',
        estado: 'confirmada',
        pacientes: {
          nombre: 'María',
          apellido: 'López',
          correo: 'maria@test.com',
          telefono: null,
        },
        bloques_horario: { fecha: '2026-05-19', hora_inicio: '11:00', hora_fin: '12:00' },
      },
    ]);
    global.document.getElementById = jest.fn((id) => {
      if (id.startsWith('detalle-')) return { textContent: '' };
      return null;
    });
    GestorDetalleCita.mostrar('cita-2');
    expect(global.NavigacionFachada.abrirModal).toHaveBeenCalled();
  });
});
