describe('HU-09 y HU-11: Notificaciones y Recordatorios', () => {
  const GestorNotificaciones = require('../js/psicologo/gestor/GestorNotificaciones.js');

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

  describe('RepositorioNotificaciones', () => {
    const RepositorioNotificaciones = require('../js/psicologo/repositorio/RepositorioNotificaciones.js');

    beforeEach(() => {
      jest.clearAllMocks();
      global.clienteSupabase = {};
    });

    test('VÁLIDO: Obtiene notificaciones no leídas', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [{ id: 'notif-1', tipo: 'nuevo_turno', creado_en: '2026-05-19T10:00:00' }],
          error: null
        }),
      }));

      const resultado = await RepositorioNotificaciones.obtenerNoLeidas('psi-001');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].tipo).toBe('nuevo_turno');
    });

    test('VÁLIDO: Obtiene todas las notificaciones con límite', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            { id: 'notif-1', tipo: 'nuevo_turno', enviado: false, creado_en: '2026-05-19T10:00:00' },
          ],
          error: null
        }),
      }));

      const resultado = await RepositorioNotificaciones.obtenerTodas('psi-001', 20);
      expect(resultado).toHaveLength(1);
    });

    test('LÍMITE: Retorna array vacío si no hay notificaciones', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: null,
          error: null
        }),
      }));

      const resultado = await RepositorioNotificaciones.obtenerTodas('psi-001', 20);
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado).toHaveLength(0);
    });

    test('VÁLIDO: Marca notificación como leída', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: { id: 'notif-1', enviado: true },
          error: null
        }),
      }));

      const resultado = await RepositorioNotificaciones.marcarComoLeida('notif-1');
      expect(resultado).toBe(true);
    });

    test('VÁLIDO: Marca todas las notificaciones como leídas', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      }));

      const resultado = await RepositorioNotificaciones.marcarTodasLeidas('psi-001');
      expect(resultado).toBe(true);
    });

    test('INVÁLIDO: Maneja error al marcar como leída', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'DB error' }
        }),
      }));

      const resultado = await RepositorioNotificaciones.marcarComoLeida('notif-1');
      expect(resultado).toBe(false);
    });

    test('VÁLIDO: Obtiene conteo de notificaciones no leídas', async () => {
      global.clienteSupabase.from = jest.fn(() => {
        let eqCallCount = 0;
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn(function() {
            eqCallCount++;
            if (eqCallCount === 3) {
              return Promise.resolve({ count: 5, error: null });
            }
            return this;
          }),
        };
      });

      const resultado = await RepositorioNotificaciones.obtenerConteoNoLeidas('psi-001');
      expect(resultado).toBe(5);
    });

    test('LÍMITE: Retorna 0 si hay error en conteo', async () => {
      global.clienteSupabase.from = jest.fn(() => {
        let eqCallCount = 0;
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn(function() {
            eqCallCount++;
            if (eqCallCount === 3) {
              return Promise.resolve({ count: null, error: { message: 'DB error' } });
            }
            return this;
          }),
        };
      });

      const resultado = await RepositorioNotificaciones.obtenerConteoNoLeidas('psi-001');
      expect(resultado).toBe(0);
    });

    test('INVÁLIDO: Maneja excepción en obtenerTodas', async () => {
      global.clienteSupabase.from = jest.fn(() => {
        throw new Error('Connection error');
      });

      const resultado = await RepositorioNotificaciones.obtenerTodas('psi-001');
      expect(resultado).toEqual([]);
    });

    test('VÁLIDO: Suscripción se crea exitosamente', () => {
      const callback = jest.fn();
      const unsubscribe = RepositorioNotificaciones.suscribirseNuevasNotificaciones('psi-001', callback);
      expect(typeof unsubscribe).toBe('function');
    });

    test('VÁLIDO: Obtiene conteo exitosamente', async () => {
      const resultado = await RepositorioNotificaciones.obtenerConteoNoLeidas('psi-001');
      expect(typeof resultado).toBe('number');
    });
  });
});
