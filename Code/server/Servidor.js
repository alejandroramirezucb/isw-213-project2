const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const Configuracion = require('./Configuracion');
const ClienteSupabaseAdmin = require('./ClienteSupabaseAdmin');
const ControladorRegistro = require('./ControladorRegistro');
const ControladorRecordatorios = require('./ControladorRecordatorios');

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

module.exports = Servidor;
