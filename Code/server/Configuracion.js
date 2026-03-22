const fs = require('fs');

class Configuracion {
  #env;
  #envJs;
  #mime = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
  };

  constructor() {
    let rawEnv = '';
    try {
      rawEnv = fs.readFileSync('.env', 'utf8');
    } catch {
      rawEnv = '';
    }

    this.#env = rawEnv.split('\n').reduce((acc, line) => {
      line = line.trim();
      if (!line || line.startsWith('#')) return acc;
      const i = line.indexOf('=');
      if (i > 0) acc[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      return acc;
    }, {});

    this.#env = { ...this.#env, ...process.env };

    this.#envJs = `var ENV=${JSON.stringify({
      SUPABASE_URL: this.#obtener('SUPABASE_URL'),
      SUPABASE_ANON_KEY: this.#obtener('SUPABASE_ANON_KEY'),
    })};`;
  }

  #obtener(clave) {
    return this.#env[clave] || '';
  }

  get supabaseUrl() {
    return this.#obtener('SUPABASE_URL');
  }
  get supabaseHost() {
    const url = this.#obtener('SUPABASE_URL');
    return url.replace('https://', '');
  }
  get serviceRoleKey() {
    return this.#obtener('SUPABASE_SERVICE_ROLE_KEY');
  }
  get envJs() {
    return this.#envJs;
  }
  obtenerMime(ext) {
    return this.#mime[ext] || 'application/octet-stream';
  }
}

module.exports = Configuracion;
