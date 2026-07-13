# Gabiempresas

App para recibir los datos de constitución de empresa de tus clientes y verlos en un panel privado, para luego formalizar la empresa en "Tu Empresa en un Día".

- `index.html` → formulario público, lo llenan tus clientes (compártelo como un link).
- `admin.html` → panel privado, solo tú entras con correo y clave.

No necesitas servidor propio: los datos se guardan en **Supabase** (gratis) y el sitio se aloja en **GitHub Pages** (gratis).

Ya tienes un proyecto de Supabase creado (`creadorempresas`), así que partimos desde ahí.

---

## Paso 1 — Crear la tabla en Supabase

1. En tu proyecto de Supabase, ve a **SQL Editor** (en la barra lateral izquierda).
2. Clic en **"New query"**.
3. Abre el archivo `supabase-setup.sql` de este proyecto, copia todo su contenido y pégalo en el editor.
4. Clic en **"Run"** (o Ctrl/Cmd + Enter).

Esto crea la tabla `clientes` y las reglas de seguridad: **cualquiera puede enviar el formulario**, pero **solo tú, con sesión iniciada, puedes ver, editar o borrar** los datos.

Puedes confirmar que se creó yendo a **Table Editor** — ahí debería aparecer la tabla `clientes`.

## Paso 2 — Activar el login por correo

1. En la barra lateral, ve a **Authentication**.
2. Ve a la pestaña **"Providers"** y confirma que **"Email"** esté habilitado (viene activado por defecto).
3. Ve a la pestaña **"Users"** y clic en **"Add user" > "Create new user"**.
4. Ingresa tu correo y una clave. Marca la opción de **"Auto Confirm User"** si aparece, para no tener que confirmar por correo.
5. Este será tu usuario para entrar al panel (`admin.html`).

> Tip: en **Authentication > Providers > Email**, revisa que "Confirm email" esté desactivado si quieres poder entrar de inmediato sin verificar tu correo.

## Paso 3 — Obtener tus claves de conexión

1. Ve a **Project Settings** (ícono de tuerca, abajo en la barra lateral) > **API**.
2. Copia el valor de **"Project URL"**.
3. Copia el valor de **"anon public"** (una clave larga, en la sección "Project API keys").
4. Abre el archivo `js/supabase-config.js` de este proyecto y reemplaza los valores de ejemplo:

```js
const SUPABASE_URL = "https://tu-proyecto.supabase.co";
const SUPABASE_ANON_KEY = "tu-clave-anon-larga-aqui";
```

> Nota sobre seguridad: la clave "anon" está diseñada para quedar visible en el código de sitios web — así funciona Supabase sin servidor propio. Lo que realmente protege tus datos son las **políticas de seguridad (RLS)** del Paso 1 y el **login** del Paso 2.

## Paso 4 — Subir el proyecto a GitHub

Si nunca has usado GitHub:

1. Ve a https://github.com y crea una cuenta si no tienes.
2. Clic en **"New repository"**. Nómbralo `gabiempresas`, déjalo **Public** (necesario para GitHub Pages gratis). No marques "Add a README". Clic en **"Create repository"**.
3. En tu computador, dentro de la carpeta `gabiempresas`, abre una terminal y ejecuta:

```bash
git init
git add .
git commit -m "Primera versión de Gabiempresas"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/gabiempresas.git
git push -u origin main
```

(Reemplaza `TU-USUARIO` por tu nombre de usuario de GitHub.)

## Paso 5 — Activar GitHub Pages

1. En tu repositorio en GitHub, ve a **Settings > Pages**.
2. En "Source", elige la rama **`main`** y la carpeta **`/ (root)`**. Guarda.
3. Espera 1-2 minutos. GitHub te dará un link como:

```
https://TU-USUARIO.github.io/gabiempresas/
```

- Ese link → tu formulario público, compártelo con clientes.
- `https://TU-USUARIO.github.io/gabiempresas/admin.html` → tu panel privado.

## Paso 6 — Probarlo

1. Abre el link del formulario, llena datos de prueba y envía.
2. Abre `admin.html`, entra con el correo y clave del Paso 2.
3. Deberías ver el registro de prueba en la tabla. Bórralo desde **Table Editor > clientes** en Supabase cuando termines de probar.

---

## Cómo se usa en el día a día

- Le envías el link del formulario a un cliente nuevo.
- El cliente lo llena desde su celular o computador.
- Tú entras a `admin.html`, revisas los datos, y marcas el estado (Pendiente → En proceso → Formalizada) mientras avanzas con la constitución en Tu Empresa en un Día y el inicio de actividades en el SII.
- Puedes exportar todo a CSV con el botón de la esquina superior derecha del panel.

## Actualizar la app más adelante

Si quieres pedirle a Claude que agregue o cambie algo, edita los archivos y vuelve a subirlos con:

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

GitHub Pages se actualiza solo, en 1-2 minutos.

## Nota sobre datos sensibles

Este formulario recolecta RUT, domicilios y datos societarios de tus clientes. Trátalos con el mismo cuidado que cualquier otro dato de cliente: no compartas tu clave del panel, y considera borrar de la tabla `clientes` los registros de empresas ya formalizadas si no necesitas conservarlos ahí permanentemente.
