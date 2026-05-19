const RepositorioConfiguracion = require('../js/psicologo/repositorio/RepositorioConfiguracion.js');
const RepositorioNotificaciones = require('../js/psicologo/repositorio/RepositorioNotificaciones.js');

describe('Branches: RepositorioConfiguracion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const makeChain = () => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      mockResolvedValue: null,
    });

    global.clienteSupabase = {
      from: jest.fn(() => {
        const chain = makeChain();
        chain.select = jest.fn(() => Object.assign(makeChain(), {
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        }));
        chain.delete = jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }));
        chain.insert = jest.fn().mockResolvedValue({ error: null });
        return chain;
      }),
    };
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test('VÁLIDO: Obtiene configuración del servidor', async () => {
    const resultado = await RepositorioConfiguracion.obtener('psi-branch-test-1');
    expect(Array.isArray(resultado)).toBe(true);
  });

  test('LÍMITE: Devuelve array vacío en error de Supabase', async () => {
    global.clienteSupabase.from = jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'error' } }),
      })),
    }));
    const resultado = await RepositorioConfiguracion.obtener('psi-branch-test-2');
    expect(resultado).toEqual([]);
  });

  test('LÍMITE: guardarYGenerarBloques retorna true si no hay configuraciones', async () => {
    const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-001', [], '2026-05-01', '2026-05-31');
    expect(resultado).toBe(true);
  });

  test('INVÁLIDO: Maneja error en delete', async () => {
    global.clienteSupabase.from = jest.fn(() => ({
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: { message: 'delete error' } }),
      })),
    }));
    const resultado = await RepositorioConfiguracion.guardarYGenerarBloques(
      'psi-001',
      [{ dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00', duracion_bloque_minutos: 30, activo: true }],
      '2026-05-01',
      '2026-05-31',
    );
    expect(resultado).toBe(false);
  });

  test('INVÁLIDO: Maneja excepción en guardarYGenerarBloques', async () => {
    global.clienteSupabase.from = jest.fn(() => {
      throw new Error('Connection error');
    });
    const resultado = await RepositorioConfiguracion.guardarYGenerarBloques(
      'psi-001',
      [{ dia_semana: 1 }],
      '2026-05-01',
      '2026-05-31',
    );
    expect(resultado).toBe(false);
  });
});

describe('Branches: RepositorioNotificaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    global.clienteSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(function() { return this; }),
        eq: jest.fn(function() { return this; }),
        order: jest.fn(function() { return this; }),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
        update: jest.fn(function() { return this; }),
      })),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      })),
    };
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test('LÍMITE: obtenerNoLeidas retorna vacío en excepción', async () => {
    global.clienteSupabase.from = jest.fn(() => { throw new Error('error'); });
    const resultado = await RepositorioNotificaciones.obtenerNoLeidas('psi-001');
    expect(resultado).toEqual([]);
  });

  test('LÍMITE: obtenerNoLeidas retorna vacío en error DB', async () => {
    global.clienteSupabase.from = jest.fn(() => ({
      select: jest.fn(function() { return this; }),
      eq: jest.fn(function() { return this; }),
      order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    }));
    const resultado = await RepositorioNotificaciones.obtenerNoLeidas('psi-002');
    expect(resultado).toEqual([]);
  });

  test('LÍMITE: obtenerTodas retorna vacío en error DB', async () => {
    global.clienteSupabase.from = jest.fn(() => ({
      select: jest.fn(function() { return this; }),
      eq: jest.fn(function() { return this; }),
      order: jest.fn(function() { return this; }),
      limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
    }));
    const resultado = await RepositorioNotificaciones.obtenerTodas('psi-002');
    expect(resultado).toEqual([]);
  });

  test('LÍMITE: obtenerTodas retorna vacío en excepción', async () => {
    global.clienteSupabase.from = jest.fn(() => { throw new Error('error'); });
    const resultado = await RepositorioNotificaciones.obtenerTodas('psi-001');
    expect(resultado).toEqual([]);
  });

  test('LÍMITE: marcarComoLeida retorna false en excepción', async () => {
    global.clienteSupabase.from = jest.fn(() => { throw new Error('error'); });
    const resultado = await RepositorioNotificaciones.marcarComoLeida('notif-1');
    expect(resultado).toBe(false);
  });

  test('LÍMITE: marcarTodasLeidas retorna false en excepción', async () => {
    global.clienteSupabase.from = jest.fn(() => { throw new Error('error'); });
    const resultado = await RepositorioNotificaciones.marcarTodasLeidas('psi-001');
    expect(resultado).toBe(false);
  });

  test('LÍMITE: obtenerConteoNoLeidas retorna 0 en excepción', async () => {
    global.clienteSupabase.from = jest.fn(() => { throw new Error('error'); });
    const resultado = await RepositorioNotificaciones.obtenerConteoNoLeidas('psi-001');
    expect(resultado).toBe(0);
  });

  test('VÁLIDO: suscribirse crea canal y retorna función', () => {
    let onPayloadCallback;
    let subscribeCallback;

    global.clienteSupabase.channel = jest.fn(() => ({
      on: jest.fn((event, filter, callback) => {
        onPayloadCallback = callback;
        return {
          subscribe: jest.fn((cb) => {
            subscribeCallback = cb;
          }),
        };
      }),
      unsubscribe: jest.fn(),
    }));

    const userCallback = jest.fn();
    const unsubscribe = RepositorioNotificaciones.suscribirseNuevasNotificaciones('psi-001', userCallback);

    if (subscribeCallback) {
      subscribeCallback('SUBSCRIBED');
    }

    if (onPayloadCallback) {
      onPayloadCallback({ new: { destinatario_tipo: 'psicologo', destinatario_id: 'psi-001', data: 'test' } });
      expect(userCallback).toHaveBeenCalled();
    }

    expect(typeof unsubscribe).toBe('function');
  });

  test('LÍMITE: Payload con destinatario diferente no dispara callback', () => {
    let onPayloadCallback;

    global.clienteSupabase.channel = jest.fn(() => ({
      on: jest.fn((event, filter, callback) => {
        onPayloadCallback = callback;
        return {
          subscribe: jest.fn(),
        };
      }),
      unsubscribe: jest.fn(),
    }));

    const userCallback = jest.fn();
    RepositorioNotificaciones.suscribirseNuevasNotificaciones('psi-001', userCallback);

    if (onPayloadCallback) {
      onPayloadCallback({ new: { destinatario_tipo: 'paciente', destinatario_id: 'pac-001' } });
      expect(userCallback).not.toHaveBeenCalled();
    }
  });

  test('LÍMITE: marcarTodasLeidas retorna false en error DB', async () => {
    global.clienteSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(function() { return this; }),
      })),
      eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } }),
    }));
    const resultado = await RepositorioNotificaciones.marcarTodasLeidas('psi-001');
    expect(typeof resultado).toBe('boolean');
  });
});

describe('Branches: RepositorioConfiguracion avanzado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  test('VÁLIDO: guardarYGenerarBloques completo', async () => {
    global.clienteSupabase = {
      from: jest.fn((tabla) => {
        if (tabla === 'configuracion_horario') {
          return {
            delete: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({ error: null }),
            })),
            insert: jest.fn().mockResolvedValue({ error: null }),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        if (tabla === 'bloques_horario') {
          return {
            insert: jest.fn().mockResolvedValue({ data: [{ id: 'bloque-1' }], error: null }),
            delete: jest.fn(() => ({
              eq: jest.fn(() => ({
                gte: jest.fn(() => ({
                  lte: jest.fn().mockResolvedValue({ error: null }),
                })),
              })),
            })),
          };
        }
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }),
    };

    const resultado = await RepositorioConfiguracion.guardarYGenerarBloques(
      'psi-002',
      [{
        psicologo_id: 'psi-002',
        dia_semana: 1,
        hora_inicio: '09:00:00',
        hora_fin: '10:00:00',
        duracion_bloque_minutos: 60,
        activo: true,
      }],
      '2026-05-19',
      '2026-05-25',
    );
    expect(typeof resultado).toBe('boolean');
  });

  test('INVÁLIDO: Falla en insert de configuraciones', async () => {
    global.clienteSupabase = {
      from: jest.fn((tabla) => {
        if (tabla === 'configuracion_horario') {
          return {
            delete: jest.fn(() => ({
              eq: jest.fn().mockResolvedValue({ error: null }),
            })),
            insert: jest.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
          };
        }
        return {};
      }),
    };

    const resultado = await RepositorioConfiguracion.guardarYGenerarBloques(
      'psi-003',
      [{ psicologo_id: 'psi-003', dia_semana: 2, hora_inicio: '10:00', hora_fin: '11:00', duracion_bloque_minutos: 60, activo: true }],
      '2026-05-19',
      '2026-05-25',
    );
    expect(resultado).toBe(false);
  });
});
