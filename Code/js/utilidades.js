class FormateadorFecha {
  static MESES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  static DIAS = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ];

  static aTexto(fecha) {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return `${this.DIAS[f.getDay()]}, ${f.getDate()} de ${this.MESES[f.getMonth()]} de ${f.getFullYear()}`;
  }

  static aTextoCorto(fecha) {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return `${f.getDate()} de ${this.MESES[f.getMonth()]}`;
  }

  static aISO(fecha) {
    const a = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${a}-${m}-${d}`;
  }
}

class FormateadorHora {
  static formatear(hora) {
    if (!hora) return '';
    const partes = hora.split(':');
    return `${parseInt(partes[0]).toString().padStart(2, '0')}:${partes[1]}`;
  }
}

class GestorMensajes {
  static #temporizador = null;

  static mostrar(texto, tipo = 'info', duracion = 3000) {
    const contenedor = document.getElementById('mensaje-estado');
    if (!contenedor) return;

    const textoElemento = contenedor.querySelector('.mensaje__texto');
    if (this.#temporizador) clearTimeout(this.#temporizador);

    contenedor.classList.remove(
      'mensaje--exito',
      'mensaje--error',
      'mensaje--info',
      'mensaje--oculto',
    );
    contenedor.classList.add(`mensaje--${tipo}`);
    textoElemento.textContent = texto;

    this.#temporizador = setTimeout(() => {
      contenedor.classList.add('mensaje--oculto');
    }, duracion);
  }
}

class GestorVistas {
  static cambiar(vistaId) {
    document
      .querySelectorAll('.vista')
      .forEach((v) => v.classList.remove('vista--activa'));
    const vista = document.getElementById(`vista-${vistaId}`);
    if (vista) vista.classList.add('vista--activa');

    document.querySelectorAll('.navegacion__boton').forEach((b) => {
      b.classList.toggle(
        'navegacion__boton--activo',
        b.dataset.vista === vistaId,
      );
    });
  }
}

class GestorModales {
  static abrir(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('modal--oculto');
  }

  static cerrar(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('modal--oculto');
  }
}

class ServicioAutenticacionPagina {
  static async verificar() {
    const resultado = await clienteSupabase.auth.getSession();
    if (!resultado.data.session) {
      window.location.href = 'index.html';
      return null;
    }
    return resultado.data.session;
  }

  static async obtenerUsuario() {
    const resultado = await clienteSupabase.auth.getUser();
    if (!resultado.data.user) return null;

    const consulta = await clienteSupabase
      .from('usuarios_auth')
      .select('*, pacientes(*), psicologos(*)')
      .eq('id', resultado.data.user.id)
      .single();

    return consulta.data;
  }

  static async cerrarSesion() {
    await clienteSupabase.auth.signOut();
    window.location.href = 'index.html';
  }
}

function formatearFecha(fecha) {
  return FormateadorFecha.aTexto(fecha);
}
function formatearFechaCorta(fecha) {
  return FormateadorFecha.aTextoCorto(fecha);
}
function formatearHora(hora) {
  return FormateadorHora.formatear(hora);
}
function obtenerFechaISO(fecha) {
  return FormateadorFecha.aISO(fecha);
}
function mostrarMensaje(texto, tipo, duracion) {
  GestorMensajes.mostrar(texto, tipo, duracion);
}
function verificarAutenticacion() {
  return ServicioAutenticacionPagina.verificar();
}
function obtenerUsuarioActual() {
  return ServicioAutenticacionPagina.obtenerUsuario();
}
function cerrarSesion() {
  return ServicioAutenticacionPagina.cerrarSesion();
}
function cambiarVista(vistaId) {
  GestorVistas.cambiar(vistaId);
}
function abrirModal(modalId) {
  GestorModales.abrir(modalId);
}
function cerrarModal(modalId) {
  GestorModales.cerrar(modalId);
}

const NOMBRES_MESES = FormateadorFecha.MESES;
const NOMBRES_DIAS = FormateadorFecha.DIAS;
