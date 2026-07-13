-- ============================================================
-- GABIEMPRESAS — Supabase: crear tabla y reglas de seguridad
-- Copia y pega TODO este archivo en Supabase > SQL Editor > New query
-- y clic en "Run".
-- ============================================================

create table clientes (
  id uuid primary key default gen_random_uuid(),
  folio text,
  fecha_ingreso timestamptz default now(),
  estado text default 'pendiente',
  empresa jsonb,
  socios jsonb,
  contacto jsonb
);

-- Activar seguridad a nivel de fila (RLS)
alter table clientes enable row level security;

-- Cualquiera puede INSERTAR (para que el formulario público funcione)
create policy "cualquiera_puede_crear"
on clientes for insert
to anon
with check (true);

-- Solo usuarios autenticados (tú, con tu login) pueden LEER
create policy "solo_autenticados_leen"
on clientes for select
to authenticated
using (true);

-- Solo usuarios autenticados pueden ACTUALIZAR (cambiar estado)
create policy "solo_autenticados_actualizan"
on clientes for update
to authenticated
using (true);

-- Solo usuarios autenticados pueden BORRAR
create policy "solo_autenticados_borran"
on clientes for delete
to authenticated
using (true);
