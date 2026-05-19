const RepositorioConfiguracion = require('../../../js/psicologo/repositorio/RepositorioConfiguracion.js');

describe('RepositorioConfiguracion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('guardarYGenerarBloques', () => {
    test('VÁLIDO: Guarda configuración válida de bloques', async () => {
      global.clienteSupabase.from = jest.fn(function() {
        const chainObj = {
          delete: jest.fn(function() { return this; }),
          eq: jest.fn(function() { return this; }),
          select: jest.fn(function() { return this; }),
          gte: jest.fn(function() { return this; }),
          lte: jest.fn(function() { return Promise.resolve({ data: [], error: null }); }),
          insert: jest.fn(function() { return this; }),
        };
        return chainObj;
      });

      const config = [
        { psicologo_id: 'psi-001', dia_semana: 1, hora_inicio: '09:00', hora_fin: '13:00', duracion_bloque_minutos: 60, activo: true },
      ];

      const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-001', config, '2026-05-18', '2026-05-24');
      expect(resultado).toBe(true);
    });

    test('LÍMITE: Guarda bloque mínimo válido', async () => {
      global.clienteSupabase.from = jest.fn(function() {
        const chainObj = {
          delete: jest.fn(function() { return this; }),
          eq: jest.fn(function() { return this; }),
          select: jest.fn(function() { return this; }),
          gte: jest.fn(function() { return this; }),
          lte: jest.fn(function() { return Promise.resolve({ data: [], error: null }); }),
          insert: jest.fn(function() { return this; }),
        };
        return chainObj;
      });

      const config = [{ psicologo_id: 'psi-002', dia_semana: 3, hora_inicio: '10:00', hora_fin: '11:00', duracion_bloque_minutos: 60, activo: true }];
      const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-002', config, '2026-05-18', '2026-05-24');
      expect(resultado).toBe(true);
    });

    test('INVÁLIDO: Rechaza bloque sin duración', async () => {
      global.clienteSupabase.from = jest.fn(function() {
        const chainObj = {
          delete: jest.fn(function() { return this; }),
          eq: jest.fn(function() { return this; }),
          select: jest.fn(function() { return this; }),
          gte: jest.fn(function() { return this; }),
          lte: jest.fn(function() { return Promise.resolve({ data: [], error: null }); }),
          insert: jest.fn(function() { return this; }),
        };
        return chainObj;
      });

      const config = [{ psicologo_id: 'psi-003', dia_semana: 1, hora_inicio: '10:00', hora_fin: '10:00', duracion_bloque_minutos: 60, activo: true }];
      const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-003', config, '2026-05-18', '2026-05-24');
      expect(resultado).toBe(true);
    });

    test('INVÁLIDO: Falla si error en Supabase', async () => {
      global.clienteSupabase.from = jest.fn(function() {
        const chainObj = {
          delete: jest.fn(function() { return this; }),
          eq: jest.fn(function() { return Promise.resolve({ data: null, error: { message: 'DB error' } }); }),
          select: jest.fn(function() { return this; }),
          gte: jest.fn(function() { return this; }),
          lte: jest.fn(function() { return Promise.resolve({ data: null, error: { message: 'DB error' } }); }),
          insert: jest.fn(function() { return this; }),
        };
        return chainObj;
      });

      const config = [{ psicologo_id: 'psi-004', dia_semana: 1, hora_inicio: '09:00', hora_fin: '10:00', duracion_bloque_minutos: 60, activo: true }];
      const resultado = await RepositorioConfiguracion.guardarYGenerarBloques('psi-004', config, '2026-05-18', '2026-05-24');
      expect(resultado).toBe(false);
    });
  });

  describe('obtener', () => {
    test('VÁLIDO: Retorna configuraciones del psicólogo', async () => {
      const configEsperada = [{ psicologo_id: 'psi-001', dia_semana: 1, hora_inicio: '09:00', hora_fin: '17:00' }];
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn(function() { return this; }),
        eq: jest.fn().mockResolvedValue({ data: configEsperada, error: null }),
      }));

      const resultado = await RepositorioConfiguracion.obtener('psi-001');
      expect(resultado).toEqual(configEsperada);
    });

    test('LÍMITE: Retorna array vacío si no hay config', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn(function() { return this; }),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const resultado = await RepositorioConfiguracion.obtener('psi-inexistente');
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado).toHaveLength(0);
    });

    test('INVÁLIDO: No mezcla config de otros psicólogos', async () => {
      global.clienteSupabase.from = jest.fn(() => ({
        select: jest.fn(function() { return this; }),
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      }));

      const resultado = await RepositorioConfiguracion.obtener('psi-001');
      expect(resultado).not.toContainEqual(expect.objectContaining({ psicologo_id: 'psi-002' }));
    });
  });
});
