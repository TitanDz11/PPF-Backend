# PPF Backend - API de Gestión Vehicular

API RESTful desarrollada con Node.js y Express para la gestión de vehículos y registro de entradas/salidas de una flota vehicular.

## Descripción

Este backend proporciona los endpoints necesarios para:
- CRUD completo de vehículos (marca, modelo, placa)
- Registro de entradas y salidas de vehículos
- Filtrado avanzado por fecha, vehículo y motorista
- Validación de datos en múltiples capas
- Conexión segura a base de datos MySQL

## Stack Tecnológico

### Tecnologías Principales
- **Node.js** >= 20.0.0 - Entorno de ejecución
- **Express.js** 4.21.2 - Framework web
- **MySQL 8.0** - Base de datos relacional

### Dependencias Clave
- `express-validator` 7.2.0 - Validación de datos
- `mysql2` 3.11.5 - Driver de MySQL
- `cors` 2.8.5 - Middleware CORS
- `helmet` 8.0.0 - Seguridad HTTP
- `express-rate-limit` 7.4.1 - Limitación de peticiones
- `dotenv` 16.4.5 - Variables de entorno
- `morgan` 1.10.0 - Logging de peticiones

### Desarrollo
- `nodemon` 3.1.9 - Auto-reinicio en desarrollo

## Instalación

### Requisitos Previos
- Node.js >= 20.x instalado
- MySQL 8.0 o superior
- Docker (opcional, para contenedor de MySQL)
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio-backend>
cd PPF-Backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales reales
```

4. **Configurar base de datos**

**Opción A: Usando Docker (Recomendado)**
```bash
docker-compose up -d mysql
# Esperar ~30 segundos a que MySQL esté listo
```

**Opción B: MySQL Local**
- Crear base de datos manualmente:
```sql
CREATE DATABASE ppf_db;
CREATE USER 'ppf_user'@'localhost' IDENTIFIED BY 'ppf_password';
GRANT ALL PRIVILEGES ON ppf_db.* TO 'ppf_user'@'localhost';
FLUSH PRIVILEGES;
```

5. **Las migraciones se ejecutan automáticamente** al iniciar la aplicación por primera vez.

## Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración del Servidor
PORT=4000
NODE_ENV=development

# Configuración de la Base de Datos
DB_HOST=localhost
DB_PORT=3307
DB_USER=ppf_user
DB_PASSWORD=ppf_password
DB_NAME=ppf_db

# Configuración CORS
CORS_ORIGIN=http://localhost:3000

# Limitación de Peticiones (Rate Limiting)
RATE_LIMIT_WINDOW_MS=900000    # 15 minutos
RATE_LIMIT_MAX=1000            # Máximo de peticiones por ventana
```

### Descripción de Variables

| Variable | Descripción | Valor por Defecto | Requerida |
|----------|-------------|-------------------|-----------|
| `PORT` | Puerto del servidor | `4000` | No |
| `NODE_ENV` | Entorno (development/production) | `development` | No |
| `DB_HOST` | Host de la base de datos | - | **Sí** |
| `DB_PORT` | Puerto de MySQL | `3307` | No |
| `DB_USER` | Usuario de MySQL | - | **Sí** |
| `DB_PASSWORD` | Contraseña de MySQL | - | **Sí** |
| `DB_NAME` | Nombre de la base de datos | `ppf_db` | No |
| `CORS_ORIGIN` | URL permitida para CORS | `http://localhost:3000` | No |
| `RATE_LIMIT_WINDOW_MS` | Ventana de tiempo en ms | `900000` | No |
| `RATE_LIMIT_MAX` | Máximo de peticiones | `1000` | No |

## Base de Datos

### Esquema

#### Tabla: `vehicles`
```sql
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  placa VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabla: `entries`
```sql
CREATE TABLE entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  motorista VARCHAR(150) NOT NULL,
  tipo ENUM('entrada', 'salida') NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  kilometraje INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);
```

### Migraciones

Las migraciones se ejecutan **automáticamente** al iniciar la aplicación. No es necesario ejecutar comandos adicionales.

**Ubicación:** `src/db/migrations.js`

## Ejecución

### Modo Desarrollo (con auto-reinicio)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

El servidor estará disponible en: `http://localhost:4000`

## Endpoints de la API

### Base URL
```
http://localhost:4000/api
```

---

### Vehículos

#### Obtener todos los vehículos
```http
GET /api/vehicles
```

**Parámetros de Query Opcionales:**
- `page` - Número de página (default: 1)
- `limit` - Límite por página (default: 10, max: 100)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "marca": "Toyota",
      "modelo": "Corolla",
      "placa": "ABC-123",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### Obtener vehículo por ID
```http
GET /api/vehicles/:id
```

**Parámetros:**
- `id` (path) - ID del vehículo

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "marca": "Toyota",
    "modelo": "Corolla",
    "placa": "ABC-123",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Crear nuevo vehículo
```http
POST /api/vehicles
Content-Type: application/json

{
  "marca": "Toyota",
  "modelo": "Corolla",
  "placa": "ABC-123"
}
```

**Validaciones:**
- `marca`: Requerida, solo letras y espacios, máx 100 caracteres
- `modelo`: Requerido, máx 100 caracteres
- `placa`: Requerida, letras/números/guiones, máx 20 caracteres

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "marca": "Toyota",
    "modelo": "Corolla",
    "placa": "ABC-123",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "Vehículo creado exitosamente"
}
```

#### Actualizar vehículo
```http
PUT /api/vehicles/:id
Content-Type: application/json

{
  "marca": "Nissan",
  "modelo": "Sentra",
  "placa": "XYZ-789"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "marca": "Nissan",
    "modelo": "Sentra",
    "placa": "XYZ-789",
    "updated_at": "2024-01-16T14:20:00.000Z"
  },
  "message": "Vehículo actualizado exitosamente"
}
```

#### Eliminar vehículo
```http
DELETE /api/vehicles/:id
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Vehículo eliminado exitosamente"
}
```

---

### Entradas/Salidas

#### Obtener todas las entradas/salidas
```http
GET /api/entries
```

**Parámetros de Query Opcionales:**
- `fecha` - Filtrar por fecha (YYYY-MM-DD)
- `vehicle_id` - Filtrar por vehículo
- `motorista` - Filtrar por nombre del motorista
- `page` - Número de página
- `limit` - Límite por página

**Ejemplo con filtros:**
```http
GET /api/entries?fecha=2024-01-15&vehicle_id=1
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "placa": "ABC-123",
      "marca": "Toyota",
      "modelo": "Corolla",
      "motorista": "Juan Pérez",
      "tipo": "entrada",
      "fecha": "2024-01-15",
      "hora": "08:30:00",
      "kilometraje": 15000,
      "created_at": "2024-01-15T08:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Obtener entrada/salida por ID
```http
GET /api/entries/:id
```

#### Crear nueva entrada/salida
```http
POST /api/entries
Content-Type: application/json

{
  "vehicle_id": 1,
  "motorista": "Juan Pérez",
  "tipo": "entrada",
  "fecha": "2024-01-15",
  "hora": "08:30:00",
  "kilometraje": 15000
}
```

**Validaciones:**
- `vehicle_id`: Entero positivo requerido
- `motorista`: Requerido, solo letras/espacios/guiones/apóstrofes, máx 150 caracteres
- `tipo`: Requerido, debe ser "entrada" o "salida"
- `fecha`: Requerida, formato YYYY-MM-DD
- `hora`: Requerida, formato HH:MM o HH:MM:SS
- `kilometraje`: Entero positivo requerido

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "vehicle_id": 1,
    "motorista": "Juan Pérez",
    "tipo": "entrada",
    "fecha": "2024-01-15",
    "hora": "08:30:00",
    "kilometraje": 15000
  },
  "message": "Entrada registrada exitosamente"
}
```

#### Actualizar entrada/salida
```http
PUT /api/entries/:id
```

#### Eliminar entrada/salida
```http
DELETE /api/entries/:id
```

---

## Códigos de Error

### Errores Comunes

**400 Bad Request**
```json
{
  "success": false,
  "errors": [
    {
      "field": "marca",
      "message": "La marca es requerida."
    }
  ]
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": "Vehículo no encontrado."
}
```

**429 Too Many Requests**
```json
{
  "status": 429,
  "error": "Too many requests, please try again later."
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": "Error interno del servidor."
}
```

---

## Seguridad

### Rate Limiting
- **Ventana:** 15 minutos (900,000 ms)
- **Máximo:** 1000 peticiones por ventana
- Configurable vía variables de entorno

### CORS
- Solo permite peticiones desde el origen configurado
- Por defecto: `http://localhost:3000`

### Helmet
- Headers de seguridad HTTP implementados
- Protección contra vulnerabilidades comunes

### Validación de Datos
- Todos los inputs son validados con `express-validator`
- Sanitización automática de datos
- Mensajes de error descriptivos

---

## Docker

### Levantar solo MySQL
```bash
docker-compose up -d mysql
```

### Levantar todo el stack
```bash
docker-compose up -d
```

Esto iniciará:
- MySQL en puerto 3307
- Backend en puerto 4000
- Frontend en puerto 3000

### Detener servicios
```bash
docker-compose down
```

### Ver logs
```bash
docker-compose logs -f
```

---

## Pruebas

Las pruebas se pueden ejecutar con:
```bash
npm test
```

*(Nota: Las pruebas están en desarrollo)*

---

## Estructura del Proyecto

```
PPF-Backend/
├── src/
│   ├── config/
│   │   └── env.js                 # Configuración de variables
│   ├── db/
│   │   ├── connection.js          # Conexión a MySQL
│   │   └── migrations.js          # Migraciones automáticas
│   ├── middleware/
│   │   ├── errorHandler.js        # Manejo de errores global
│   │   ├── rateLimiter.js         # Rate limiting
│   │   ├── security.js            # Security headers
│   │   └── validate.js            # Middleware de validación
│   ├── modules/
│   │   ├── entries/
│   │   │   ├── entry.controller.js
│   │   │   ├── entry.routes.js
│   │   │   ├── entry.service.js
│   │   │   └── entry.validator.js
│   │   └── vehicles/
│   │       ├── vehicle.controller.js
│   │       ├── vehicle.routes.js
│   │       ├── vehicle.service.js
│   │       └── vehicle.validator.js
│   └── app.js                     # Configuración de Express
├── .env                           # Variables de entorno
├── .env.example                   # Ejemplo de variables
├── docker-compose.yml             # Orquestación Docker
├── Dockerfile                     # Imagen Docker
├── package.json                   # Dependencias
└── server.js                      # Punto de entrada
```

---

## Despliegue

### Render.com

1. Crear cuenta en [Render](https://render.com)
2. Crear nuevo Web Service
3. Conectar repositorio de GitHub
4. Configurar variables de entorno
5. Usar base de datos MySQL de Railway o PlanetScale
6. Deploy automático

**Variables de Entorno para Producción:**
```env
NODE_ENV=production
PORT=4000
DB_HOST=<host-de-tu-db>
DB_PORT=3306
DB_USER=<usuario>
DB_PASSWORD=<contraseña>
DB_NAME=ppf_db
CORS_ORIGIN=https://tu-frontend.vercel.app
```

## Solución de Problemas

### Error: "Cannot connect to database"

**Causas posibles:**
- MySQL no está corriendo
- Credenciales incorrectas
- Puerto incorrecto

**Solución:**
```bash
# Verificar si MySQL está corriendo
docker ps | grep mysql

# Reiniciar MySQL
docker-compose restart mysql

# Verificar logs
docker-compose logs mysql
```

### Error: "EADDRINUSE: address already in use"

**Causa:** El puerto 4000 ya está en uso

**Solución:**
```bash
# Matar proceso en puerto 4000
lsof -ti:4000 | xargs kill -9

# O cambiar el puerto en .env
PORT=4001
```

### Error: "CORS policy blocked"

**Causa:** El frontend está en un origen diferente

**Solución:**
- Actualizar `CORS_ORIGIN` en `.env` del backend
- Reiniciar el servidor

### Error: "Migration failed"

**Solución:**
```bash
# Eliminar base de datos y reiniciar
docker-compose down
docker volume rm ppf_mysql_data
docker-compose up -d mysql
# Reiniciar backend
```

---


## Desarrollado por Ethan Diaz

Desarrollado para la prueba técnica de desarrollo web full-stack.

**Tecnologías:** Node.js, Express, MySQL, PrimeReact, React, Vite, Docker

**Año:** 2026
