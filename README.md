# Supercito (Market MA)

Aplicación web para gestionar productos, departamentos, asignaciones producto-departamento y precios por departamento.

Está construida con `React + Vite` y usa `Supabase` como backend (base de datos y API).

## Funcionalidades

- Listado de productos
- Alta y baja de productos
- Exportación de productos a `.txt` (formato CSV)
- Listado de departamentos
- Alta y baja de departamentos
- Exportación de departamentos a `.txt` (formato CSV)
- Asignación de productos a departamentos
- Eliminación de asignaciones
- Gestión de precios por asignación (`producto + departamento`)

## Tecnologías

- `React 19`
- `Vite`
- `React Router`
- `Supabase JS`
- `Material UI` + `Material Tailwind`
- `Tailwind CSS`
- `ESLint`

## Requisitos

- `Node.js` (recomendado: versión LTS reciente, idealmente `20+`)
- `npm`

## Instalación y ejecución local

1. Instala dependencias:

```bash
npm install
```

2. Crea un archivo `.env.local` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_SUPABASE_ANON_KEY
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

4. Abre la URL que muestra Vite (normalmente `http://localhost:5173`).

## Scripts disponibles

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run preview`: vista previa del build
- `npm run lint`: análisis estático con ESLint

## Rutas principales

- `/app`: inicio
- `/app/productos`: gestión de productos
- `/app/departamentos`: gestión de departamentos
- `/app/asignar`: asignar productos a departamentos
- `/app/precios`: asignar/editar precios por relación

## Estructura de datos esperada (Supabase)

La app espera estas tablas y columnas (nombres exactos):

### `productos`

- `id_clave` (entero, identificador del producto)
- `nombre` (texto)
- `proveedor` (texto)

### `departamentos`

- `claveDepto` (texto, identificador del departamento)
- `nombre` (texto)
- `responsable` (texto)

### `productos_departamentos`

- `id_clave` (entero, referencia a `productos.id_clave`)
- `claveDepto` (texto, referencia a `departamentos.claveDepto`)
- `precio` (numérico, opcional al inicio pero requerido para el módulo de precios)

## SQL base sugerido (opcional)

Si aún no tienes el esquema, puedes crear una versión mínima en Supabase con algo como esto:

```sql
create table if not exists public.productos (
  id_clave integer primary key,
  nombre text not null,
  proveedor text not null
);

create table if not exists public.departamentos (
  "claveDepto" text primary key,
  nombre text not null,
  responsable text not null
);

create table if not exists public.productos_departamentos (
  id_clave integer not null references public.productos(id_clave) on delete cascade,
  "claveDepto" text not null references public.departamentos("claveDepto") on delete cascade,
  precio numeric(10,2),
  primary key (id_clave, "claveDepto")
);
```

## Estructura del proyecto

- `src/pages/`: pantallas principales (`Productos`, `Departamentos`, `AsignarProducto`, `Precios`, `Principal`)
- `src/components/`: componentes UI por módulo
- `src/routes/AppRoutes.jsx`: layout y navegación lateral
- `src/lib/supabaseClient.js`: cliente de Supabase
- `src/utils/downloadTxt.js`: exportación de datos a `.txt` (CSV)

## Despliegue

El proyecto es compatible con despliegue estático (por ejemplo, Vercel):

```bash
npm run build
```

El resultado se genera en `dist/`.

## Problemas comunes

- Error `42P01`: falta la tabla `productos_departamentos`
- Error `42703`: falta la columna `precio` en `productos_departamentos`
- Pantalla sin datos: revisa variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`

## Notas

- No subas credenciales reales al repositorio.
- La app usa nombres de columnas específicos (incluyendo `claveDepto` con mayúsculas); respétalos en Supabase.
