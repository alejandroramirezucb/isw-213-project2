const GestorPerfil = require('../js/psicologo/gestor/GestorPerfil.js');

describe('GestorPerfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.EstadoPsicologo = {
      obtener: jest.fn(() => ({
        email: 'user@example.com',
        psicologos: {
          nombre: 'Juan',
          apellido: 'Pérez',
        },
      })),
    };
    global.ComponenteModal = jest.fn(() => ({
      inicializar: jest.fn(),
      agregarBotonesAbrir: jest.fn(),
      agregarBotonesCerrar: jest.fn(),
      agregarFormulario: jest.fn(),
      cerrar: jest.fn(),
    }));
    global.ValidadorFormulario = {
      noEstaVacio: jest.fn(() => true),
      sonIguales: jest.fn(() => true),
      esPasswordValida: jest.fn(() => true),
    };
    global.MensajesFachada = {
      mostrar: jest.fn(),
    };
    global.clienteSupabase = {
      auth: {
        updateUser: jest.fn().mockResolvedValue({ error: null }),
      },
    };
    global.AutenticacionFachada = {
      cerrarSesion: jest.fn().mockResolvedValue(undefined),
    };
    global.document = {
      getElementById: jest.fn((id) => {
        if (id.startsWith('perfil-') || id.startsWith('nueva-') || id.startsWith('confirmar-')) {
          return { textContent: '', value: 'test' };
        }
        if (id === 'btn-guardar-contrasena' || id === 'btn-cerrar-sesion-perfil') {
          return { addEventListener: jest.fn() };
        }
        return null;
      }),
    };
  });

  test('VÁLIDO: Inicializa componente de perfil', () => {
    GestorPerfil.inicializar();
    expect(global.ComponenteModal).toHaveBeenCalled();
  });

  test('VÁLIDO: Carga datos del perfil', () => {
    GestorPerfil.inicializar();
    expect(global.document.getElementById).toHaveBeenCalled();
  });

  test('VÁLIDO: Guarda contraseña exitosamente', async () => {
    GestorPerfil.inicializar();
    await GestorPerfil.guardarPassword();
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
      expect.stringContaining('Password actualizado'),
      'exito',
    );
  });

  test('INVÁLIDO: Rechaza campos vacíos', async () => {
    global.ValidadorFormulario.noEstaVacio.mockReturnValue(false);
    GestorPerfil.inicializar();
    await GestorPerfil.guardarPassword();
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
      'Por favor completa todos los campos',
      'error',
    );
  });

  test('INVÁLIDO: Rechaza passwords no coincidentes', async () => {
    global.ValidadorFormulario.sonIguales.mockReturnValue(false);
    GestorPerfil.inicializar();
    await GestorPerfil.guardarPassword();
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
      'Las passwords no coinciden',
      'error',
    );
  });

  test('INVÁLIDO: Rechaza password débil', async () => {
    global.ValidadorFormulario.esPasswordValida.mockReturnValue(false);
    GestorPerfil.inicializar();
    await GestorPerfil.guardarPassword();
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
      expect.stringContaining('al menos 6 caracteres'),
      'error',
    );
  });

  test('VALID: Cierra sesión con confirmación', async () => {
    global.confirm = jest.fn(() => true);
    GestorPerfil.inicializar();
    await GestorPerfil.cerrarSesion();
    expect(global.AutenticacionFachada.cerrarSesion).toHaveBeenCalled();
  });

  test('LÍMITE: Cancela cierre de sesión sin confirmación', async () => {
    global.confirm = jest.fn(() => false);
    GestorPerfil.inicializar();
    await GestorPerfil.cerrarSesion();
    expect(global.AutenticacionFachada.cerrarSesion).not.toHaveBeenCalled();
  });

  test('INVÁLIDO: Maneja error en actualización de password', async () => {
    global.clienteSupabase.auth.updateUser.mockResolvedValue({
      error: new Error('Update failed'),
    });
    GestorPerfil.inicializar();
    await GestorPerfil.guardarPassword();
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
      'Error al cambiar password',
      'error',
    );
  });

  test('INVÁLIDO: Maneja excepción en cerrarSesión', async () => {
    global.confirm = jest.fn(() => true);
    global.AutenticacionFachada.cerrarSesion.mockRejectedValue(new Error('Auth error'));
    GestorPerfil.inicializar();
    await GestorPerfil.cerrarSesion();
    expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(
      'Error al cerrar sesión',
      'error',
    );
  });

  test('LÍMITE: Carga perfil sin datos de psicólogo', () => {
    global.EstadoPsicologo.obtener.mockReturnValue({ email: 'test@test.com' });
    GestorPerfil.inicializar();
    expect(global.ComponenteModal).toHaveBeenCalled();
  });

  test('LÍMITE: Carga perfil con elementos DOM null', () => {
    global.document.getElementById = jest.fn(() => null);
    GestorPerfil.inicializar();
    expect(global.EstadoPsicologo.obtener).toHaveBeenCalled();
  });

  test('LÍMITE: Carga perfil con psicólogo sin nombre', () => {
    global.EstadoPsicologo.obtener.mockReturnValue({
      email: null,
      user: { email: 'nested@test.com' },
      psicologos: { nombre: undefined, apellido: null },
    });
    global.document.getElementById = jest.fn((id) => {
      if (id.startsWith('perfil-')) return { textContent: '' };
      if (id === 'btn-guardar-contrasena') return { addEventListener: jest.fn() };
      if (id === 'btn-cerrar-sesion-perfil') return { addEventListener: jest.fn() };
      return null;
    });
    GestorPerfil.inicializar();
    expect(global.EstadoPsicologo.obtener).toHaveBeenCalled();
  });
});
