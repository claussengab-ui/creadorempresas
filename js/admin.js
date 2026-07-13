// ============================================================
// GABIEMPRESAS — admin.js (versión Supabase)
// Panel privado: solo funciona si el usuario inició sesión.
// Las políticas de RLS en Supabase exigen estar autenticado
// para leer, actualizar o borrar la tabla "clientes".
// ============================================================

let clientesCache = [];
let filtroActual = 'todos';

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  formalizada: 'Formalizada'
};

// ---------- AUTH ----------
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.style.display = 'none';

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if(error){
    console.error(error);
    errorEl.textContent = 'Correo o clave incorrectos.';
    errorEl.style.display = 'block';
  }else{
    mostrarDashboard();
  }
});

document.getElementById('btnLogout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  document.getElementById('loginView').style.display = 'block';
  document.getElementById('dashView').style.display = 'none';
});

async function verificarSesion(){
  const { data } = await supabase.auth.getSession();
  if(data.session){
    mostrarDashboard();
  }else{
    document.getElementById('loginView').style.display = 'block';
    document.getElementById('dashView').style.display = 'none';
  }
}

function mostrarDashboard(){
  document.getElementById('loginView').style.display = 'none';
  document.getElementById('dashView').style.display = 'block';
  cargarClientes();
  suscribirCambios();
}

verificarSesion();

// ---------- DATA ----------
async function cargarClientes(){
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('fecha_ingreso', { ascending: false });

  if(error){
    console.error(error);
    document.getElementById('tableBody').innerHTML =
      `<tr class="empty-row"><td colspan="7">No se pudieron cargar los datos. Revisa las políticas de RLS en Supabase.</td></tr>`;
    return;
  }
  clientesCache = data || [];
  renderStats();
  renderTabla();
}

function suscribirCambios(){
  supabase
    .channel('clientes-cambios')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'clientes' }, () => {
      cargarClientes();
    })
    .subscribe();
}

function renderStats(){
  document.getElementById('statTotal').textContent = clientesCache.length;
  document.getElementById('statPendiente').textContent = clientesCache.filter(c => c.estado === 'pendiente').length;
  document.getElementById('statProceso').textContent = clientesCache.filter(c => c.estado === 'en_proceso').length;
  document.getElementById('statFormalizada').textContent = clientesCache.filter(c => c.estado === 'formalizada').length;
}

function formatCLP(n){
  return '$' + Number(n || 0).toLocaleString('es-CL');
}

function formatFecha(ts){
  if(!ts) return '—';
  return new Date(ts).toLocaleDateString('es-CL', { day:'2-digit', month:'2-digit', year:'numeric' });
}

function coincideBusqueda(c, term){
  if(!term) return true;
  term = term.toLowerCase();
  const enEmpresa = (c.empresa?.nombre || '').toLowerCase().includes(term);
  const enFolio = (c.folio || '').toLowerCase().includes(term);
  const enSocios = (c.socios || []).some(s => (s.nombre || '').toLowerCase().includes(term) || (s.rut || '').toLowerCase().includes(term));
  return enEmpresa || enFolio || enSocios;
}

function renderTabla(){
  const tbody = document.getElementById('tableBody');
  const term = document.getElementById('searchBox').value.trim();

  const filtrados = clientesCache.filter(c => {
    const pasaFiltro = filtroActual === 'todos' || c.estado === filtroActual;
    return pasaFiltro && coincideBusqueda(c, term);
  });

  if(filtrados.length === 0){
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">Sin resultados. Cuando un cliente llene el formulario, aparecerá aquí.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtrados.map(c => `
    <tr class="row-clickable" data-id="${c.id}">
      <td class="folio-cell">${c.folio || '—'}</td>
      <td><strong>${c.empresa?.nombre || '—'}</strong></td>
      <td>${c.empresa?.tipoSociedad || '—'}</td>
      <td>${(c.socios || []).length}</td>
      <td>${formatCLP(c.empresa?.capitalMonto)}</td>
      <td>${formatFecha(c.fecha_ingreso)}</td>
      <td><span class="badge ${c.estado}">${ESTADO_LABEL[c.estado] || c.estado}</span></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('tr[data-id]').forEach(row => {
    row.addEventListener('click', () => abrirModal(row.dataset.id));
  });
}

// ---------- FILTROS Y BUSQUEDA ----------
document.querySelectorAll('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filtroActual = chip.dataset.filter;
    renderTabla();
  });
});

document.getElementById('searchBox').addEventListener('input', renderTabla);

// ---------- MODAL DETALLE ----------
let clienteAbiertoId = null;

function abrirModal(id){
  const c = clientesCache.find(x => x.id === id);
  if(!c) return;
  clienteAbiertoId = id;

  document.getElementById('modalTitle').textContent = c.empresa?.nombre || 'Sin nombre';
  document.getElementById('modalFolio').textContent = `Folio ${c.folio || '—'} · ${formatFecha(c.fecha_ingreso)}`;
  document.getElementById('estadoSelect').value = c.estado || 'pendiente';

  const e = c.empresa || {};
  const sociosHtml = (c.socios || []).map((s) => `
    <div class="socio-card">
      <div class="kv-grid">
        <div class="kv"><b>Nombre</b>${s.nombre || '—'}</div>
        <div class="kv"><b>RUT</b>${s.rut || '—'}</div>
        <div class="kv"><b>Nacionalidad</b>${s.nacionalidad || '—'}</div>
        <div class="kv"><b>Estado civil</b>${s.estadoCivil || '—'}</div>
        <div class="kv"><b>Domicilio</b>${s.domicilio || '—'}</div>
        <div class="kv"><b>Contacto</b>${s.email || '—'} · ${s.telefono || '—'}</div>
        <div class="kv"><b>Participación</b>${s.participacion || 0}%</div>
      </div>
    </div>
  `).join('');

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-section">
      <h4>Empresa</h4>
      <div class="kv-grid">
        <div class="kv"><b>Tipo de sociedad</b>${e.tipoSociedad || '—'}</div>
        <div class="kv"><b>Nombre de fantasía</b>${e.nombreFantasia || '—'}</div>
        <div class="kv"><b>Giro</b>${e.giro || '—'}</div>
        <div class="kv"><b>Domicilio tributario</b>${e.domicilio || '—'}</div>
        <div class="kv"><b>Capital inicial</b>${formatCLP(e.capitalMonto)}</div>
        <div class="kv"><b>Forma de aporte</b>${e.capitalForma || '—'}</div>
        <div class="kv"><b>Plazo de duración</b>${e.plazoDuracion || '—'}</div>
        <div class="kv"><b>¿Tendrá trabajadores?</b>${e.tieneTrabajadores || '—'}</div>
        <div class="kv"><b>Régimen tributario preferido</b>${e.regimenTributario || '—'}</div>
      </div>
    </div>
    <div class="modal-section">
      <h4>Socios (${(c.socios || []).length})</h4>
      ${sociosHtml || '<p>Sin socios registrados.</p>'}
    </div>
    <div class="modal-section">
      <h4>Contacto</h4>
      <div class="kv-grid">
        <div class="kv"><b>Correo</b>${c.contacto?.email || '—'}</div>
        <div class="kv"><b>Teléfono</b>${c.contacto?.telefono || '—'}</div>
        <div class="kv field--full"><b>Comentarios</b>${c.contacto?.comentarios || '—'}</div>
      </div>
    </div>
  `;

  document.getElementById('modalBackdrop').classList.add('open');
}

document.getElementById('modalClose').addEventListener('click', cerrarModal);
document.getElementById('modalBackdrop').addEventListener('click', (e) => {
  if(e.target.id === 'modalBackdrop') cerrarModal();
});
function cerrarModal(){
  document.getElementById('modalBackdrop').classList.remove('open');
  clienteAbiertoId = null;
}

document.getElementById('btnGuardarEstado').addEventListener('click', async () => {
  if(!clienteAbiertoId) return;
  const nuevoEstado = document.getElementById('estadoSelect').value;
  const { error } = await supabase.from('clientes').update({ estado: nuevoEstado }).eq('id', clienteAbiertoId);
  if(error){
    console.error(error);
    alert('No se pudo guardar el estado.');
  }else{
    cerrarModal();
  }
});

// ---------- EXPORT CSV ----------
document.getElementById('btnExport').addEventListener('click', () => {
  if(clientesCache.length === 0) return;

  const headers = [
    'Folio','Fecha','Estado','Empresa','Nombre fantasia','Tipo sociedad','Giro','Domicilio',
    'Capital','Forma aporte','Plazo','Trabajadores','Regimen tributario',
    'Socio nombre','Socio RUT','Socio nacionalidad','Socio estado civil','Socio domicilio',
    'Socio email','Socio telefono','Socio participacion',
    'Contacto email','Contacto telefono','Comentarios'
  ];

  const rows = [];
  clientesCache.forEach(c => {
    const e = c.empresa || {};
    const socios = c.socios && c.socios.length ? c.socios : [{}];
    socios.forEach(s => {
      rows.push([
        c.folio, formatFecha(c.fecha_ingreso), ESTADO_LABEL[c.estado] || c.estado,
        e.nombre, e.nombreFantasia, e.tipoSociedad, e.giro, e.domicilio,
        e.capitalMonto, e.capitalForma, e.plazoDuracion, e.tieneTrabajadores, e.regimenTributario,
        s.nombre, s.rut, s.nacionalidad, s.estadoCivil, s.domicilio, s.email, s.telefono, s.participacion,
        c.contacto?.email, c.contacto?.telefono, c.contacto?.comentarios
      ]);
    });
  });

  const csvContent = [headers, ...rows]
    .map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gabiempresas_clientes_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});
