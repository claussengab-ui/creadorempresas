// ============================================================
// GABIEMPRESAS — form.js
// Maneja el formulario público que llenan los clientes.
// ============================================================

let socioCount = 0;

function crearSocioBlock(n){
  const div = document.createElement('div');
  div.className = 'socio-block';
  div.dataset.socioIndex = n;
  div.innerHTML = `
    <div class="socio-block-head">
      <h3>Socio ${n}</h3>
      ${n > 1 ? '<button type="button" class="btn-remove">Eliminar</button>' : ''}
    </div>
    <div class="field-grid">
      <div class="field">
        <label>Nombre completo</label>
        <input type="text" name="socio_nombre" required placeholder="Nombre y apellidos">
      </div>
      <div class="field">
        <label>RUT / cédula extranjero</label>
        <input type="text" name="socio_rut" required placeholder="12.345.678-9">
      </div>
      <div class="field">
        <label>Nacionalidad</label>
        <input type="text" name="socio_nacionalidad" required placeholder="Chilena">
      </div>
      <div class="field">
        <label>Estado civil</label>
        <select name="socio_estadoCivil" required>
          <option value="">Selecciona…</option>
          <option value="soltero">Soltero/a</option>
          <option value="casado_sc">Casado/a — soc. conyugal</option>
          <option value="casado_sep">Casado/a — separación de bienes</option>
          <option value="casado_part">Casado/a — participación en gananciales</option>
          <option value="divorciado">Divorciado/a</option>
          <option value="viudo">Viudo/a</option>
          <option value="union_civil">Unión civil (AUC)</option>
        </select>
      </div>
      <div class="field field--full">
        <label>Domicilio personal</label>
        <input type="text" name="socio_domicilio" required placeholder="Calle, número, comuna, ciudad">
      </div>
      <div class="field">
        <label>Correo</label>
        <input type="email" name="socio_email" required placeholder="correo@ejemplo.com">
      </div>
      <div class="field">
        <label>Teléfono</label>
        <input type="tel" name="socio_telefono" required placeholder="+56 9 1234 5678">
      </div>
      <div class="field field--full">
        <label>% de participación en la sociedad</label>
        <input type="number" name="socio_participacion" min="0" max="100" step="0.01" required placeholder="Ej: 50">
      </div>
    </div>
  `;
  const btnRemove = div.querySelector('.btn-remove');
  if(btnRemove){
    btnRemove.addEventListener('click', () => {
      div.remove();
      renumerarSocios();
    });
  }
  return div;
}

function renumerarSocios(){
  const blocks = document.querySelectorAll('.socio-block');
  blocks.forEach((b, i) => {
    b.querySelector('h3').textContent = `Socio ${i + 1}`;
  });
  socioCount = blocks.length;
}

function agregarSocio(){
  socioCount++;
  const block = crearSocioBlock(socioCount);
  document.getElementById('sociosContainer').appendChild(block);
}

function generarFolio(){
  const now = new Date();
  const y = now.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `GE-${y}-${rand}`;
}

function recolectarDatos(form, folio){
  const fd = new FormData(form);

  const empresa = {
    nombre: fd.get('nombreEmpresa') || '',
    giro: fd.get('giro') || '',
    yaEjerce: fd.get('yaEjerce') || '',
    desdeCuando: fd.get('desdeCuando') || '',
    domicilio: fd.get('domicilio') || '',
    tenenciaDomicilio: fd.get('tenenciaDomicilio') || '',
    capitalMonto: Number(fd.get('capitalMonto') || 0),
    capitalForma: fd.get('capitalForma') || '',
    plazoDuracion: fd.get('plazoDuracion') || '',
    tieneTrabajadores: fd.get('tieneTrabajadores') || '',
    representanteLegal: fd.get('representanteLegal') || '',
    representanteLegalRut: fd.get('representanteLegalRut') || ''
  };

  const nombres = fd.getAll('socio_nombre');
  const ruts = fd.getAll('socio_rut');
  const nacionalidades = fd.getAll('socio_nacionalidad');
  const estadosCiviles = fd.getAll('socio_estadoCivil');
  const domicilios = fd.getAll('socio_domicilio');
  const emails = fd.getAll('socio_email');
  const telefonos = fd.getAll('socio_telefono');
  const participaciones = fd.getAll('socio_participacion');

  const socios = nombres.map((_, i) => ({
    nombre: nombres[i] || '',
    rut: ruts[i] || '',
    nacionalidad: nacionalidades[i] || '',
    estadoCivil: estadosCiviles[i] || '',
    domicilio: domicilios[i] || '',
    email: emails[i] || '',
    telefono: telefonos[i] || '',
    participacion: Number(participaciones[i] || 0)
  }));

  const contacto = {
    email: fd.get('contactoEmail') || '',
    telefono: fd.get('contactoTelefono') || '',
    comentarios: fd.get('comentarios') || ''
  };

  return {
    folio,
    estado: 'pendiente',
    empresa,
    socios,
    contacto
  };
}

document.addEventListener('DOMContentLoaded', () => {
  agregarSocio(); // primer socio por defecto

  document.getElementById('btnAddSocio').addEventListener('click', agregarSocio);

  // chips visuales: tenencia del domicilio
  document.querySelectorAll('#tenenciaRow .radio-chip').forEach(chip => {
    const input = chip.querySelector('input');
    input.addEventListener('change', () => {
      document.querySelectorAll('#tenenciaRow .radio-chip').forEach(c => c.classList.remove('checked'));
      chip.classList.add('checked');
    });
  });

  // chips visuales + mostrar/ocultar "desde cuándo"
  document.querySelectorAll('#yaEjerceRow .radio-chip').forEach(chip => {
    const input = chip.querySelector('input');
    input.addEventListener('change', () => {
      document.querySelectorAll('#yaEjerceRow .radio-chip').forEach(c => c.classList.remove('checked'));
      chip.classList.add('checked');
      document.getElementById('desdeCuandoField').style.display = input.value === 'si' ? 'block' : 'none';
    });
  });

  const form = document.getElementById('clienteForm');
  const btnSubmit = document.getElementById('btnSubmit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Enviando…';

    const folio = generarFolio();
    const data = recolectarDatos(form, folio);

    try{
      const { error } = await supabase.from('clientes').insert([data]);
      if(error) throw error;
      document.getElementById('heroBlock').style.display = 'none';
      form.style.display = 'none';
      document.getElementById('confirmBlock').style.display = 'block';
      document.getElementById('confirmFolio').textContent = `Tu folio: ${folio}`;
      document.getElementById('folioDisplay').textContent = folio;
    }catch(err){
      console.error(err);
      alert('No pudimos enviar tus datos.\n\nDetalle técnico: ' + (err?.message || JSON.stringify(err)));
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Enviar datos';
    }
  });
});
