const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

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
    const rawEnv = fs.readFileSync('.env', 'utf8');
    this.#env = rawEnv.split('\n').reduce((acc, line) => {
      line = line.trim();
      if (!line || line.startsWith('#')) return acc;
      const i = line.indexOf('=');
      if (i > 0) acc[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      return acc;
    }, {});

    this.#envJs = `var ENV=${JSON.stringify({
      SUPABASE_URL: this.#env.SUPABASE_URL,
      SUPABASE_ANON_KEY: this.#env.SUPABASE_ANON_KEY,
    })};`;
  }

  get supabaseUrl() {
    return this.#env.SUPABASE_URL;
  }
  get supabaseHost() {
    return this.#env.SUPABASE_URL.replace('https://', '');
  }
  get serviceRoleKey() {
    return this.#env.SUPABASE_SERVICE_ROLE_KEY;
  }
  get envJs() {
    return this.#envJs;
  }
  obtenerMime(ext) {
    return this.#mime[ext] || 'application/octet-stream';
  }
}

class ClienteSupabaseAdmin {
  #host;
  #serviceKey;

  constructor(host, serviceKey) {
    this.#host = host;
    this.#serviceKey = serviceKey;
  }

  post(apiPath, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const opts = {
        hostname: this.#host,
        port: 443,
        path: apiPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          Authorization: `Bearer ${this.#serviceKey}`,
          apikey: this.#serviceKey,
          Prefer: 'return=representation',
        },
      };

      const req = https.request(opts, (apiRes) => {
        let buf = '';
        apiRes.on('data', (c) => {
          buf += c;
        });
        apiRes.on('end', () => {
          try {
            resolve({ status: apiRes.statusCode, data: JSON.parse(buf) });
          } catch {
            resolve({ status: apiRes.statusCode, data: buf });
          }
        });
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  get(apiPath) {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: this.#host,
        port: 443,
        path: apiPath,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.#serviceKey}`,
          apikey: this.#serviceKey,
        },
      };

      const req = https.request(opts, (apiRes) => {
        let buf = '';
        apiRes.on('data', (c) => {
          buf += c;
        });
        apiRes.on('end', () => {
          try {
            resolve({ status: apiRes.statusCode, data: JSON.parse(buf) });
          } catch {
            resolve({ status: apiRes.statusCode, data: buf });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  delete(apiPath) {
    return new Promise((resolve, reject) => {
      const opts = {
        hostname: this.#host,
        port: 443,
        path: apiPath,
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.#serviceKey}`,
          apikey: this.#serviceKey,
        },
      };

      const req = https.request(opts, (apiRes) => {
        apiRes.resume();
        apiRes.on('end', () => resolve({ status: apiRes.statusCode }));
      });
      req.on('error', reject);
      req.end();
    });
  }
}

class ControladorRegistro {
  #cliente;

  constructor(cliente) {
    this.#cliente = cliente;
  }

  async manejar(req, res) {
    const cuerpo = await this.#leerCuerpo(req);
    let datos;

    try {
      datos = JSON.parse(cuerpo);
    } catch {
      return this.#responder(res, 400, { error: 'JSON inválido' });
    }

    if (
      !datos.correo ||
      !datos.contrasena ||
      !datos.nombre ||
      !datos.apellido ||
      !datos.tipoCuenta
    ) {
      return this.#responder(res, 400, { error: 'Faltan campos requeridos' });
    }

    try {
      const authResult = await this.#cliente.post('/auth/v1/admin/users', {
        email: datos.correo,
        password: datos.contrasena,
        email_confirm: true,
      });

      if (authResult.status === 422) {
        return this.#manejarUsuarioExistente(res, datos);
      }

      if (authResult.status >= 400) {
        const msg =
          authResult.data?.msg ||
          authResult.data?.message ||
          authResult.data?.error_description ||
          'Error al crear usuario';
        return this.#responder(res, authResult.status, { error: msg });
      }

      await this.#crearPerfil(res, datos, authResult.data.id);
    } catch {
      this.#responder(res, 500, { error: 'Error de conexión con Supabase' });
    }
  }

  async #manejarUsuarioExistente(res, datos) {
    console.log(
      '  → 422: usuario ya existe en Auth, verificando si el registro está completo...',
    );

    const usersResult = await this.#cliente.get(
      `/auth/v1/admin/users?email=${encodeURIComponent(datos.correo)}`,
    );
    const users = usersResult.data?.users || [];
    const existingUser = users.find((u) => u.email === datos.correo);

    if (!existingUser) {
      return this.#responder(res, 409, {
        error: 'El correo ya está registrado',
      });
    }

    const authRows = await this.#cliente.get(
      `/rest/v1/usuarios_auth?id=eq.${existingUser.id}&select=id`,
    );

    if (Array.isArray(authRows.data) && authRows.data.length > 0) {
      return this.#responder(res, 409, {
        error: 'El correo ya está registrado',
      });
    }

    console.log('  → Usuario huérfano encontrado, completando registro...');
    await this.#crearPerfil(res, datos, existingUser.id);
  }

  async #crearPerfil(res, datos, usuarioId) {
    const tabla = datos.tipoCuenta === 'psicologo' ? 'psicologos' : 'pacientes';
    const contrasenaHash = crypto
      .createHash('sha256')
      .update(datos.contrasena)
      .digest('hex');

    const perfilResult = await this.#cliente.post(`/rest/v1/${tabla}`, {
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
      telefono: datos.telefono || null,
      contrasena_hash: contrasenaHash,
    });

    console.log(
      `  → Crear perfil en tabla "${tabla}": status=${perfilResult.status}`,
      JSON.stringify(perfilResult.data),
    );

    if (perfilResult.status >= 300) {
      console.error('  → ERROR al crear perfil:', perfilResult.data);
      await this.#cliente.delete(`/auth/v1/admin/users/${usuarioId}`);
      const msg =
        perfilResult.data?.message ||
        perfilResult.data?.msg ||
        perfilResult.data?.details ||
        perfilResult.data?.hint ||
        'Error al crear perfil';
      return this.#responder(res, 500, { error: msg });
    }

    const perfilId = Array.isArray(perfilResult.data)
      ? perfilResult.data[0].id
      : perfilResult.data.id;
    const usuarioAuth = { id: usuarioId, rol: datos.tipoCuenta };

    if (datos.tipoCuenta === 'psicologo') {
      usuarioAuth.psicologo_id = perfilId;
    } else {
      usuarioAuth.paciente_id = perfilId;
    }

    const authRow = await this.#cliente.post(
      '/rest/v1/usuarios_auth',
      usuarioAuth,
    );
    console.log(
      `  → Crear usuarios_auth: status=${authRow.status}`,
      JSON.stringify(authRow.data),
    );

    if (authRow.status >= 300) {
      console.error('  → ERROR al registrar en usuarios_auth:', authRow.data);
      await this.#cliente.delete(`/auth/v1/admin/users/${usuarioId}`);
      const msg =
        authRow.data?.message ||
        authRow.data?.msg ||
        authRow.data?.details ||
        authRow.data?.hint ||
        'Error al registrar usuario';
      return this.#responder(res, 500, { error: msg });
    }

    this.#responder(res, 200, { ok: true });
  }

  #leerCuerpo(req) {
    return new Promise((resolve) => {
      let cuerpo = '';
      req.on('data', (c) => {
        cuerpo += c;
      });
      req.on('end', () => resolve(cuerpo));
    });
  }

  #responder(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

class ControladorRecordatorios {
  #cliente;

  constructor(cliente) {
    this.#cliente = cliente;
  }

  async ejecutar() {
    const ahora = new Date();
    const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    const fechaDesde = ahora.toISOString().slice(0, 10);
    const fechaHasta = en24h.toISOString().slice(0, 10);

    const citasResult = await this.#cliente.get(
      `/rest/v1/citas?estado=eq.reservada&fecha=gte.${fechaDesde}&fecha=lte.${fechaHasta}&select=id,paciente_id,fecha,hora_inicio,created_at`,
    );

    if (!Array.isArray(citasResult.data)) {
      return { enviados: 0, error: 'No se pudieron obtener citas' };
    }

    let enviados = 0;
    for (const cita of citasResult.data) {
      const creadaEn = new Date(cita.created_at);
      const margenMs = ahora.getTime() - creadaEn.getTime();
      if (margenMs < 24 * 60 * 60 * 1000) continue;

      const yaExisteResult = await this.#cliente.get(
        `/rest/v1/notificaciones?cita_id=eq.${cita.id}&tipo=eq.recordatorio&select=id`,
      );

      if (
        Array.isArray(yaExisteResult.data) &&
        yaExisteResult.data.length > 0
      ) {
        continue;
      }

      await this.#cliente.post('/rest/v1/notificaciones', {
        paciente_id: cita.paciente_id,
        cita_id: cita.id,
        tipo: 'recordatorio',
        mensaje: `Recordatorio: tiene una cita el ${cita.fecha} a las ${cita.hora_inicio}.`,
        leida: false,
      });
      enviados++;
    }

    return { enviados };
  }

  async manejar(req, res) {
    try {
      const resultado = await this.ejecutar();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ...resultado }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({ error: 'Error interno al generar recordatorios' }),
      );
    }
  }
}

class Servidor {
  #config;
  #controladorRegistro;
  #controladorRecordatorios;

  constructor() {
    this.#config = new Configuracion();

    if (!this.#config.serviceRoleKey) {
      console.error(
        'ERROR: SUPABASE_SERVICE_ROLE_KEY no está configurado en .env',
      );
      process.exit(1);
    }

    const cliente = new ClienteSupabaseAdmin(
      this.#config.supabaseHost,
      this.#config.serviceRoleKey,
    );
    this.#controladorRegistro = new ControladorRegistro(cliente);
    this.#controladorRecordatorios = new ControladorRecordatorios(cliente);
  }

  iniciar(puerto = 3000) {
    http
      .createServer((req, res) => this.#manejarPeticion(req, res))
      .listen(puerto, () => {
        console.log(`Servidor corriendo en http://localhost:${puerto}`);
        setInterval(
          () => {
            this.#controladorRecordatorios
              .ejecutar()
              .then((r) =>
                console.log(`[Recordatorios] enviados: ${r.enviados}`),
              );
          },
          60 * 60 * 1000,
        );
      });
  }

  #manejarPeticion(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);

    if (pathname === '/' || pathname === '') {
      res.writeHead(302, { Location: '/html/index.html' });
      return res.end();
    }

    if (pathname === '/js/env.js') {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      return res.end(this.#config.envJs);
    }

    if (pathname === '/api/registrar' && req.method === 'POST') {
      return this.#controladorRegistro.manejar(req, res);
    }

    if (pathname === '/api/recordatorios' && req.method === 'POST') {
      return this.#controladorRecordatorios.manejar(req, res);
    }

    this.#servirArchivo(pathname, res);
  }

  #servirArchivo(pathname, res) {
    const filePath = '.' + pathname;
    const ext = path.extname(filePath);
    const contentType = this.#config.obtenerMime(ext);

    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.log(`  → 404 Error: ${err.code} (${filePath})`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`404 Not found: ${pathname}`);
      } else {
        console.log(`  → 200 OK (${content.length} bytes)`);
        const headers = { 'Content-Type': contentType };
        if (ext === '.js' || ext === '.html') {
          headers['Cache-Control'] = 'no-store';
        }
        res.writeHead(200, headers);
        res.end(content);
      }
    });
  }
}

new Servidor().iniciar();
