import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.vitest.js'],
    timeout: 10000,

    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',

      // Solo incluir lógica de negocio testeada (HU-06, HU-08, HU-15 + utilidades)
      include: [
        'src/cliente/paciente/modelos/ModeloCancelacion.js',
        'src/cliente/paciente/modelos/ModeloReprogramacion.js',
        'src/cliente/paciente/modelos/ModeloReserva.js',
        'src/cliente/compartido/validadores/ValidadorFormulario.js',
        'src/cliente/compartido/formateadores/FormateadorFecha.js',
        'src/cliente/compartido/formateadores/FormateadorHora.js',
      ],

      exclude: [
        'src/cliente/**/repositorios/**/*.js',
        'src/cliente/compartido/config/**/*.js',
        'src/cliente/**/AplicacionPaciente.js',
        'src/cliente/**/AplicacionPsicologo.js',
        'src/cliente/**/inicio.js',
        'src/cliente/**/controladores/**/*.js',
        'src/cliente/**/vistas/**/*.js',
        'src/cliente/compartido/gestores/**/*.js',
        'src/servidor/**/*.js',
        '**/*.test.js',
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
      ],
    },
  },
});
