global.ServicioAutenticacionPagina = {
  verificar: jest.fn().mockResolvedValue(true),
  obtenerUsuario: jest.fn().mockResolvedValue({
    rol: 'psicologo',
    psicologo_id: 'psi-001',
    psicologos: {
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  }),
};
global.EstadoPsicologo = {
  establecer: jest.fn(),
  obtener: jest.fn(() => 'psi-001'),
};
global.GestorFragmentos = {
  cargarFragmentoPsicologo: jest.fn().mockResolvedValue(true),
};
global.GestorHistorial = { inicializar: jest.fn() };
global.GestorPerfil = { inicializar: jest.fn() };
global.GestorNotificaciones = { inicializar: jest.fn() };
global.RenderizadorCitas = {
  inicializar: jest.fn(),
  cargarPeriodo: jest.fn().mockResolvedValue(undefined),
};
global.RenderizadorCalendarioPsicologo = { inicializar: jest.fn() };
global.GestorConfiguracionUI = {
  establecerFechasPorDefecto: jest.fn(),
  cargarConfiguracion: jest.fn().mockResolvedValue(undefined),
};
global.ControladorEventosPsicologo = { inicializar: jest.fn() };
global.document = {
  addEventListener: jest.fn(),
  getElementById: jest.fn((id) => {
    if (id === 'nombre-usuario') return { textContent: '' };
    return null;
  }),
};
global.window = { location: { href: '/' } };

const AplicacionPsicologo = require('../js/psicologo/AplicacionPsicologo.js');

describe('AplicacionPsicologo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.ServicioAutenticacionPagina.verificar.mockResolvedValue(true);
    global.ServicioAutenticacionPagina.obtenerUsuario.mockResolvedValue({
      rol: 'psicologo',
      psicologo_id: 'psi-001',
      psicologos: { nombre: 'Juan', apellido: 'Pérez' },
    });
    global.GestorFragmentos.cargarFragmentoPsicologo.mockResolvedValue(true);
  });

  test('VÁLIDO: Inicializa aplicación con usuario psicólogo', async () => {
    await AplicacionPsicologo.inicializar();
    expect(global.EstadoPsicologo.establecer).toHaveBeenCalled();
  });

  test('LÍMITE: No inicializa sin sesión activa', async () => {
    global.ServicioAutenticacionPagina.verificar.mockResolvedValue(null);
    await AplicacionPsicologo.inicializar();
    expect(global.EstadoPsicologo.establecer).not.toHaveBeenCalled();
  });

  test('INVÁLIDO: Redirige si usuario no es psicólogo', async () => {
    global.ServicioAutenticacionPagina.obtenerUsuario.mockResolvedValue({ rol: 'paciente' });
    global.window.location.href = '';
    await AplicacionPsicologo.inicializar();
    expect(global.window.location.href).toBe('/');
  });

  test('LÍMITE: No continúa si usuario es null', async () => {
    global.ServicioAutenticacionPagina.obtenerUsuario.mockResolvedValue(null);
    await AplicacionPsicologo.inicializar();
    expect(global.GestorFragmentos.cargarFragmentoPsicologo).not.toHaveBeenCalled();
  });

  test('LÍMITE: Detiene si fragmentos fallan', async () => {
    global.GestorFragmentos.cargarFragmentoPsicologo.mockResolvedValue(null);
    await AplicacionPsicologo.inicializar();
    expect(global.GestorHistorial.inicializar).not.toHaveBeenCalled();
  });

  test('VÁLIDO: Carga fragmentos y pone en marcha módulos', async () => {
    await AplicacionPsicologo.inicializar();
    expect(global.GestorFragmentos.cargarFragmentoPsicologo).toHaveBeenCalled();
  });
});
