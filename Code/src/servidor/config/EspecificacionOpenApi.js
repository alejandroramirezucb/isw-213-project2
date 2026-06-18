export const EspecificacionOpenApi = {
  openapi: '3.0.0',
  info: {
    title: 'Psicoraiden',
    version: '1.0.0',
    description: 'API de gestion de citas psicologicas',
  },
  servers: [
    { url: '/', description: 'Servidor actual' },
  ],
  paths: {
    '/api/registrar': {
      post: {
        summary: 'Registrar un nuevo usuario (paciente o psicólogo)',
        tags: ['Autenticación'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Registro' },
            },
          },
        },
        responses: {
          200: { description: 'Usuario registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Ok' } } } },
          400: { description: 'JSON inválido o faltan campos requeridos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'El correo ya está registrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Error del servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/recordatorios': {
      post: {
        summary: 'Generar recordatorios de citas próximas (24h)',
        tags: ['Procesos'],
        responses: {
          200: { description: 'Recordatorios procesados', content: { 'application/json': { schema: { $ref: '#/components/schemas/Enviados' } } } },
          500: { description: 'Error al generar recordatorios', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/notificaciones': {
      post: {
        summary: 'Verificar notificaciones pendientes de pacientes',
        tags: ['Procesos'],
        responses: {
          200: { description: 'Notificaciones verificadas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Verificadas' } } } },
          500: { description: 'Error al procesar notificaciones', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/lista-espera': {
      post: {
        summary: 'Notificar pacientes en lista de espera del día',
        tags: ['Procesos'],
        responses: {
          200: { description: 'Lista de espera procesada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Notificados' } } } },
          500: { description: 'Error al procesar lista de espera', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
  components: {
    schemas: {
      Registro: {
        type: 'object',
        required: ['correo', 'password', 'nombre', 'apellido', 'tipoCuenta'],
        properties: {
          correo: { type: 'string', format: 'email', example: 'ana@correo.com' },
          password: { type: 'string', minLength: 6, example: 'secreto123' },
          nombre: { type: 'string', example: 'Ana' },
          apellido: { type: 'string', example: 'Pérez' },
          telefono: { type: 'string', nullable: true, example: '+591 70000000' },
          tipoCuenta: { type: 'string', enum: ['paciente', 'psicologo'], example: 'paciente' },
        },
      },
      Ok: {
        type: 'object',
        properties: { ok: { type: 'boolean', example: true } },
      },
      Enviados: {
        type: 'object',
        properties: { ok: { type: 'boolean', example: true }, enviados: { type: 'integer', example: 3 } },
      },
      Verificadas: {
        type: 'object',
        properties: { ok: { type: 'boolean', example: true }, verificadas: { type: 'integer', example: 5 } },
      },
      Notificados: {
        type: 'object',
        properties: { ok: { type: 'boolean', example: true }, notificados: { type: 'integer', example: 2 } },
      },
      Error: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Faltan campos requeridos' } },
      },
    },
  },
};
