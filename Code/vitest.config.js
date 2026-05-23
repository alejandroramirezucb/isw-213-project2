import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.vitest.js'],
    timeout: 10000,

    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',

      include: [
        'src/cliente/**/modelos/**/*.js',
        'src/cliente/compartido/gestores/**/*.js',
        'src/cliente/compartido/validadores/**/*.js',
        'src/cliente/compartido/formateadores/**/*.js',
      ],

      exclude: [
        'src/cliente/**/repositorios/**/*.js',
        'src/cliente/compartido/config/**/*.js',
        'src/cliente/**/AplicacionPaciente.js',
        'src/cliente/**/AplicacionPsicologo.js',
        'src/cliente/**/inicio.js',
        'src/cliente/**/controladores/**/*.js',
        'src/cliente/**/vistas/**/*.js',
        'src/servidor/**/*.js',
        '**/*.test.js',
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
      ],
    },
  },
});
