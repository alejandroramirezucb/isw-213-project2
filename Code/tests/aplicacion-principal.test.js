const ControladorEventosPsicologo = require('../js/psicologo/ControladorEventosPsicologo.js');

describe('ControladorEventosPsicologo', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const mockBoton = { classList: { remove: jest.fn(), add: jest.fn() }, dataset: { periodo: 'hoy' } };

    global.MejoradorEventos = {
      mapearEventosPorData: jest.fn((selector, data, callback) => {
        if (selector === '.navegacion__boton') {
          callback('panel');
          callback('historial');
          callback('notificaciones');
          callback('configuracion');
        }
        if (selector === '.periodo__boton') {
          callback('hoy', null, mockBoton);
          callback('semana', null, mockBoton);
        }
      }),
      mapearEventos: jest.fn((mapping) => {
        Object.values(mapping).forEach((events) => {
          Object.values(events).forEach((handler) => {
            try { handler({ preventDefault: jest.fn(), target: { value: 'test' } }); } catch(e) {}
          });
        });
      }),
      mapearEventosMultiples: jest.fn((mapping) => {
        Object.values(mapping).forEach((events) => {
          Object.values(events).forEach((handler) => {
            try { handler({ target: { checked: true, closest: jest.fn(() => ({ querySelector: jest.fn(() => ({ classList: { toggle: jest.fn() } })) })) } }); } catch(e) {}
          });
        });
      }),
    };
    global.NavigacionFachada = {
      cambiarVista: jest.fn(),
      cerrarModal: jest.fn(),
    };
    global.AutenticacionFachada = {
      cerrarSesion: jest.fn().mockResolvedValue(undefined),
    };
    global.GestorHistorial = {
      cargar: jest.fn(),
    };
    global.GestorNotificaciones = {
      cargar: jest.fn(),
    };
    global.RenderizadorCitas = {
      cargarPeriodo: jest.fn(),
    };
    global.GestorHorarios = {
      guardar: jest.fn(),
    };
    global.GestorConfiguracionUI = {
      toggleHorariosDia: jest.fn(),
    };
    global.GestorDetalleCita = {
      cancelar: jest.fn(),
    };
    global.document = {
      getElementById: jest.fn(() => ({ addEventListener: jest.fn() })),
      querySelectorAll: jest.fn(() => [mockBoton]),
    };
  });

  test('VÁLIDO: Inicializa y ejecuta todos los callbacks', () => {
    ControladorEventosPsicologo.inicializar();
    expect(global.MejoradorEventos.mapearEventosPorData).toHaveBeenCalled();
    expect(global.NavigacionFachada.cambiarVista).toHaveBeenCalled();
  });

  test('VÁLIDO: Navega a historial cargando datos', () => {
    ControladorEventosPsicologo.inicializar();
    expect(global.GestorHistorial.cargar).toHaveBeenCalled();
  });

  test('VÁLIDO: Navega a notificaciones cargando datos', () => {
    ControladorEventosPsicologo.inicializar();
    expect(global.GestorNotificaciones.cargar).toHaveBeenCalled();
  });

  test('VÁLIDO: Carga período hoy y semana', () => {
    ControladorEventosPsicologo.inicializar();
    expect(global.RenderizadorCitas.cargarPeriodo).toHaveBeenCalledWith('hoy');
    expect(global.RenderizadorCitas.cargarPeriodo).toHaveBeenCalledWith('semana');
  });

  test('VÁLIDO: Configura todos los tipos de eventos', () => {
    ControladorEventosPsicologo.inicializar();
    expect(global.MejoradorEventos.mapearEventos).toHaveBeenCalled();
    expect(global.MejoradorEventos.mapearEventosMultiples).toHaveBeenCalled();
  });
});
