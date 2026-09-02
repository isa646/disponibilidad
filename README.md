# Disponibilidad de agentes (GHL)

Aplicación genérica para gestionar la disponibilidad de un equipo y asignar conversaciones con round-robin justo. Se integra con GoHighLevel (GHL) vía iFrame y workflow.

Un deploy (Vercel + KV + variables de entorno) por cliente. El código no incluye datos de ningún cliente concreto.

## Requisitos

- Node.js 18+
- Cuenta en Vercel con un store KV (Redis) configurado
- Subcuenta de GoHighLevel (Location ID)

## Configuración local

1. Copie `.env.example` a `.env.local` y complete las variables:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Descripción |
   |----------|-------------|
   | `KV_URL` | URL de conexión KV (Vercel la provee al crear el store) |
   | `KV_REST_API_URL` | URL REST de Upstash/Vercel KV |
   | `KV_REST_API_TOKEN` | Token de escritura |
   | `KV_REST_API_READ_ONLY_TOKEN` | Token de solo lectura |
   | `KV_PREFIX` | Prefijo de claves Redis si varios clientes comparten el mismo KV |
   | `GHL_API_KEY` | Clave secreta para `/api/siguiente-agente` |
   | `GHL_LOCATION_ID` | ID de la subcuenta de GHL |
   | `ADMIN_PASSWORD` | Contraseña para la vista `/admin` |
   | `AGENTES_JSON` | Array JSON de agentes: `id`, `nombre`, `email` (una sola línea) |
   | `ADMINS_JSON` | Array JSON de supervisores: `email`, `nombre` (una sola línea) |

   Ejemplo de `AGENTES_JSON`:

   ```json
   [{"id":"agente1","nombre":"Ana Pérez","email":"ana@cliente.com"}]
   ```

2. Instale dependencias y ejecute en desarrollo:

   ```bash
   npm install
   npm run dev
   ```

3. Ejecute los tests:

   ```bash
   npm test
   ```

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/toggle?agente=agente1` | Pantalla móvil para que cada agente marque su disponibilidad |
| `/toggle?email=` | Misma pantalla, identificando al agente por email |
| `/admin` | Vista de supervisor (protegida con `ADMIN_PASSWORD` o email de `ADMINS_JSON`) |
| `POST /api/toggle` | Actualiza disponibilidad de un agente |
| `GET /api/estado` | Estado de todos los agentes |
| `GET /api/siguiente-agente` | Round-robin para el workflow de GHL (header `x-api-key`) |

## Integración con GoHighLevel

### iFrame para agentes

```
https://su-dominio.vercel.app/toggle?agente=agente1
```

o por email:

```
https://su-dominio.vercel.app/toggle?email=ana@cliente.com
```

### Workflow para asignación

```
GET https://su-dominio.vercel.app/api/siguiente-agente
Header: x-api-key: <valor de GHL_API_KEY>
```

Respuesta cuando hay agente disponible:

```json
{ "agente": "agente1", "nombre": "Ana Pérez", "disponible": true }
```

Respuesta cuando ninguno está disponible:

```json
{ "agente": null, "disponible": false }
```

## Nuevo cliente (otro GHL)

1. Cree un proyecto Vercel apuntando a este repositorio (no reutilice el KV de otro cliente).
2. Vincule un store KV nuevo.
3. Configure todas las variables de `.env.example` con los datos de esa location: Location ID, agentes y admins.
4. En GHL, embeba `/toggle` y cree el workflow HTTP.

## Despliegue en Vercel

1. Conecte este repositorio a Vercel.
2. Cree o vincule un store KV en el proyecto.
3. Configure las variables de entorno en el dashboard de Vercel.
4. Despliegue:

   ```bash
   vercel deploy
   ```
