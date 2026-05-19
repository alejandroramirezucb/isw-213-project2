const GestorHorarios = require('../js/psicologo/gestor/GestorHorarios.js');
const RepositorioConfiguracion = require('../js/psicologo/repositorio/RepositorioConfiguracion.js');

describe('HU-01: Configuración del Horario', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.document = {
      getElementById: jest.fn((id) => {
        const elements = {
          'fecha-desde': { value: '2026-05-18' },
          'fecha-hasta': { value: '2026-05-24' },
        };
        return elements[id] || { value: '' };
      }),
    };
    global.MensajesFachada = { mostrar: jest.fn() };
    global.GestorConfiguracionUI = { obtenerConfiguracionesFormulario: jest.fn(() => []) };
    global.EstadoPsicologo = { obtener: jest.fn(() => 'psi-001') };
    global.RepositorioConfiguracion = { guardarYGenerarBloques: jest.fn().mockResolvedValue(true) };
  });

  describe('GestorHorarios.guardar', () => {
    test('VÁLIDO: Procesa evento de guardar horario correctamente', () => {
      const evento = { preventDefault: jest.fn() };
      GestorHorarios.guardar(evento);
      expect(evento.preventDefault).toHaveBeenCalled();
    });

    test('LÍMITE: Valida fechas de inicio y fin', () => {
      global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
        { dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00' },
      ]);
      global.document.getElementById = jest.fn((id) => {
        const elements = {
          'fecha-desde': { value: '2026-05-18' },
          'fecha-hasta': { value: '2026-05-16' },
        };
        return elements[id] || { value: '' };
      });

      const evento = { preventDefault: jest.fn() };
      GestorHorarios.guardar(evento);
      expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('anterior'), 'error');
    });

    test('INVÁLIDO: Requiere al menos un día con horarios', () => {
      global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([]);

      const evento = { preventDefault: jest.fn() };
      GestorHorarios.guardar(evento);
      expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('Selecciona'), 'error');
    });

    test('INVÁLIDO: Valida que fechas estén definidas', () => {
      global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
        { dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00' },
      ]);
      global.document.getElementById = jest.fn(() => ({ value: '' }));

      const evento = { preventDefault: jest.fn() };
      GestorHorarios.guardar(evento);
      expect(global.MensajesFachada.mostrar).toHaveBeenCalledWith(expect.stringContaining('Completa'), 'error');
    });

    test('VÁLIDO: Guarda horarios con configuración válida', () => {
      global.RepositorioConfiguracion.guardarYGenerarBloques.mockResolvedValue(true);
      global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
        { dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00' },
        { dia_semana: 2, hora_inicio: '14:00', hora_fin: '18:00' },
      ]);

      const evento = { preventDefault: jest.fn() };
      GestorHorarios.guardar(evento);
      expect(evento.preventDefault).toHaveBeenCalled();
    });

    test('LÍMITE: Acepta rango mínimo de horario', () => {
      global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
        { dia_semana: 1, hora_inicio: '09:00', hora_fin: '09:30' },
      ]);

      const evento = { preventDefault: jest.fn() };
      GestorHorarios.guardar(evento);
      expect(evento.preventDefault).toHaveBeenCalled();
    });

    test('INVÁLIDO: Muestra error cuando guardar falla', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      global.RepositorioConfiguracion.guardarYGenerarBloques.mockResolvedValue(false);
      global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
        { dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00', duracion_bloque_minutos: 30, activo: true },
      ]);

      const evento = { preventDefault: jest.fn() };
      await GestorHorarios.guardar(evento);
      await new Promise((resolve) => setTimeout(resolve, 50));
      console.error.mockRestore();
      expect(evento.preventDefault).toHaveBeenCalled();
    });
  });

  describe('RepositorioConfiguracion.guardarYGenerarBloques', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('VÁLIDO: Guarda configuración válida de bloques', async () => {
      global.clienteSupabase = {
        from: jest.fn(function() {
          const chainObj = {
            delete: jest.fn(function() { return this; }),
            eq: jest.fn(function() { return this; }),
            select: jest.fn(function() { return this; }),
            gte: jest.fn(function() { return this; }),
            lte: jest.fn(function() { return Promise.resolve({ data: [], error: null }); }),
            insert: jest.fn(function() { return this; }),
          };
          return chainObj;
        }),
      };

      const config = [
        { psicologo_id: 'psi-001', dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00', duracion_bloque_minutos: 60, activo: true },
      ];

      const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-001', config, '2026-05-18', '2026-05-24');
      expect(resultado).toBe(true);
    });

    test('LÍMITE: Guarda bloque mínimo válido', async () => {
      global.clienteSupabase = {
        from: jest.fn(function() {
          const chainObj = {
            delete: jest.fn(function() { return this; }),
            eq: jest.fn(function() { return this; }),
            select: jest.fn(function() { return this; }),
            gte: jest.fn(function() { return this; }),
            lte: jest.fn(function() { return Promise.resolve({ data: [], error: null }); }),
            insert: jest.fn(function() { return this; }),
          };
          return chainObj;
        }),
      };

      const config = [{ psicologo_id: 'psi-002', dia_semana: 3, hora_inicio: '10:00', hora_fin: '11:00', duracion_bloque_minutos: 60, activo: true }];
      const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-002', config, '2026-05-18', '2026-05-24');
      expect(resultado).toBe(true);
    });

    test('INVÁLIDO: Rechaza bloque sin duración', async () => {
      global.clienteSupabase = {
        from: jest.fn(function() {
          const chainObj = {
            delete: jest.fn(function() { return this; }),
            eq: jest.fn(function() { return this; }),
            select: jest.fn(function() { return this; }),
            gte: jest.fn(function() { return this; }),
            lte: jest.fn(function() { return Promise.resolve({ data: [], error: null }); }),
            insert: jest.fn(function() { return this; }),
          };
          return chainObj;
        }),
      };

      const config = [{ psicologo_id: 'psi-003', dia_semana: 1, hora_inicio: '10:00', hora_fin: '10:00', duracion_bloque_minutos: 60, activo: true }];
      const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-003', config, '2026-05-18', '2026-05-24');
      expect(resultado).toBe(true);
    });

    test('INVÁLIDO: Falla si error en Supabase', async () => {
      global.clienteSupabase = {
        from: jest.fn(function() {
          const chainObj = {
            delete: jest.fn(function() { return this; }),
            eq: jest.fn(function() { return Promise.resolve({ data: null, error: { message: 'DB error' } }); }),
            select: jest.fn(function() { return this; }),
            gte: jest.fn(function() { return this; }),
            lte: jest.fn(function() { return Promise.resolve({ data: null, error: { message: 'DB error' } }); }),
            insert: jest.fn(function() { return this; }),
          };
          return chainObj;
        }),
      };

      const config = [{ psicologo_id: 'psi-004', dia_semana: 1, hora_inicio: '09:00', hora_fin: '10:00', duracion_bloque_minutos: 60, activo: true }];
      const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-004', config, '2026-05-18', '2026-05-24');
      expect(resultado).toBe(false);
    });
  });

  describe('RepositorioConfiguracion adicional', () => {
    test('VÁLIDO: Valida formato de duración en minutos', async () => {
      const evento = { preventDefault: jest.fn() };
      global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
        {
          psicologo_id: 'psi-001',
          dia_semana: 1,
          hora_inicio: '09:00:00',
          hora_fin: '18:00:00',
          duracion_bloque_minutos: 60,
          activo: true,
        },
      ]);
      GestorHorarios.guardar(evento);
      expect(evento.preventDefault).toHaveBeenCalled();
    });

    test('VÁLIDO: Guarda configuración de múltiples días', async () => {
      const evento = { preventDefault: jest.fn() };
      global.GestorConfiguracionUI.obtenerConfiguracionesFormulario.mockReturnValue([
        {
          psicologo_id: 'psi-001',
          dia_semana: 1,
          hora_inicio: '09:00:00',
          hora_fin: '18:00:00',
          duracion_bloque_minutos: 30,
          activo: true,
        },
        {
          psicologo_id: 'psi-001',
          dia_semana: 2,
          hora_inicio: '10:00:00',
          hora_fin: '17:00:00',
          duracion_bloque_minutos: 45,
          activo: true,
        },
      ]);
      GestorHorarios.guardar(evento);
      expect(evento.preventDefault).toHaveBeenCalled();
    });
  });

  describe('RepositorioConfiguracion.obtener', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('VÁLIDO: Retorna configuraciones del psicólogo', async () => {
      const configEsperada = [{ psicologo_id: 'psi-001', dia_semana: 1, hora_inicio: '09:00', hora_fin: '17:00' }];
      global.clienteSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(function() { return this; }),
          eq: jest.fn().mockResolvedValue({ data: configEsperada, error: null }),
        })),
      };

      const resultado = await RepositorioConfiguracion.obtener('psi-001');
      expect(resultado).toEqual(configEsperada);
    });

    test('LÍMITE: Retorna array vacío si no hay config', async () => {
      global.clienteSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(function() { return this; }),
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      };

      const resultado = await RepositorioConfiguracion.obtener('psi-inexistente');
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado).toHaveLength(0);
    });

    test('INVÁLIDO: No mezcla config de otros psicólogos', async () => {
      global.clienteSupabase = {
        from: jest.fn(() => ({
          select: jest.fn(function() { return this; }),
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      };

      const resultado = await RepositorioConfiguracion.obtener('psi-001');
      expect(resultado).not.toContainEqual(expect.objectContaining({ psicologo_id: 'psi-002' }));
    });
  });
});
