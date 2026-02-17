☕ Cafecito Feliz POS — MVP

Sistema de Punto de Venta (POS) desarrollado como parte del proyecto Cafecito Feliz, enfocado en la implementación de un MVP funcional siguiendo un contrato de API definido y reglas claras de negocio.

El sistema permite:

Gestión de productos (CRUD)

Registro y búsqueda de clientes

Registro de ventas con cálculo automático de descuentos

Control de stock

Autenticación y autorización por roles (Admin / Vendedor)

🧱 Arquitectura

El proyecto está dividido en:

cafecito-pos/
│
├── backend/     → API REST
└── frontend/    → Aplicación Angular (SPA)


Backend: Node.js + Express

Base de datos: MongoDB

Frontend: Angular

Autenticación: Bearer Token

📋 Requisitos

Node.js 18+

npm 9+

Base de datos configurada (según tecnología elegida)

Puertos utilizados:

Backend: http://localhost:3001

Frontend: http://localhost:4200
 (Angular default)

⚙️ Instalación
1️⃣ Clonar repositorio
git clone <https://github.com/BrunoDunay/cafecito-pos>
cd cafecito-pos

2️⃣ Backend
cd backend
npm install
npm run dev


El servidor iniciará en:

http://localhost:3001

3️⃣ Frontend
cd frontend
npm install
ng serve -o


La aplicación abrirá automáticamente en:

http://localhost:4200

🔐 Variables de entorno

El backend utiliza un archivo .env con variables como:

PORT=3001
DB_CONNECTION_STRING=<tu_conexion>
JWT_SECRET=<tu_secret>


⚠️ El archivo .env no debe subirse al repositorio.

🎯 Alcance del MVP
Incluye
Ventas

-Listado y búsqueda de productos

-Carrito en frontend

-Cálculo de subtotal y total

-Aplicación automática de descuento

-Generación de ticket

-Actualización de stock

-Incremento de purchasesCount

Clientes

-Registro de cliente

-Búsqueda con paginación

-Identificación para descuento automático

Productos

-Crear producto (Admin)

-Editar producto (Admin)

-Eliminar producto (Admin)

Roles

-Admin: gestión de productos

-Vendedor: ventas y clientes

-Público: solo consulta de productos

💰 Regla de descuentos

El descuento se calcula exclusivamente en el backend según purchasesCount:

Compras	Descuento
0	0%
1 – 3	5%
4 – 7	10%
8+	15%

El frontend solo muestra el resultado calculado por la API.

📡 API

Base URL:

/api


Convenciones:

snake_case en API

camelCase en frontend

Endpoints principales:

Productos

GET /api/products

POST /api/products (Admin)

PUT /api/products/:id (Admin)

DELETE /api/products/:id (Admin)

Clientes

GET /api/customers

POST /api/customers

GET /api/customers/:id

DELETE /api/customers/:id (Solamente si el cliente no tiene ventas registradas)

Ventas

POST /api/sales

GET /api/sales/:id

⚠️ Manejo de errores

La API maneja los siguientes códigos de estado:

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error

Formato de error estándar:

🧠 Decisiones del proyecto

-El descuento se calcula únicamente en backend.

-Una venta con stock insuficiente se rechaza completamente.

-purchasesCount se incrementa solo cuando la venta es exitosa.

-Autorización basada en roles mediante Bearer Token.

-Validaciones de campos devuelven 422.

Recursos inexistentes devuelven 404.

🗂️ Estructura del backend
backend/
│
├── src/
│   ├── routes/         → Definición de endpoints (/products, /customers, /sales)
│   ├── controllers/    → Manejo de requests/responses (HTTP layer)
│   ├── services/       → Lógica de negocio (descuentos, stock, ventas)
│   ├── models/         → Modelos/esquemas de base de datos
│   ├── config/         → Configuración (DB, variables de entorno, incializar datos)
│   ├── utils/          → Utilidades compartidas (manejo centralizado de errores)
│   └── server.js       → Punto de entrada: inicializa Express, conecta BD y registra rutas
│
├── package.json


🗂️ Estructura del frontend
frontend/
│
├── src/
│   ├── app/
│   │   ├── components/      → Componentes reutilizables (UI)
│   │   ├── pages/           → Vistas principales (ventas, clientes, productos)
│   │   ├── core/            → Lógica central compartida
│   │   │   ├── services/    → Servicios HTTP y lógica de acceso a API
│   │   │   ├── interceptors/→ Interceptores HTTP (ej. token Authorization, Convertidor de snake_case)
│   │   │   ├── guards/      → Protección de rutas por rol (Admin / Vendor)
│   │   │   └── types/       → Interfaces y tipos TypeScript
│   │   └── app.routes.ts
│   │
│   └── styles/
│
└── angular.json

🚀 Estado del proyecto

Proyecto MVP completamente funcional según el contrato definido:

Flujo de venta completo

Aplicación correcta de descuentos

Control de stock

Manejo de errores

Autenticación y roles implementados