# MovieApp - Catálogo de Películas

Una aplicación moderna para gestionar tu colección personal de películas con búsqueda en tiempo real, autenticación segura y almacenamiento en la nube.

## Arquitectura de Alto Nivel

### Stack Tecnológico

- **Frontend**: React 18 con TypeScript y Vite
- **Estilos**: Tailwind CSS
- **Autenticación**: Clerk
- **Backend y Base de Datos**: Convex
- **API Externa**: OMDb API

### Diagrama de Flujo
Usuario → React Frontend → Clerk (Autenticación) → Convex (Backend/DB) → OMDb API

text

### Características Principales

- 🔐 Autenticación segura con Clerk
- 🔍 Búsqueda de películas en tiempo real con OMDb API
- 🗄️ Almacenamiento en la nube con Convex
- 📱 Diseño responsivo con Tailwind CSS
- ⚡ Desarrollo rápido con Vite

## Prerrequisitos

- Node.js 18 o superior
- npm 9 o superior (o yarn/pnpm)
- Cuentas en los siguientes servicios (todos gratuitos):
  - [Clerk](https://clerk.com/)
  - [Convex](https://convex.dev/)
  - [OMDb API](http://www.omdbapi.com/apikey.aspx)

## Configuración del Proyecto

### 1. Clonar el repositorio

```bash
git clone <https://github.com/JulianMediina/RETO-BOLIVAR.git>
cd movie-app
```

### 2. Instalar dependencias

```bash
npm install
```


### 3. Iniciar la aplicación

En la terminal principal, ejecuta:

```bash
npm run dev
```

## Estructura del Proyecto

text

```
movie-app/
├── public/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Páginas de la aplicación
│   ├── services/        # Servicios (OMDb API)
│   ├── types/           # Tipos TypeScript
│   ├── convex/          # Backend Convex
│   │   ├── schema.ts    # Esquema de la base de datos
│   │   ├── movies.ts    # Funciones de Convex para películas
│   │   └── _generated/  # Código generado por Convex
│   ├── App.tsx          # Componente principal
│   └── main.tsx         # Punto de entrada
├── .env.local           # Variables de entorno (no versionado)
├── package.json
├── vite.config.ts
└── README.md
```

## Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo  
- `npm run build` - Construye la aplicación para producción  
