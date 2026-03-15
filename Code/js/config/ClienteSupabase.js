class ClienteSupabase {
  static #instancia = null;

  static obtener() {
    if (!this.#instancia) {
      this.#instancia = supabase.createClient(
        ENV.SUPABASE_URL,
        ENV.SUPABASE_ANON_KEY,
      );
    }
    return this.#instancia;
  }
}

// Exportar instancia global
window.clienteSupabase = ClienteSupabase.obtener();
