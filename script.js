let Eventos = [];

// Guardar en localStorage
function guardarEnStorage() {
  localStorage.setItem('Eventos', JSON.stringify(Eventos));
}

// Cargar desde localStorage
function cargarDatosDelStorage() {
  const datos = localStorage.getItem('Eventos');
  if (datos) Eventos = JSON.parse(datos);
}

function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function mostrarAlerta(mensaje, tipo = 'success') {
  const alertaDiv = document.getElementById('alertas');
  alertaDiv.innerHTML = `<div class="alert alert-${tipo}">${mensaje}</div>`;
  setTimeout(() => alertaDiv.innerHTML = '', 10000);
}

function parseFecha(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function registrarEvento(e) {
  e.preventDefault();

  const NombreEvento = document.getElementById('NombreEvento').value.trim();
  const Fecha_inicio = document.getElementById('Fecha_inicio').value;
  const Fecha_final = document.getElementById('Fecha_final').value;
  const horarios = document.getElementById('horarios').value;

  if (!NombreEvento || !Fecha_inicio || !Fecha_final || !horarios) {
    mostrarAlerta('Completa todos los campos del evento', 'error');
    return;
  }

  const inicio = parseFecha(Fecha_inicio);
  const fin = parseFecha(Fecha_final);
  if (fin < inicio) {
    mostrarAlerta('La fecha final no puede ser menor a la inicial', 'error');
    return;
  }

  const nuevoEvento = {
    id: Date.now(),
    NombreEvento,
    Fecha_inicio,
    Fecha_final,
    horarios,
    emprendimientos: []
  };

  Eventos.push(nuevoEvento);
  guardarEnStorage();
  document.getElementById('formulario-principal').reset();
  mostrarAlerta('Evento registrado');
  cargarElementos();
}


function registrarEmprendimiento(e) {
  e.preventDefault();

  const NombreEmprendimiento = document.getElementById('NombreEmprendimiento').value.trim();
  const Categoria = document.getElementById('Categoria').value.trim();
  const Descripcion = document.getElementById('Descripcion').value.trim();
  const Enlace = document.getElementById('Enlace').value.trim();
  const ProductoNombre = document.getElementById('ProductoNombre').value.trim();
  const ProductoPrecio = document.getElementById('ProductoPrecio').value.trim();
  const ProductoDescripcion = document.getElementById('ProductoDescripcion').value.trim();
  const ProductoImagenInput = document.getElementById('ProductoImagen');

  if (!NombreEmprendimiento || !Categoria || !Descripcion || !Enlace ||!ProductoNombre || !ProductoPrecio || !ProductoDescripcion || !ProductoImagenInput.files[0]) {
    mostrarAlerta('Completa todos los campos del emprendimiento', 'error');
    return;
  }

  if (Eventos.length === 0) {
    mostrarAlerta('Debes registrar primero un evento', 'error');
    return;
  }


  const reader = new FileReader();
  reader.onload = function (event) {
    const imgBase64 = event.target.result;

    const nuevoEmprendimiento = {
      id: Date.now(),
      NombreEmprendimiento,
      Categoria,
      Descripcion,
      Enlace,
      Producto: {
        Nombre: ProductoNombre,
        Precio: ProductoPrecio,
        Descripcion: ProductoDescripcion,
        Imagen: imgBase64
      }
    };

    Eventos[Eventos.length - 1].emprendimientos.push(nuevoEmprendimiento);
    guardarEnStorage();
    document.getElementById('formulario-emprendimientos').reset();
    mostrarAlerta('Emprendimiento agregado al último evento');
    cargarElementos();
  };

  reader.readAsDataURL(ProductoImagenInput.files[0]);
}

function cargarElementos() {
  const contenedor = document.getElementById('lista-elementos');
  if (Eventos.length === 0) {
    contenedor.innerHTML = '<p>No hay eventos registrados</p>';
    return;
  }

  const ordenados = [...Eventos].sort((a, b) => new Date(a.Fecha_inicio) - new Date(b.Fecha_inicio));

  let html = '';
  ordenados.forEach(evento => {
    html += `
      <div class="evento-card">
        <h3>${evento.NombreEvento}</h3>
        <p><strong>Inicio:</strong> ${formatearFecha(evento.Fecha_inicio)}</p>
        <p><strong>Fin:</strong> ${formatearFecha(evento.Fecha_final)}</p>
        <p><strong>Horarios:</strong> ${evento.horarios}</p>
        <h4>Emprendimientos:</h4>
        </div>
    `;

    if (evento.emprendimientos.length === 0) {
      html += '<p>Agrega Emprendimientos</p>';
    } else {
      evento.emprendimientos.forEach(emp => {
        html += `
          <div class="emprendimiento-card">
            <p><strong>Nombre:</strong> ${emp.NombreEmprendimiento}</p>
            <p><strong>Categoría:</strong> ${emp.Categoria}</p>
            <p><strong>Descripción:</strong> ${emp.Descripcion}</p>
            <p><strong>Red social:</strong> <a href="${emp.Enlace}" target="_blank">${emp.Enlace}</a></p>
            <p><strong>Producto:</strong> ${emp.Producto.Nombre} ($${emp.Producto.Precio})</p>
            <p><strong>Descripción del producto:</strong> ${emp.Producto.Descripcion}</p>
            <img src="${emp.Producto.Imagen}" alt="Imagen del producto" >
          </div>
        `;
      });
    }

  });

  contenedor.innerHTML = html;
}


document.addEventListener('DOMContentLoaded', () => {
  cargarDatosDelStorage();
  cargarElementos();

  document.getElementById('formulario-principal').addEventListener('submit', registrarEvento);
  document.getElementById('formulario-emprendimientos').addEventListener('submit', registrarEmprendimiento);
});
