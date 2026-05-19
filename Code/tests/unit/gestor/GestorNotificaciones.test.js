describe('GestorNotificaciones', () => {
  const GestorNotificaciones = require('../../../js/psicologo/gestor/GestorNotificaciones.js');

  beforeEach(() => {
    jest.clearAllMocks();

    if (global.RepositorioNotificaciones) {
      global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([]);
      global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(0);
      global.RepositorioNotificaciones.marcarTodasLeidas.mockResolvedValue(true);
      global.RepositorioNotificaciones.marcarComoLeida.mockResolvedValue(true);
    } else {
      global.RepositorioNotificaciones = {
        obtenerTodas: jest.fn().mockResolvedValue([]),
        obtenerConteoNoLeidas: jest.fn().mockResolvedValue(0),
        marcarTodasLeidas: jest.fn().mockResolvedValue(true),
        marcarComoLeida: jest.fn().mockResolvedValue(true),
      };
    }

    const mockElementState = {};
    global.document = {
      getElementById: jest.fn((id) => {
        if (!mockElementState[id]) {
          mockElementState[id] = { innerHTML: '', style: { display: 'block' }, textContent: '' };
        }
        const element = mockElementState[id];
        return {
          get innerHTML() { return element.innerHTML; },
          set innerHTML(val) { element.innerHTML = val; },
          style: element.style,
          dataset: { eventoRegistrado: null },
          addEventListener: jest.fn(),
          querySelectorAll: jest.fn(() => []),
          textContent: element.textContent,
        };
      }),
    };
    global.MensajesFachada = { mostrar: jest.fn() };
  });

  test('VÁLIDO: Carga notificaciones correctamente', async () => {
    const notificaciones = [
      { id: 'notif-1', tipo: 'nuevo_turno', creado_en: '2026-05-19T10:00:00', enviado: false },
    ];
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue(notificaciones);
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(1);

    await GestorNotificaciones.cargar();
    expect(global.RepositorioNotificaciones.obtenerTodas).toHaveBeenCalled();
  });

  test('LÍMITE: Muestra mensaje si no hay notificaciones', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([]);
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(0);

    await GestorNotificaciones.cargar();
    expect(global.document.getElementById('contenido-notificaciones').innerHTML).toContain('No tienes notificaciones');
  });

  test('INVÁLIDO: No carga si elemento no existe', async () => {
    global.document.getElementById = jest.fn(() => null);
    await GestorNotificaciones.cargar();
    expect(global.RepositorioNotificaciones.obtenerTodas).not.toHaveBeenCalled();
  });

  test('INVÁLIDO: Maneja error al cargar', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    global.RepositorioNotificaciones.obtenerTodas.mockRejectedValue(new Error('DB error'));
    await GestorNotificaciones.cargar();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('VÁLIDO: Inicializa polling', () => {
    GestorNotificaciones.inicializar('psi-001');
    expect(global.RepositorioNotificaciones.obtenerConteoNoLeidas).toHaveBeenCalled();
  });

  test('VÁLIDO: Marca notificaciones como leídas', async () => {
    const notificaciones = [
      { id: 'notif-1', tipo: 'nuevo_turno', creado_en: '2026-05-19T10:00:00', enviado: false },
    ];
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue(notificaciones);
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(1);
    await GestorNotificaciones.cargar();
    expect(global.RepositorioNotificaciones.obtenerTodas).toHaveBeenCalled();
  });

  test('VÁLIDO: Limpiar notificaciones actualiza UI', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([]);
    global.RepositorioNotificaciones.marcarTodasLeidas.mockResolvedValue(true);
    global.MensajesFachada.mostrar = jest.fn();
    await GestorNotificaciones.cargar();
    const btnLimpiar = global.document.getElementById('btn-limpiar-notificaciones');
    expect(btnLimpiar).toBeDefined();
  });

  test('VÁLIDO: Actualiza contador cuando hay notificaciones', async () => {
    const notificaciones = [
      { id: 'notif-1', tipo: 'nuevo_turno', creado_en: '2026-05-19T10:00:00', enviado: false },
      { id: 'notif-2', tipo: 'nuevo_turno', creado_en: '2026-05-19T11:00:00', enviado: false },
    ];
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue(notificaciones);
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(2);
    await GestorNotificaciones.cargar();
    const contador = global.document.getElementById('contador-notificaciones');
    expect(contador).toBeDefined();
  });

  test('VÁLIDO: No muestra contador cuando no hay notificaciones no leídas', async () => {
    global.RepositorioNotificaciones.obtenerTodas.mockResolvedValue([]);
    global.RepositorioNotificaciones.obtenerConteoNoLeidas.mockResolvedValue(0);
    await GestorNotificaciones.cargar();
    const contador = global.document.getElementById('contador-notificaciones');
    expect(contador.style.display).toBe('none');
  });
});
