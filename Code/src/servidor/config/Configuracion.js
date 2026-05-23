import { readFileSync } from 'node:fs';

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

export class Configuracion {
  constructor() {
    this._env = this._cargarEnv();
    this._envJs = `var ENV=${JSON.stringify({
      SUPABASE_URL: this._obtener('SUPABASE_URL'),
      SUPABASE_ANON_KEY: this._obtener('SUPABASE_ANON_KEY'),
    })};`;
  }

  _cargarEnv() {
    let raw = '';
    try { raw = readFileSync('.env', 'utf8'); } catch (_) {}
    const parsed = raw.split('\n').reduce((acc, linea) => {
      linea = linea.trim();
      if (!linea || linea.startsWith('#')) return acc;
      const i = linea.indexOf('=');
      if (i > 0) acc[linea.slice(0, i).trim()] = linea.slice(i + 1).trim();
      return acc;
    }, {});
    return { ...parsed, ...process.env };
  }

  _obtener(clave) { return this._env[clave] || ''; }

  get supabaseUrl() { return this._obtener('SUPABASE_URL'); }
  get supabaseHost() { return this._obtener('SUPABASE_URL').replace('https://', ''); }
  get serviceRoleKey() { return this._obtener('SUPABASE_SERVICE_ROLE_KEY'); }
  get envJs() { return this._envJs; }

  obtenerMime(ext) { return MIME[ext] || 'application/octet-stream'; }
}
