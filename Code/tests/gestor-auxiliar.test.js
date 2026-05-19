const GestorConfiguracionUI = require('../js/psicologo/gestor/GestorConfiguracionUI.js');

describe('GestorConfiguracionUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.EstadoPsicologo = {
      obtener: jest.fn(() => 'psi-001'),
    };
    global.FormateadorFecha = {
      aISO: jest.fn((date) => '2026-05-19'),
    };
    global.document = {
      getElementById: jest.fn((id) => {
        if (id === 'fecha-desde' || id === 'fecha-hasta') {
          return { value: '2026-05-19' };
        }
        return null;
      }),
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
    };
  });

  test('VÁLIDO: Establece fechas por defecto', () => {
    GestorConfiguracionUI.establecerFechasPorDefecto();
    expect(global.document.getElementById).toHaveBeenCalled();
  });

  test('VÁLIDO: Obtiene configuraciones del formulario', () => {
    const configuraciones = GestorConfiguracionUI.obtenerConfiguracionesFormulario();
    expect(Array.isArray(configuraciones)).toBe(true);
  });

  test('VÁLIDO: Retorna array vacío cuando no hay elementos seleccionados', () => {
    global.document.querySelectorAll = jest.fn(() => []);
    const configuraciones = GestorConfiguracionUI.obtenerConfiguracionesFormulario();
    expect(configuraciones.length).toBe(0);
  });

  test('VÁLIDO: Procesa formato de hora con segundos', () => {
    const mockDia = {
      dataset: { dia: '1' },
      querySelector: jest.fn((sel) => ({
        checked: sel.includes('checkbox'),
        value: '09:00',
      })),
    };
    global.document.querySelectorAll = jest.fn(() => [mockDia]);
    const configuraciones = GestorConfiguracionUI.obtenerConfiguracionesFormulario();
    expect(Array.isArray(configuraciones)).toBe(true);
  });

  test('VÁLIDO: Toggle muestra horarios cuando checkbox activado', () => {
    const mockHorarios = { classList: { toggle: jest.fn() } };
    const evento = {
      target: {
        checked: true,
        closest: jest.fn(() => ({
          querySelector: jest.fn(() => mockHorarios),
        })),
      },
    };
    GestorConfiguracionUI.toggleHorariosDia(evento);
    expect(mockHorarios.classList.toggle).toHaveBeenCalledWith(
      'configuracion__horarios--oculto',
      false,
    );
  });

  test('LÍMITE: Toggle oculta horarios cuando checkbox desactivado', () => {
    const mockHorarios = { classList: { toggle: jest.fn() } };
    const evento = {
      target: {
        checked: false,
        closest: jest.fn(() => ({
          querySelector: jest.fn(() => mockHorarios),
        })),
      },
    };
    GestorConfiguracionUI.toggleHorariosDia(evento);
    expect(mockHorarios.classList.toggle).toHaveBeenCalledWith(
      'configuracion__horarios--oculto',
      true,
    );
  });

  test('VÁLIDO: Formatea hora sin doble punto', () => {
    const mockDia = {
      dataset: { dia: '2' },
      querySelector: jest.fn((sel) => {
        if (sel.includes('checkbox')) return { checked: true };
        if (sel.includes('inicio')) return { value: '0900' };
        if (sel.includes('fin')) return { value: '1800' };
        if (sel.includes('duracion')) return { value: '30' };
        return null;
      }),
    };
    global.document.querySelectorAll = jest.fn(() => [mockDia]);
    const configs = GestorConfiguracionUI.obtenerConfiguracionesFormulario();
    expect(Array.isArray(configs)).toBe(true);
  });

  test('VÁLIDO: Formatea hora con formato HH:MM', () => {
    const mockDia = {
      dataset: { dia: '3' },
      querySelector: jest.fn((sel) => {
        if (sel.includes('checkbox')) return { checked: true };
        if (sel.includes('inicio')) return { value: '09:00' };
        if (sel.includes('fin')) return { value: '18:00' };
        if (sel.includes('duracion')) return { value: '45' };
        return null;
      }),
    };
    global.document.querySelectorAll = jest.fn(() => [mockDia]);
    const configs = GestorConfiguracionUI.obtenerConfiguracionesFormulario();
    expect(configs.length).toBeGreaterThan(0);
    expect(configs[0].hora_inicio).toContain(':00');
  });

  test('VÁLIDO: Carga configuración activa del servidor', async () => {
    global.RepositorioConfiguracion = {
      obtener: jest.fn().mockResolvedValue([
        {
          dia_semana: 1,
          hora_inicio: '09:00:00',
          hora_fin: '18:00:00',
          duracion_bloque_minutos: 30,
          activo: true,
        },
      ]),
    };

    const mockCheckbox = { checked: false };
    const mockHoraInicio = { value: '' };
    const mockHoraFin = { value: '' };
    const mockDuracion = { value: '' };
    const mockHorarios = { classList: { remove: jest.fn() } };

    const mockDia = {
      querySelector: jest.fn((sel) => {
        if (sel.includes('checkbox')) return mockCheckbox;
        if (sel.includes('inicio')) return mockHoraInicio;
        if (sel.includes('fin')) return mockHoraFin;
        if (sel.includes('duracion')) return mockDuracion;
        if (sel.includes('horarios')) return mockHorarios;
        return null;
      }),
    };

    global.document.querySelector = jest.fn((sel) => {
      if (sel.includes('dia_semana') || sel.includes('data-dia="1"')) return mockDia;
      return null;
    });

    await GestorConfiguracionUI.cargarConfiguracion();
    expect(global.RepositorioConfiguracion.obtener).toHaveBeenCalledWith('psi-001');
  });

  test('LÍMITE: Carga configuración sin elementos en DOM', async () => {
    global.RepositorioConfiguracion = {
      obtener: jest.fn().mockResolvedValue([
        { dia_semana: 1, hora_inicio: '09:00', hora_fin: '18:00', duracion_bloque_minutos: 30, activo: false },
      ]),
    };
    global.document.querySelector = jest.fn(() => null);
    await GestorConfiguracionUI.cargarConfiguracion();
    expect(global.RepositorioConfiguracion.obtener).toHaveBeenCalled();
  });

  test('LÍMITE: establecerFechasPorDefecto con elementos null', () => {
    global.document.getElementById = jest.fn(() => null);
    GestorConfiguracionUI.establecerFechasPorDefecto();
    expect(global.document.getElementById).toHaveBeenCalled();
  });

  test('VÁLIDO: Carga configuración sin dia activo', async () => {
    global.RepositorioConfiguracion = {
      obtener: jest.fn().mockResolvedValue([
        { dia_semana: 2, hora_inicio: '10:00:00', hora_fin: '18:00:00', duracion_bloque_minutos: 30, activo: false },
      ]),
    };

    const mockCheckbox = { checked: false };
    const mockHoraInicio = { value: '' };
    const mockHoraFin = { value: '' };
    const mockDuracion = { value: '' };

    const mockDiaElement = {
      querySelector: jest.fn((sel) => {
        if (sel.includes('checkbox')) return mockCheckbox;
        if (sel.includes('inicio')) return mockHoraInicio;
        if (sel.includes('fin')) return mockHoraFin;
        if (sel.includes('duracion')) return mockDuracion;
        return null;
      }),
    };

    global.document.querySelector = jest.fn(() => mockDiaElement);

    await GestorConfiguracionUI.cargarConfiguracion();
    expect(global.RepositorioConfiguracion.obtener).toHaveBeenCalled();
  });
});
