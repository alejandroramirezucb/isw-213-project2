import https from 'node:https';

export class ClienteSupabaseAdmin {
  constructor(host, serviceKey) {
    this._host = host;
    this._serviceKey = serviceKey;
  }

  _cabeceras(extra = {}) {
    return {
      Authorization: `Bearer ${this._serviceKey}`,
      apikey: this._serviceKey,
      ...extra,
    };
  }

  _peticion(opts, cuerpo = null) {
    return new Promise((resolve, reject) => {
      const req = https.request(opts, (res) => {
        let buf = '';
        res.on('data', (c) => { buf += c; });
        res.on('end', () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(buf) }); }
          catch { resolve({ status: res.statusCode, data: buf }); }
        });
      });
      req.on('error', reject);
      if (cuerpo) req.write(cuerpo);
      req.end();
    });
  }

  post(apiPath, body) {
    const data = JSON.stringify(body);
    return this._peticion({
      hostname: this._host, port: 443, path: apiPath, method: 'POST',
      headers: this._cabeceras({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), Prefer: 'return=representation' }),
    }, data);
  }

  get(apiPath) {
    return this._peticion({ hostname: this._host, port: 443, path: apiPath, method: 'GET', headers: this._cabeceras() });
  }

  patch(apiPath, body) {
    const data = JSON.stringify(body);
    return this._peticion({
      hostname: this._host, port: 443, path: apiPath, method: 'PATCH',
      headers: this._cabeceras({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), Prefer: 'return=representation' }),
    }, data);
  }

  delete(apiPath) {
    return new Promise((resolve, reject) => {
      const req = https.request(
        { hostname: this._host, port: 443, path: apiPath, method: 'DELETE', headers: this._cabeceras() },
        (res) => { res.resume(); res.on('end', () => resolve({ status: res.statusCode })); },
      );
      req.on('error', reject);
      req.end();
    });
  }
}
