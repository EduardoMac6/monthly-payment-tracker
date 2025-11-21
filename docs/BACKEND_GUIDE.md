# 🗄️ Guía Completa de Backend - DebtLite

## 📖 Introducción

Esta guía está diseñada para alguien que **no sabe nada de backend**. Te llevará paso a paso desde cero hasta tener un backend funcional para DebtLite.

---

## 🎯 ¿Qué es un Backend?

**Backend** = La parte del servidor que:
- Almacena datos en una base de datos (en lugar de localStorage)
- Procesa lógica de negocio
- Maneja autenticación de usuarios
- Proporciona una API (Application Programming Interface) que el frontend puede llamar

**Frontend** (lo que ya tienes) = Lo que el usuario ve y con lo que interactúa
**Backend** (lo que vamos a crear) = El "cerebro" que guarda y procesa datos

---

## 🛠️ Stack Tecnológico Recomendado

### Para Principiantes: **Node.js + Express + Prisma + PostgreSQL**

#### ¿Por qué esta combinación?

1. **Node.js**
   - Usa JavaScript/TypeScript (igual que tu frontend)
   - Muy popular y fácil de encontrar recursos
   - Gran comunidad

2. **Express**
   - Framework más popular para Node.js
   - Muy simple de usar
   - Muchos tutoriales disponibles

3. **Prisma**
   - **LA MEJOR OPCIÓN PARA PRINCIPIANTES**
   - Genera código automáticamente
   - TypeScript-first (igual que tu frontend)
   - Documentación excelente
   - No necesitas escribir SQL manualmente

4. **PostgreSQL**
   - Base de datos gratuita y robusta
   - Muy confiable
   - Funciona perfectamente con Prisma

---

## 📚 Conceptos Básicos que Necesitas Entender

### 1. API (Application Programming Interface)

**¿Qué es?**
Una API es como un "menú" de funciones que el backend ofrece. El frontend "pide" cosas usando URLs especiales.

**Ejemplo:**
```
Frontend: "Dame todos los planes" → GET /api/plans
Backend: "Aquí tienes: [plan1, plan2, plan3]"
```

### 2. HTTP Methods (Métodos HTTP)

- **GET** - Obtener datos (como leer)
- **POST** - Crear algo nuevo
- **PUT** - Actualizar algo existente
- **DELETE** - Eliminar algo

### 3. Base de Datos

**localStorage** = Almacena datos en el navegador (solo en esa computadora)
**Base de datos** = Almacena datos en un servidor (accesible desde cualquier lugar)

### 4. Autenticación

**Sin backend:** Todos ven los mismos datos
**Con backend:** Cada usuario ve solo sus propios datos

---

## 🚀 Paso 1: Instalación y Setup Inicial

### 1.1 Instalar Node.js

1. Ve a [nodejs.org](https://nodejs.org/)
2. Descarga la versión LTS (Long Term Support)
3. Instala siguiendo el asistente
4. Verifica instalación:
```bash
node --version
npm --version
```

### 1.2 Instalar PostgreSQL

**Opción A: Instalación Local**
1. Ve a [postgresql.org/download](https://www.postgresql.org/download/)
2. Descarga e instala PostgreSQL
3. Recuerda la contraseña que configures

**Opción B: Usar Servicio en la Nube (MÁS FÁCIL)**
- **Supabase** (gratis): [supabase.com](https://supabase.com)
- **Railway** (gratis): [railway.app](https://railway.app)
- **ElephantSQL** (gratis): [elephantsql.com](https://www.elephantsql.com)

**Recomendación para principiantes:** Usa Supabase (tiene interfaz web muy fácil)

### 1.3 Crear Proyecto Backend

```bash
# Crear carpeta para backend
mkdir debtlite-backend
cd debtlite-backend

# Inicializar proyecto Node.js
npm init -y

# Instalar dependencias principales
npm install express cors dotenv
npm install -D typescript @types/node @types/express @types/cors ts-node nodemon

# Instalar Prisma
npm install @prisma/client
npm install -D prisma
```

### 1.4 Configurar TypeScript

Crear `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.5 Estructura Inicial de Carpetas

```
debtlite-backend/
├── src/
│   ├── index.ts          # Punto de entrada
│   ├── app.ts            # Configuración de Express
│   └── routes/           # Rutas de la API
├── prisma/
│   └── schema.prisma     # Esquema de base de datos
├── .env                  # Variables de entorno
├── package.json
└── tsconfig.json
```

---

## 🗄️ Paso 2: Configurar Base de Datos con Prisma

### 2.1 Inicializar Prisma

```bash
npx prisma init
```

Esto crea:
- `prisma/schema.prisma` - Esquema de la base de datos
- `.env` - Variables de entorno

### 2.2 Configurar Conexión a Base de Datos

Editar `.env`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/debtlite?schema=public"
```

**Si usas Supabase:**
1. Crea cuenta en Supabase
2. Crea nuevo proyecto
3. Ve a Settings → Database
4. Copia la "Connection string"
5. Pégala en `.env`

### 2.3 Crear Esquema de Base de Datos

Editar `prisma/schema.prisma`:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modelo de Usuario (para autenticación futura)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  plans     Plan[]   // Un usuario tiene muchos planes
}

// Modelo de Plan de Pago
model Plan {
  id             String          @id @default(uuid())
  userId         String          // Relación con usuario
  user           User            @relation(fields: [userId], references: [id])
  planName       String
  totalAmount    Float
  numberOfMonths Int?            // null si es one-time
  isOneTime      Boolean         @default(false)
  monthlyPayment Float
  debtOwner      String          // 'self' o 'other'
  isActive       Boolean         @default(true)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  payments       Payment[]       // Un plan tiene muchos pagos
}

// Modelo de Estado de Pago
model Payment {
  id        String   @id @default(uuid())
  planId    String
  plan      Plan     @relation(fields: [planId], references: [id])
  monthIndex Int     // 0, 1, 2, etc.
  status    String   @default("pending") // 'pending' o 'paid'
  amount    Float
  paidAt    DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2.4 Crear la Base de Datos

```bash
# Crear las tablas en la base de datos
npx prisma migrate dev --name init

# Generar el cliente de Prisma (código TypeScript)
npx prisma generate
```

**¿Qué hace esto?**
- Crea las tablas en PostgreSQL
- Genera código TypeScript que puedes usar para acceder a la base de datos

---

## 🔌 Paso 3: Crear el Servidor Express

### 3.1 Crear `src/app.ts`

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors()); // Permite que el frontend se conecte
app.use(express.json()); // Permite recibir JSON en requests

// Rutas (las crearemos después)
// app.use('/api/plans', plansRouter);

export default app;
```

### 3.2 Crear `src/index.ts`

```typescript
// src/index.ts
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
```

### 3.3 Agregar Scripts a `package.json`

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### 3.4 Probar el Servidor

```bash
npm run dev
```

Deberías ver: `🚀 Servidor corriendo en http://localhost:3000`

---

## 📡 Paso 4: Crear los Endpoints de la API

### 4.1 Crear Cliente de Prisma

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

### 4.2 Crear Controlador de Planes

```typescript
// src/controllers/plans.controller.ts
import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// GET /api/plans - Obtener todos los planes
export const getAllPlans = async (req: Request, res: Response) => {
  try {
    // TODO: Obtener userId del token de autenticación
    const userId = 'temp-user-id'; // Temporal hasta implementar auth
    
    const plans = await prisma.plan.findMany({
      where: { userId },
      include: { payments: true },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener planes' });
  }
};

// POST /api/plans - Crear nuevo plan
export const createPlan = async (req: Request, res: Response) => {
  try {
    const userId = 'temp-user-id'; // Temporal
    
    const { planName, totalAmount, numberOfMonths, isOneTime, debtOwner } = req.body;
    
    const monthlyPayment = isOneTime 
      ? totalAmount 
      : totalAmount / numberOfMonths;
    
    const plan = await prisma.plan.create({
      data: {
        userId,
        planName,
        totalAmount,
        numberOfMonths: isOneTime ? null : numberOfMonths,
        isOneTime,
        monthlyPayment,
        debtOwner,
        isActive: true
      }
    });
    
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear plan' });
  }
};

// GET /api/plans/:id - Obtener plan específico
export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { payments: true }
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener plan' });
  }
};

// PUT /api/plans/:id - Actualizar plan
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const plan = await prisma.plan.update({
      where: { id },
      data: updates
    });
    
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar plan' });
  }
};

// DELETE /api/plans/:id - Eliminar plan
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Eliminar pagos asociados primero
    await prisma.payment.deleteMany({
      where: { planId: id }
    });
    
    // Eliminar el plan
    await prisma.plan.delete({
      where: { id }
    });
    
    res.json({ message: 'Plan eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar plan' });
  }
};
```

### 4.3 Crear Rutas

```typescript
// src/routes/plans.routes.ts
import { Router } from 'express';
import * as plansController from '../controllers/plans.controller';

const router = Router();

router.get('/', plansController.getAllPlans);
router.post('/', plansController.createPlan);
router.get('/:id', plansController.getPlanById);
router.put('/:id', plansController.updatePlan);
router.delete('/:id', plansController.deletePlan);

export default router;
```

### 4.4 Conectar Rutas en `app.ts`

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import plansRouter from './routes/plans.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/plans', plansRouter);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

export default app;
```

### 4.5 Probar los Endpoints

Usa **Postman** o **Thunder Client** (extensión de VS Code):

1. **GET** `http://localhost:3000/api/health` → Debería responder `{ status: 'ok' }`
2. **POST** `http://localhost:3000/api/plans` con body:
```json
{
  "planName": "Laptop",
  "totalAmount": 15000,
  "numberOfMonths": 12,
  "isOneTime": false,
  "debtOwner": "self"
}
```

---

## 🔐 Paso 5: Autenticación (Opcional pero Recomendado)

### 5.1 Instalar Dependencias

```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

### 5.2 Crear Modelo de Usuario (ya está en schema.prisma)

### 5.3 Crear Controlador de Autenticación

```typescript
// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro';

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        // Nota: Necesitarías agregar password al modelo User
      }
    });
    
    // Generar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};
```

### 5.4 Crear Middleware de Autenticación

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

### 5.5 Proteger Rutas

```typescript
// src/routes/plans.routes.ts
import { Router } from 'express';
import * as plansController from '../controllers/plans.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

router.get('/', plansController.getAllPlans);
// ... resto de rutas
```

---

## 🔗 Paso 6: Conectar Frontend con Backend

### 6.1 Actualizar HttpClient en Frontend

Ya deberías tener `HttpClient` creado en la Fase 7 del plan de mejoras.

### 6.2 Crear ApiStorageService

```typescript
// src/services/storage/api.service.ts
import { IStorageService } from './storage.interface';
import { HttpClient } from '../api/http.client';
import { Plan, PaymentStatus } from '../../types';

export class ApiStorageService implements IStorageService {
  private http: HttpClient;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    this.http = new HttpClient(this.baseURL);
  }

  async getPlans(): Promise<Plan[]> {
    const response = await this.http.get<Plan[]>('/plans');
    return response;
  }

  async savePlan(plan: Plan): Promise<void> {
    await this.http.post('/plans', plan);
  }

  async deletePlan(planId: string): Promise<void> {
    await this.http.delete(`/plans/${planId}`);
  }

  async getPaymentStatus(planId: string): Promise<PaymentStatus[]> {
    const response = await this.http.get<PaymentStatus[]>(`/plans/${planId}/payments`);
    return response;
  }

  async savePaymentStatus(planId: string, status: PaymentStatus[]): Promise<void> {
    await this.http.put(`/plans/${planId}/payments`, { status });
  }
}
```

### 6.3 Cambiar Storage Factory

```typescript
// src/services/storage/storage.factory.ts
import { IStorageService } from './storage.interface';
import { LocalStorageService } from './localStorage.service';
import { ApiStorageService } from './api.service';

export class StorageFactory {
  static create(): IStorageService {
    const storageType = import.meta.env.VITE_STORAGE_TYPE || 'localStorage';
    
    if (storageType === 'api') {
      return new ApiStorageService();
    }
    
    return new LocalStorageService();
  }
}
```

---

## 📦 Paso 7: Deployment (Despliegue)

### Opción 1: Railway (Recomendado para Principiantes)

1. Crea cuenta en [railway.app](https://railway.app)
2. Conecta tu repositorio de GitHub
3. Railway detecta automáticamente Node.js
4. Agrega variables de entorno:
   - `DATABASE_URL` (Railway puede crear PostgreSQL automáticamente)
   - `JWT_SECRET`
   - `PORT`
5. ¡Listo! Tu API estará en línea

### Opción 2: Render

Similar a Railway, muy fácil de usar.

### Opción 3: Heroku

Gratis para proyectos pequeños, pero más complejo.

---

## 📚 Recursos de Aprendizaje

### Tutoriales Recomendados
1. **Prisma Getting Started** - [prisma.io/docs/getting-started](https://www.prisma.io/docs/getting-started)
2. **Express.js Guide** - [expressjs.com/en/guide/routing.html](https://expressjs.com/en/guide/routing.html)
3. **Node.js Tutorial** - [nodejs.org/en/docs/guides](https://nodejs.org/en/docs/guides)

### Videos en YouTube
- "Node.js + Express + Prisma Tutorial" (busca en YouTube)
- "PostgreSQL para Principiantes"
- "JWT Authentication Tutorial"

### Documentación Oficial
- **Prisma:** [prisma.io/docs](https://www.prisma.io/docs) ⭐ **LA MEJOR**
- **Express:** [expressjs.com](https://expressjs.com)
- **PostgreSQL:** [postgresql.org/docs](https://www.postgresql.org/docs)

---

## ✅ Checklist de Implementación

### Setup Inicial
- [ ] Node.js instalado
- [ ] PostgreSQL configurado (local o en la nube)
- [ ] Proyecto inicializado
- [ ] Dependencias instaladas

### Base de Datos
- [ ] Prisma inicializado
- [ ] Esquema creado
- [ ] Migraciones ejecutadas
- [ ] Cliente Prisma generado

### API
- [ ] Servidor Express funcionando
- [ ] Endpoints de planes creados
- [ ] Endpoints probados con Postman

### Autenticación (Opcional)
- [ ] Modelo de usuario creado
- [ ] Registro implementado
- [ ] Login implementado
- [ ] Middleware de autenticación
- [ ] Rutas protegidas

### Frontend
- [ ] HttpClient implementado
- [ ] ApiStorageService creado
- [ ] Frontend conectado a API
- [ ] Estados de carga manejados

### Deployment
- [ ] Backend desplegado
- [ ] Variables de entorno configuradas
- [ ] Frontend actualizado con URL de API

---

## 🆘 Solución de Problemas Comunes

### Error: "Cannot find module '@prisma/client'"
**Solución:** Ejecuta `npx prisma generate`

### Error: "Connection refused" al conectar a PostgreSQL
**Solución:** Verifica que PostgreSQL esté corriendo y que la URL en `.env` sea correcta

### Error: "Port 3000 already in use"
**Solución:** Cambia el puerto en `.env` o mata el proceso que usa el puerto 3000

### Error: "JWT_SECRET is not defined"
**Solución:** Agrega `JWT_SECRET=tu-secreto` en `.env`

---

**¡Éxito!** Con esta guía deberías poder crear un backend funcional para DebtLite. Recuerda: **toma tu tiempo**, no tengas prisa, y prueba cada paso antes de continuar.

