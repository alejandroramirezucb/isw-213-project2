const https = require('https');

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

  patch(apiPath, body) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(body);
      const opts = {
        hostname: this.#host,
        port: 443,
        path: apiPath,
        method: 'PATCH',
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

module.exports = ClienteSupabaseAdmin;
