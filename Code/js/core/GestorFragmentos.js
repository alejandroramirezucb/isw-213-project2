class GestorFragmentos {
  static async cargarFragmentoPaciente(vistaId) {
    try {
      const rutasFragmentos = {
        'calendario': '../../html/paciente/calendario.html',
        'mis-citas': '../../html/paciente/citas.html',
        'perfil': '../../html/paciente/perfil.html',
      };

      const ruta = rutasFragmentos[vistaId];
      if (!ruta) {
        console.warn(`Ruta no encontrada para vista: ${vistaId}`);
        return false;
      }

      const respuesta = await fetch(ruta);
      if (!respuesta.ok) {
        console.error(`Error al cargar fragmento ${vistaId}: ${respuesta.status}`);
        return false;
      }

      const html = await respuesta.text();
      const contenedor = document.getElementById(`vista-${vistaId}`);
      if (contenedor) {
        contenedor.innerHTML = html;
        return true;
      } else {
        console.error(`Contenedor vista-${vistaId} no encontrado`);
        return false;
      }
    } catch (error) {
      console.error(`Error cargando fragmento ${vistaId}:`, error);
      return false;
    }
  }

  static async cargarFragmentoPsicologo(vistaId) {
    try {
      const rutasFragmentos = {
        'panel': '../../html/psicologo/panel.html',
        'configuracion': '../../html/psicologo/horarios.html',
        'historial': '../../html/psicologo/historial.html',
        'perfil': '../../html/psicologo/perfil.html',
      };

      const ruta = rutasFragmentos[vistaId];
      if (!ruta) {
        console.warn(`Ruta no encontrada para vista: ${vistaId}`);
        return false;
      }

      const respuesta = await fetch(ruta);
      if (!respuesta.ok) {
        console.error(`Error al cargar fragmento ${vistaId}: ${respuesta.status}`);
        return false;
      }

      const html = await respuesta.text();
      const contenedor = document.getElementById(`vista-${vistaId}`);
      if (contenedor) {
        contenedor.innerHTML = html;
        return true;
      } else {
        console.error(`Contenedor vista-${vistaId} no encontrado`);
        return false;
      }
    } catch (error) {
      console.error(`Error cargando fragmento ${vistaId}:`, error);
      return false;
    }
  }
}
