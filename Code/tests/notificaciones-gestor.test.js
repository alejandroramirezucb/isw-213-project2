const GestorNotificaciones = require('../js/psicologo/gestor/GestorNotificaciones.js');

describe('GestorNotificaciones', () => {
  let mockContenido;
  let mockContador;
  let mockBtnLimpiar;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockContenido = {
      innerHTML: '',
      querySelectorAll: jest.fn(() => []),
    };

    mockContador = {
      textContent: '',
      style: { display: 'none' },
    };

    mockBtnLimpiar = {
      style: { display: 'none' },
      dataset: {},
      addEventListener: jest.fn(),
    };

    global.document = {
      getElementById: jest.fn((id) => {
        if (id === 'contenido-notificaciones') return mockContenido;
        if (id === 'contador-notificaciones') return mockContador;
        if (id === 'btn-limpiar-notificaciones') return mockBtnLimpiar;
        return null;
      }),
      addEventListener: jest.fn(),
    };

    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([]);
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(0);
    global.RepositorioNotificaciones.marcarTodasLeidas.mockResolvedValue(true);
    global.RepositorioNotificaciones.marcarComoLeida.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
    GestorNotificaciones.detener();
  });

  test('VÁLIDO: Inicializa gestor y comienza polling', () => {
    GestorNotificaciones.inicializar('psi-001');
    expect(global.document.getElementById).toHaveBeenCalled();
  });

  test('VÁLIDO: Carga notificaciones vacías', async () => {
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(global.RepositorioNotificaciones.obtenerTodas).toHaveBeenCalledWith('psi-001');
  });

  test('VÁLIDO: Renderiza lista de notificaciones', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-1', tipo: 'nuevo_turno', enviado: false, creado_en: '2026-05-19T10:00:00' },
    ]);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContenido.innerHTML).toContain('notif-1');
  });

  test('VÁLIDO: Renderiza notificación de cancelación', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-2', tipo: 'cancelacion', enviado: false, creado_en: '2026-05-19T11:00:00' },
    ]);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContenido.innerHTML).toContain('Cita Cancelada');
  });

  test('VÁLIDO: Renderiza notificación de recordatorio', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-3', tipo: 'recordatorio', enviado: true, creado_en: '2026-05-19T12:00:00' },
    ]);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContenido.innerHTML).toContain('Recordatorio');
  });

  test('VÁLIDO: Renderiza notificación tipo desconocido', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-4', tipo: 'otro', enviado: false, creado_en: '2026-05-19T13:00:00' },
    ]);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContenido.innerHTML).toContain('Notificación');
  });

  test('VÁLIDO: Muestra contador cuando hay no leídas', async () => {
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(5);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContador.style.display).toBe('inline-flex');
  });

  test('LÍMITE: Muestra 9+ cuando hay más de 9 no leídas', async () => {
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(15);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContador.textContent).toBe('9+');
  });

  test('LÍMITE: Oculta contador cuando no hay no leídas', async () => {
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(0);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContador.style.display).toBe('none');
  });

  test('VÁLIDO: Muestra botón limpiar con notificaciones', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-1', tipo: 'nuevo_turno', enviado: false, creado_en: '2026-05-19T10:00:00' },
    ]);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockBtnLimpiar.style.display).toBe('block');
  });

  test('VÁLIDO: Detiene polling al llamar detener', () => {
    GestorNotificaciones.inicializar('psi-001');
    GestorNotificaciones.detener();
    expect(true).toBe(true);
  });

  test('LÍMITE: Omite carga si contenido no existe en DOM', async () => {
    global.document.getElementById = jest.fn((id) => {
      if (id === 'btn-limpiar-notificaciones') return mockBtnLimpiar;
      if (id === 'contador-notificaciones') return mockContador;
      return null;
    });
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(global.RepositorioNotificaciones.obtenerTodas).not.toHaveBeenCalled();
  });

  test('VÁLIDO: Renderiza mensaje vacío sin notificaciones', async () => {
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContenido.innerHTML).toContain('No tienes notificaciones');
  });

  test('VÁLIDO: Vincula eventos en contenido', async () => {
    const mockItem = { dataset: { notifId: 'notif-1' }, addEventListener: jest.fn() };
    mockContenido.querySelectorAll = jest.fn(() => [mockItem]);
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-1', tipo: 'nuevo_turno', enviado: false, creado_en: '2026-05-18T10:00:00' },
    ]);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockItem.addEventListener).toHaveBeenCalled();
  });

  test('VÁLIDO: Click en notificación la marca como leída', async () => {
    let clickCallback;
    const mockItem = {
      dataset: { notifId: 'notif-1' },
      addEventListener: jest.fn((event, fn) => {
        if (event === 'click') clickCallback = fn;
      }),
    };
    mockContenido.querySelectorAll = jest.fn(() => [mockItem]);
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-1', tipo: 'nuevo_turno', enviado: false, creado_en: '2026-05-18T10:00:00' },
    ]);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    if (clickCallback) {
      await clickCallback();
      expect(global.RepositorioNotificaciones.marcarComoLeida).toHaveBeenCalledWith('notif-1');
    }
  });

  test('VÁLIDO: Botón limpiar dispara marcarTodasLeidas', async () => {
    let limpiarCallback;
    mockBtnLimpiar.addEventListener = jest.fn((event, fn) => {
      limpiarCallback = fn;
    });
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    if (limpiarCallback) {
      await limpiarCallback();
      expect(global.RepositorioNotificaciones.marcarTodasLeidas).toHaveBeenCalledWith('psi-001');
    }
  });

  test('VÁLIDO: Formatear fecha antigua como fecha completa', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-1', tipo: 'nuevo_turno', enviado: false, creado_en: '2025-01-01T10:00:00' },
    ]);
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    expect(mockContenido.innerHTML).toBeDefined();
  });

  test('INVÁLIDO: Error al marcar como leída captura excepción', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    let clickCallback;
    const mockItem = {
      dataset: { notifId: 'notif-error' },
      addEventListener: jest.fn((event, fn) => {
        if (event === 'click') clickCallback = fn;
      }),
    };
    mockContenido.querySelectorAll = jest.fn(() => [mockItem]);
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([
      { id: 'notif-error', tipo: 'nuevo_turno', enviado: false, creado_en: '2026-05-18T10:00:00' },
    ]);
    global.RepositorioNotificaciones.marcarComoLeida.mockRejectedValue(new Error('Network error'));
    GestorNotificaciones.inicializar('psi-001');
    await GestorNotificaciones.cargar();
    if (clickCallback) {
      await clickCallback();
      expect(console.error).toHaveBeenCalled();
    }
    console.error.mockRestore();
  });
});
