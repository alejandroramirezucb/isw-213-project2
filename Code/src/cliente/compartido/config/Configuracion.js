export class Configuracion {
  static RUTAS = {
    INICIO: '/',
    PSICOLOGO: '/psicologo.html',
    PACIENTE: '/paciente.html',
  };

  static SELECTORES_AUTH = {
    BOTON_MOSTRAR_REGISTRO: '#btn-mostrar-registro',
    BOTON_MOSTRAR_LOGIN: '#btn-mostrar-login',
    FORMULARIO_LOGIN: '#formulario-login',
    FORMULARIO_REGISTRO: '#formulario-registro',
    CORREO_LOGIN: '#correo-login',
    PASSWORD_LOGIN: '#contrasena-login',
    NOMBRE_REGISTRO: '#nombre-registro',
    APELLIDO_REGISTRO: '#apellido-registro',
    CORREO_REGISTRO: '#correo-registro',
    TELEFONO_REGISTRO: '#telefono-registro',
    PASSWORD_REGISTRO: '#contrasena-registro',
    TIPO_CUENTA: 'input[name="tipo-cuenta"]:checked',
    SECCION_LOGIN: '#seccion-login',
    SECCION_REGISTRO: '#seccion-registro',
  };

  static SELECTORES_MENSAJES = {
    CONTENEDOR: '#mensaje-estado',
    TEXTO: '.mensaje__texto',
  };

  static CLASES_CSS = {
    ENTRADA_OCULTA: 'entrada--oculta',
    MENSAJE_OCULTO: 'mensaje--oculto',
    VISTA_ACTIVA: 'vista--activa',
    BOTON_NAV_ACTIVO: 'navegacion__boton--activo',
    MODAL_OCULTO: 'modal--oculto',
    FILTRO_ACTIVO: 'filtros__boton--activo',
    PERIODO_ACTIVO: 'periodo__boton--activo',
  };

  static API = {
    ENDPOINT_REGISTRO: '/api/registrar',
    TIPO_CONTENIDO: 'application/json',
  };

  static DURACIONES = {
    MENSAJE_AUTH: 4000,
    MENSAJE_DASHBOARD: 3000,
  };

  static IDS_MODALES = {
    RESERVA: 'modal-reserva',
    CANCELACION: 'modal-cancelacion',
    DETALLE_CITA: 'modal-detalle-cita',
    HISTORIAL_PACIENTE: 'modal-historial-paciente',
    PASSWORD: 'modal-cambiar-contrasena',
  };

  static VALIDACIONES = {
    MIN_PASSWORD: 6,
    MIN_NOMBRE: 2,
  };
}
