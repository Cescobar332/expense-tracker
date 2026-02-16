# Especificaciones Técnicas - Sistema de Control de Finanzas Personales

## 📋 Tabla de Contenidos
1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Principios de Desarrollo](#principios-de-desarrollo)
5. [Patrones de Diseño](#patrones-de-diseño)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Base de Datos](#base-de-datos)
8. [Frontend - Diseño y UX](#frontend---diseño-y-ux)
9. [Estándares de Código](#estándares-de-código)
10. [Seguridad](#seguridad)
11. [Testing](#testing)
12. [Documentación](#documentación)

---

## 🎯 Visión General del Proyecto

### Descripción
Aplicación web para el control integral de finanzas personales que permita a los usuarios:
- Registrar y categorizar ingresos y egresos
- Gestionar metas de ahorro
- Visualizar reportes y estadísticas financieras
- Establecer presupuestos y recibir alertas
- Exportar datos financieros

### Objetivos Clave
- **Usabilidad**: Interfaz intuitiva y responsive (mobile-first)
- **Escalabilidad**: Arquitectura preparada para crecer
- **Mantenibilidad**: Código limpio, modular y bien documentado
- **Seguridad**: Protección de datos financieros sensibles
- **Performance**: Carga rápida y experiencia fluida

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript 5+
- **UI Library**: React 18+
- **Styling**: Tailwind CSS 3+
- **State Management**: Zustand o Context API + React Query
- **Gráficos**: Recharts o Chart.js
- **Validación de Formularios**: Zod + React Hook Form
- **Internacionalización**: next-intl (soporte español/inglés)

### Backend
- **Framework**: NestJS 10+
- **Lenguaje**: TypeScript 5+
- **ORM**: Prisma 5+
- **Autenticación**: JWT + Passport.js
- **Validación**: class-validator + class-transformer
- **API Documentation**: Swagger/OpenAPI

### Base de Datos
- **Principal**: PostgreSQL 15+
- **Cache**: Redis (opcional, para sesiones y cache)
- **Migraciones**: Prisma Migrate

### DevOps & Herramientas
- **Control de Versiones**: Git
- **Package Manager**: pnpm
- **Linter**: ESLint con configuración strict
- **Formatter**: Prettier
- **Pre-commit Hooks**: Husky + lint-staged
- **Containerización**: Docker + Docker Compose
- **Variables de Entorno**: dotenv

---

## 🏗️ Arquitectura del Sistema

### Arquitectura Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                  │
│              (Controllers, DTOs, Validators)             │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   CAPA DE APLICACIÓN                     │
│              (Use Cases, Application Services)           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     CAPA DE DOMINIO                      │
│         (Entities, Value Objects, Domain Services)       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  CAPA DE INFRAESTRUCTURA                 │
│        (Repositories, External Services, Database)       │
└─────────────────────────────────────────────────────────┘
```

### Justificación
- **Hexagonal** sobre microservicios: Para un MVP y equipos pequeños, hexagonal ofrece modularidad sin la complejidad operacional de microservicios
- Permite testear el dominio sin dependencias externas
- Facilita el cambio de tecnologías de infraestructura sin afectar la lógica de negocio
- Preparada para evolucionar a microservicios si es necesario

### Módulos Principales

#### Backend
```
src/
├── modules/
│   ├── auth/              # Autenticación y autorización
│   ├── users/             # Gestión de usuarios
│   ├── transactions/      # Ingresos y egresos
│   ├── categories/        # Categorías de transacciones
│   ├── budgets/           # Presupuestos
│   ├── savings/           # Metas de ahorro
│   ├── reports/           # Reportes y estadísticas
│   └── notifications/     # Alertas y notificaciones
├── shared/
│   ├── domain/            # Entities, Value Objects base
│   ├── application/       # Interfaces compartidas
│   ├── infrastructure/    # Implementaciones compartidas
│   └── utils/             # Utilidades comunes
└── config/                # Configuración global
```

Cada módulo sigue la estructura hexagonal:
```
module/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/      # Interfaces (ports)
│   └── services/          # Domain services
├── application/
│   ├── use-cases/
│   ├── dto/
│   └── services/
├── infrastructure/
│   ├── repositories/      # Implementaciones (adapters)
│   ├── persistence/       # Schemas, migrations
│   └── external/          # APIs externas
└── presentation/
    ├── controllers/
    └── validators/
```

---

## 📐 Principios de Desarrollo

### SOLID

#### Single Responsibility Principle (SRP)
- Cada clase/función debe tener una única razón para cambiar
- Separar lógica de negocio, validación, persistencia y presentación
```typescript
// ✅ CORRECTO
class TransactionValidator {
  validate(data: TransactionDTO): ValidationResult { }
}

class TransactionRepository {
  save(transaction: Transaction): Promise<void> { }
}

// ❌ INCORRECTO
class Transaction {
  validate() { }
  save() { }
  sendEmail() { }
}
```

#### Open/Closed Principle (OCP)
- Abierto para extensión, cerrado para modificación
- Usar interfaces e inyección de dependencias
```typescript
interface IPaymentMethod {
  process(amount: number): Promise<PaymentResult>;
}

class CreditCardPayment implements IPaymentMethod { }
class PayPalPayment implements IPaymentMethod { }
```

#### Liskov Substitution Principle (LSP)
- Las clases derivadas deben ser sustituibles por sus clases base
- Mantener contratos de interfaces

#### Interface Segregation Principle (ISP)
- Interfaces específicas mejor que una interfaz general
```typescript
interface IReadableRepository<T> {
  findById(id: string): Promise<T>;
  findAll(): Promise<T[]>;
}

interface IWritableRepository<T> {
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}
```

#### Dependency Inversion Principle (DIP)
- Depender de abstracciones, no de concreciones
- Usar inyección de dependencias (NestJS lo facilita con decoradores @Injectable)

### DRY (Don't Repeat Yourself)
- Extraer código repetido a funciones/clases reutilizables
- Usar composición sobre herencia
- Crear utilidades compartidas

### KISS (Keep It Simple, Stupid)
- Preferir soluciones simples sobre complejas
- Evitar sobre-ingeniería
- Código legible > código "inteligente"

### YAGNI (You Aren't Gonna Need It)
- No implementar funcionalidades hasta que sean necesarias
- Evitar optimizaciones prematuras

### Separation of Concerns
- Separar capas claramente (presentación, lógica, datos)
- Cada capa solo debe conocer la inmediatamente inferior

---

## 🎨 Patrones de Diseño

### Patrones a Implementar

#### Repository Pattern
```typescript
// Domain (Port)
interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}

// Infrastructure (Adapter)
@Injectable()
class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string): Promise<Transaction | null> {
    const data = await this.prisma.transaction.findUnique({ where: { id } });
    return data ? TransactionMapper.toDomain(data) : null;
  }
}
```

#### Service Pattern (Use Cases)
```typescript
@Injectable()
class CreateTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(dto: CreateTransactionDTO): Promise<Transaction> {
    // Validación
    // Lógica de negocio
    // Persistencia
  }
}
```

#### Factory Pattern
```typescript
class TransactionFactory {
  static create(type: TransactionType, data: TransactionData): Transaction {
    switch(type) {
      case 'INCOME':
        return new Income(data);
      case 'EXPENSE':
        return new Expense(data);
      default:
        throw new Error('Invalid transaction type');
    }
  }
}
```

#### Strategy Pattern
```typescript
interface ICalculationStrategy {
  calculate(data: CalculationData): number;
}

class SimpleInterestStrategy implements ICalculationStrategy { }
class CompoundInterestStrategy implements ICalculationStrategy { }

class SavingsCalculator {
  constructor(private strategy: ICalculationStrategy) {}
  
  calculate(data: CalculationData) {
    return this.strategy.calculate(data);
  }
}
```

#### Observer Pattern
```typescript
// Para notificaciones cuando se alcanzan metas, presupuestos, etc.
class BudgetExceededEvent {
  constructor(public budget: Budget, public exceeded: number) {}
}

@Injectable()
class BudgetService {
  async checkBudgetLimit(transaction: Transaction) {
    // Si se excede presupuesto
    this.eventEmitter.emit('budget.exceeded', new BudgetExceededEvent(budget, amount));
  }
}
```

#### DTO Pattern
```typescript
// Para transferencia de datos entre capas
class CreateTransactionDTO {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;
}
```

#### Mapper Pattern
```typescript
class TransactionMapper {
  static toDomain(raw: PrismaTransaction): Transaction {
    // Convierte de Prisma a entidad de dominio
  }

  static toPersistence(domain: Transaction): PrismaTransactionData {
    // Convierte de entidad de dominio a Prisma
  }

  static toDTO(domain: Transaction): TransactionResponseDTO {
    // Convierte de entidad de dominio a DTO de respuesta
  }
}
```

---

## 📁 Estructura del Proyecto

### Monorepo Structure
```
finance-app/
├── apps/
│   ├── web/                    # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/           # App Router
│   │   │   ├── components/
│   │   │   │   ├── ui/        # Componentes base (buttons, inputs)
│   │   │   │   ├── features/  # Componentes por feature
│   │   │   │   └── layout/    # Layout components
│   │   │   ├── lib/
│   │   │   │   ├── api/       # API clients
│   │   │   │   ├── hooks/     # Custom hooks
│   │   │   │   ├── stores/    # Estado global
│   │   │   │   └── utils/     # Utilidades
│   │   │   ├── types/
│   │   │   └── styles/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/                    # Backend NestJS
│       ├── src/
│       │   ├── modules/       # Según arquitectura hexagonal
│       │   ├── shared/
│       │   ├── config/
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── test/
│       └── package.json
│
├── packages/                   # Código compartido
│   ├── types/                 # TypeScript types compartidos
│   └── utils/                 # Utilidades compartidas
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.web
│   └── Dockerfile.api
│
├── .husky/                    # Git hooks
├── .github/                   # CI/CD workflows
├── pnpm-workspace.yaml
└── package.json
```

---

## 🗄️ Base de Datos

### PostgreSQL - Diseño del Esquema

#### Principios
- Normalización hasta 3NF (tercera forma normal)
- Uso de UUIDs para IDs (mejor para sistemas distribuidos)
- Timestamps automáticos (created_at, updated_at)
- Soft deletes cuando sea apropiado (deleted_at)
- Índices en columnas de búsqueda frecuente
- Foreign keys con ON DELETE CASCADE/SET NULL apropiados

#### Schema Principal (Prisma)
```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  firstName     String    @map("first_name")
  lastName      String    @map("last_name")
  currency      String    @default("USD")
  isActive      Boolean   @default(true) @map("is_active")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  transactions  Transaction[]
  categories    Category[]
  budgets       Budget[]
  savingsGoals  SavingsGoal[]
  
  @@map("users")
}

model Category {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  name        String
  type        String    // INCOME, EXPENSE
  color       String    @default("#000000")
  icon        String?
  isDefault   Boolean   @default(false) @map("is_default")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets      Budget[]
  
  @@unique([userId, name, type])
  @@index([userId])
  @@map("categories")
}

model Transaction {
  id          String    @id @default(uuid())
  userId      String    @map("user_id")
  categoryId  String    @map("category_id")
  amount      Decimal   @db.Decimal(15, 2)
  type        String    // INCOME, EXPENSE
  description String?
  date        DateTime
  isRecurring Boolean   @default(false) @map("is_recurring")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  
  @@index([userId])
  @@index([categoryId])
  @@index([date])
  @@index([userId, date])
  @@map("transactions")
}

model Budget {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  categoryId String    @map("category_id")
  amount     Decimal   @db.Decimal(15, 2)
  period     String    // MONTHLY, QUARTERLY, YEARLY
  startDate  DateTime  @map("start_date")
  endDate    DateTime  @map("end_date")
  alertAt    Int       @default(80) @map("alert_at") // % para alerta
  isActive   Boolean   @default(true) @map("is_active")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")
  
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  
  @@index([userId])
  @@index([userId, isActive])
  @@map("budgets")
}

model SavingsGoal {
  id            String    @id @default(uuid())
  userId        String    @map("user_id")
  name          String
  targetAmount  Decimal   @db.Decimal(15, 2) @map("target_amount")
  currentAmount Decimal   @default(0) @db.Decimal(15, 2) @map("current_amount")
  targetDate    DateTime? @map("target_date")
  isCompleted   Boolean   @default(false) @map("is_completed")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@map("savings_goals")
}
```

### Estrategia de Migraciones
- Usar Prisma Migrate para todas las migraciones
- Nombrar migraciones descriptivamente
- Nunca modificar migraciones ya aplicadas
- Backup antes de migraciones en producción
- Rollback strategy definida

---

## 🎨 Frontend - Diseño y UX

### Mobile-First Approach

#### Breakpoints (Tailwind CSS)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '375px',   // Mobile small
      'sm': '640px',   // Mobile large
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Desktop large
      '2xl': '1536px', // Desktop XL
    },
  },
}
```

#### Principios de Diseño Responsive
1. **Base**: Diseño optimizado para móvil (320px+)
2. **Progressive Enhancement**: Agregar características para pantallas más grandes
3. **Touch-First**: Botones mínimo 44x44px, espaciado generoso
4. **Performance**: Lazy loading, code splitting, optimización de imágenes

#### Componentes Responsive
```typescript
// components/ui/Button.tsx
const Button = ({ children, ...props }) => (
  <button
    className="
      px-4 py-2          /* Mobile */
      md:px-6 md:py-3    /* Tablet+ */
      text-sm            /* Mobile */
      md:text-base       /* Tablet+ */
      min-h-[44px]       /* Touch target */
    "
    {...props}
  >
    {children}
  </button>
);
```

### Diseño de UX

#### Dashboard Principal
- Resumen de balance actual
- Gráfico de gastos del mes
- Transacciones recientes
- Alertas de presupuesto
- Accesos rápidos a acciones comunes

#### Navegación
- **Mobile**: Bottom navigation bar (4-5 items máx)
- **Desktop**: Sidebar navigation
- **Ambos**: Breadcrumbs para contexto

#### Formularios
- Validación en tiempo real
- Mensajes de error claros
- Auto-save cuando sea apropiado
- Confirmación antes de acciones destructivas

#### Accesibilidad (a11y)
- Cumplir WCAG 2.1 Level AA
- Navegación por teclado completa
- ARIA labels apropiados
- Contraste de color 4.5:1 mínimo
- Focus indicators visibles

### Progressive Web App (PWA)
- Instalable en dispositivos móviles
- Funcionalidad offline básica
- Service Worker para cache
- Manifest.json configurado

---

## 💻 Estándares de Código

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

### Naming Conventions

#### Variables y Funciones
```typescript
// camelCase para variables, funciones, métodos
const userBalance = 100;
function calculateTotal() {}

// PascalCase para clases, interfaces, tipos, componentes
class TransactionService {}
interface IUserRepository {}
type TransactionType = 'INCOME' | 'EXPENSE';

// UPPER_SNAKE_CASE para constantes
const MAX_TRANSACTION_AMOUNT = 1000000;
const API_BASE_URL = process.env.API_URL;
```

#### Archivos
```
// kebab-case para archivos
transaction-service.ts
user-profile.component.tsx
create-transaction.dto.ts

// PascalCase para componentes React
TransactionList.tsx
UserProfile.tsx
```

### Comentarios en el Código

#### Reglas Generales
- El código debe ser auto-explicativo en lo posible
- Comentarios explican el "por qué", no el "qué"
- Usar JSDoc para funciones públicas y clases
- Comentarios en español (consistente con el equipo)

#### JSDoc
```typescript
/**
 * Calcula el total de transacciones para un usuario en un período dado.
 * 
 * @param userId - ID del usuario
 * @param startDate - Fecha de inicio del período
 * @param endDate - Fecha de fin del período
 * @param type - Tipo de transacción (opcional)
 * @returns Total calculado como número decimal
 * @throws {NotFoundException} Si el usuario no existe
 * @throws {ValidationException} Si las fechas son inválidas
 * 
 * @example
 * ```typescript
 * const total = await calculateTotal('user-123', new Date('2024-01-01'), new Date('2024-01-31'));
 * ```
 */
async calculateTotal(
  userId: string,
  startDate: Date,
  endDate: Date,
  type?: TransactionType
): Promise<number> {
  // Implementación
}
```

#### Comentarios Inline
```typescript
// ❌ MAL - Comenta lo obvio
// Incrementa el contador
counter++;

// ✅ BIEN - Explica decisión de negocio
// Usamos 80% en lugar de 100% porque queremos alertar antes de llegar al límite
const BUDGET_ALERT_THRESHOLD = 0.8;

// ✅ BIEN - Explica workaround temporal
// TODO: Migrar a nueva API cuando esté disponible (TICKET-123)
// Solución temporal mientras backend no soporta paginación
const allTransactions = await fetchWithoutPagination();
```

#### TODOs y FIXMEs
```typescript
// TODO: [Descripción] - [Responsable] - [Fecha límite]
// TODO: Implementar cache Redis - @juanperez - 2024-03-15

// FIXME: [Descripción del bug] - [Prioridad]
// FIXME: Race condition en actualización concurrente - HIGH

// HACK: [Descripción] - [Razón]
// HACK: Redondeo manual porque toFixed() tiene issues con decimales - Ver issue #456

// NOTE: [Información importante]
// NOTE: Este endpoint requiere autenticación JWT
```

### Estructura de Funciones
```typescript
// ✅ BIEN - Funciones pequeñas, single responsibility
async function createTransaction(dto: CreateTransactionDTO): Promise<Transaction> {
  validateTransactionData(dto);
  const category = await findCategory(dto.categoryId);
  const transaction = buildTransaction(dto, category);
  await saveTransaction(transaction);
  await updateBudgetIfNeeded(transaction);
  return transaction;
}

// ❌ MAL - Función muy larga, múltiples responsabilidades
async function createTransaction(dto: CreateTransactionDTO): Promise<Transaction> {
  // 200 líneas de código haciendo validación, creación, actualización de presupuesto,
  // envío de notificaciones, actualización de reportes, etc.
}
```

### Error Handling
```typescript
// Usar excepciones específicas
class InsufficientFundsException extends HttpException {
  constructor(available: number, required: number) {
    super(
      {
        message: 'Fondos insuficientes',
        available,
        required,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

// Try-catch solo cuando se puede recuperar del error
try {
  await externalAPICall();
} catch (error) {
  logger.error('External API failed', error);
  // Usar fallback o re-lanzar
  throw new ServiceUnavailableException('Sistema de pago temporalmente no disponible');
}
```

### Imports Organization
```typescript
// 1. Imports de Node.js / externos
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@nestjs/prisma';

// 2. Imports internos de la app (absolutos)
import { Transaction } from '@/modules/transactions/domain/entities/transaction';
import { ITransactionRepository } from '@/modules/transactions/domain/repositories';

// 3. Imports relativos del mismo módulo
import { TransactionMapper } from './mappers/transaction.mapper';
import { CreateTransactionDTO } from '../dto/create-transaction.dto';
```

---

## 🔒 Seguridad

### Autenticación y Autorización

#### JWT Strategy
```typescript
// Tokens de corta duración + Refresh tokens
accessToken: {
  expiresIn: '15m',
  payload: { userId, email, role }
}

refreshToken: {
  expiresIn: '7d',
  stored: 'database', // Para revocación
}
```

#### Password Hashing
- Usar bcrypt con salt rounds >= 12
- Nunca almacenar passwords en plain text
- Implementar política de passwords fuertes

#### Rate Limiting
```typescript
// Aplicar rate limiting en rutas sensibles
@UseGuards(ThrottlerGuard)
@Throttle({ default: { ttl: 60000, limit: 10 } }) // 10 requests por minuto
@Post('login')
async login() {}
```

### Validación de Datos

#### Input Validation
```typescript
// Validar TODOS los inputs con class-validator
class CreateTransactionDTO {
  @IsNumber()
  @Min(0.01)
  @Max(999999999.99)
  amount: number;

  @IsUUID()
  categoryId: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
```

#### SQL Injection Prevention
- Usar Prisma ORM (parameterized queries automáticas)
- NUNCA concatenar strings para queries
- Validar y sanitizar inputs

#### XSS Prevention
- Sanitizar output en frontend
- Content Security Policy headers
- HttpOnly cookies para tokens

### Headers de Seguridad
```typescript
// helmet.js para headers seguros
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### CORS Configuration
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### Sensitive Data
- Variables de entorno para secrets
- Nunca commitear .env files
- Usar .env.example como template
- Encriptar datos sensibles en DB si es necesario

---

## 🧪 Testing

### Estrategia de Testing

#### Pirámide de Testing
```
        /\
       /E2E\         10% - Tests end-to-end (Playwright)
      /______\
     /        \
    /Integration\ 30% - Tests de integración (API)
   /____________\
  /              \
 /   Unit Tests   \  60% - Tests unitarios
/__________________\
```

### Unit Tests

#### Backend (Jest)
```typescript
// transaction.service.spec.ts
describe('TransactionService', () => {
  let service: TransactionService;
  let repository: MockType<ITransactionRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: ITransactionRepository,
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get(TransactionService);
    repository = module.get(ITransactionRepository);
  });

  describe('createTransaction', () => {
    it('should create a valid transaction', async () => {
      // Arrange
      const dto = createValidTransactionDTO();
      repository.save.mockResolvedValue(expectedTransaction);

      // Act
      const result = await service.create(dto);

      // Assert
      expect(result).toEqual(expectedTransaction);
      expect(repository.save).toHaveBeenCalledWith(expect.any(Transaction));
    });

    it('should throw error when amount is negative', async () => {
      // Arrange
      const dto = { ...createValidTransactionDTO(), amount: -100 };

      // Act & Assert
      await expect(service.create(dto)).rejects.toThrow(ValidationException);
    });
  });
});
```

#### Frontend (Jest + Testing Library)
```typescript
// TransactionForm.test.tsx
describe('TransactionForm', () => {
  it('should submit valid transaction', async () => {
    const onSubmit = jest.fn();
    render(<TransactionForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/monto/i), '100');
    await userEvent.selectOptions(screen.getByLabelText(/categoría/i), 'food');
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 100,
      categoryId: 'food',
      type: 'EXPENSE',
    });
  });

  it('should show validation error for invalid amount', async () => {
    render(<TransactionForm />);

    await userEvent.type(screen.getByLabelText(/monto/i), '-50');
    await userEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText(/monto debe ser positivo/i)).toBeInTheDocument();
  });
});
```

### Integration Tests
```typescript
// transactions.e2e-spec.ts
describe('Transactions API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  beforeAll(async () => {
    // Setup app y autenticación
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /transactions', () => {
    it('should create transaction successfully', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          amount: 100,
          categoryId: testCategory.id,
          type: 'EXPENSE',
          date: '2024-01-15',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.amount).toBe(100);
        });
    });
  });
});
```

### E2E Tests (Playwright)
```typescript
// transactions.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Transaction Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
  });

  test('should create new expense', async ({ page }) => {
    await page.goto('/transactions/new');
    
    await page.fill('[name=amount]', '50.00');
    await page.selectOption('[name=category]', { label: 'Comida' });
    await page.click('button[type=submit]');

    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.transaction-list')).toContainText('50.00');
  });
});
```

### Cobertura de Código
- **Objetivo mínimo**: 80% cobertura
- **Crítico**: 90%+ en lógica de negocio y casos de uso
- Configurar en Jest:
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

---

## 📚 Documentación

### README.md del Proyecto
Debe incluir:
- Descripción del proyecto
- Requisitos previos
- Instrucciones de instalación
- Comandos disponibles
- Variables de entorno
- Arquitectura general
- Cómo contribuir

### Documentación de API

#### OpenAPI/Swagger
```typescript
// Documentar todos los endpoints con decoradores
@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  @Post()
  @ApiOperation({ summary: 'Crear nueva transacción' })
  @ApiBody({ type: CreateTransactionDTO })
  @ApiResponse({ 
    status: 201, 
    description: 'Transacción creada exitosamente',
    type: TransactionResponseDTO 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiBearerAuth()
  async create(@Body() dto: CreateTransactionDTO) {}
}
```

#### DTOs Documentados
```typescript
export class CreateTransactionDTO {
  @ApiProperty({
    description: 'Monto de la transacción',
    example: 150.50,
    minimum: 0.01,
    maximum: 999999999.99,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'ID de la categoría',
    example: 'uuid-here',
  })
  @IsUUID()
  categoryId: string;
}
```

### Documentación de Código
- JSDoc en funciones públicas y complejas
- README.md en cada módulo principal
- Diagramas de arquitectura (Mermaid en MD)
- Documentación de decisiones (ADRs)

### Changelog
- Mantener CHANGELOG.md siguiendo [Keep a Changelog](https://keepachangelog.com/)
- Versionado semántico (SemVer)

---

## 🚀 Comandos y Scripts

### Development
```json
{
  "scripts": {
    "dev": "concurrently \"pnpm --filter web dev\" \"pnpm --filter api dev\"",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    
    "build": "pnpm --filter web build && pnpm --filter api build",
    "build:web": "pnpm --filter web build",
    "build:api": "pnpm --filter api build",
    
    "test": "pnpm --filter web test && pnpm --filter api test",
    "test:watch": "pnpm --filter api test:watch",
    "test:cov": "pnpm --filter api test:cov",
    "test:e2e": "pnpm --filter api test:e2e",
    
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    
    "db:migrate": "pnpm --filter api prisma migrate dev",
    "db:generate": "pnpm --filter api prisma generate",
    "db:studio": "pnpm --filter api prisma studio",
    "db:seed": "pnpm --filter api prisma db seed",
    
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
```

---

## 📋 Checklist de Implementación

### Fase 1: Configuración Inicial
- [ ] Configurar monorepo con pnpm workspaces
- [ ] Configurar Next.js con TypeScript y Tailwind
- [ ] Configurar NestJS con TypeScript
- [ ] Configurar PostgreSQL + Prisma
- [ ] Configurar Docker Compose
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Husky + lint-staged
- [ ] Crear README.md principal

### Fase 2: Autenticación y Usuarios
- [ ] Implementar entidad User
- [ ] Implementar registro de usuarios
- [ ] Implementar login con JWT
- [ ] Implementar refresh tokens
- [ ] Crear guards de autenticación
- [ ] Implementar UI de login/registro
- [ ] Tests de autenticación

### Fase 3: Categorías
- [ ] Implementar entidad Category
- [ ] CRUD de categorías
- [ ] Categorías predeterminadas
- [ ] UI de gestión de categorías
- [ ] Tests de categorías

### Fase 4: Transacciones
- [ ] Implementar entidad Transaction
- [ ] CRUD de transacciones
- [ ] Validaciones de negocio
- [ ] Filtros y búsqueda
- [ ] UI de transacciones (lista, formulario)
- [ ] Dashboard con resumen
- [ ] Tests de transacciones

### Fase 5: Presupuestos
- [ ] Implementar entidad Budget
- [ ] CRUD de presupuestos
- [ ] Cálculo de presupuesto vs gasto real
- [ ] Alertas de presupuesto
- [ ] UI de presupuestos
- [ ] Tests de presupuestos

### Fase 6: Metas de Ahorro
- [ ] Implementar entidad SavingsGoal
- [ ] CRUD de metas
- [ ] Tracking de progreso
- [ ] UI de metas de ahorro
- [ ] Tests de metas

### Fase 7: Reportes y Estadísticas
- [ ] Endpoints de reportes
- [ ] Gráficos de gastos por categoría
- [ ] Gráficos de evolución temporal
- [ ] Exportación de datos (CSV/PDF)
- [ ] UI de reportes
- [ ] Tests de reportes

### Fase 8: Notificaciones
- [ ] Sistema de eventos
- [ ] Notificaciones de presupuesto
- [ ] Notificaciones de metas
- [ ] UI de notificaciones
- [ ] Tests de notificaciones

### Fase 9: PWA y Optimizaciones
- [ ] Configurar Service Worker
- [ ] Manifest.json
- [ ] Optimización de imágenes
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Tests de performance

### Fase 10: Deployment
- [ ] Configurar CI/CD
- [ ] Preparar producción
- [ ] Migraciones de producción
- [ ] Monitoreo y logs
- [ ] Documentación de deployment

---

## 🎯 Criterios de Aceptación

### Funcionales
- ✅ Usuario puede registrarse e iniciar sesión
- ✅ Usuario puede crear/editar/eliminar transacciones
- ✅ Usuario puede categorizar transacciones
- ✅ Usuario puede establecer presupuestos y recibir alertas
- ✅ Usuario puede crear metas de ahorro
- ✅ Usuario puede ver reportes y gráficos
- ✅ Aplicación es responsive (mobile-first)
- ✅ Datos persisten correctamente

### No Funcionales
- ✅ Código sigue principios SOLID, DRY, KISS
- ✅ Arquitectura hexagonal implementada correctamente
- ✅ Cobertura de tests >= 80%
- ✅ Performance: First Contentful Paint < 2s
- ✅ Accesibilidad: WCAG 2.1 AA
- ✅ Seguridad: Sin vulnerabilidades críticas
- ✅ Documentación completa y actualizada
- ✅ Código formateado y sin errores de lint

---

## 📖 Referencias y Recursos

### Documentación Oficial
- [Next.js](https://nextjs.org/docs)
- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Libros Recomendados
- Clean Code - Robert C. Martin
- Clean Architecture - Robert C. Martin
- Domain-Driven Design - Eric Evans
- Design Patterns - Gang of Four

### Guías de Estilo
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)

---

## ⚠️ Notas Importantes para el Agente de IA

1. **Priorizar la arquitectura hexagonal** - Mantener separación clara de capas
2. **TypeScript strict mode** - No usar `any`, tipar todo correctamente
3. **Mobile-first siempre** - Diseñar primero para móvil
4. **Tests no son opcionales** - Escribir tests conforme se desarrolla
5. **Seguridad primero** - Validar todos los inputs, sanitizar outputs
6. **Commits atómicos** - Commits pequeños y descriptivos
7. **Documentar decisiones** - JSDoc en funciones complejas
8. **Performance matters** - Optimizar queries, usar índices, lazy loading
9. **Accesibilidad es requisito** - No es opcional
10. **Seguir convenciones** - Naming, estructura, comentarios

---

**Versión**: 1.0.0  
**Última actualización**: 2024-02-16  
**Autor**: Proyecto Finance App  
**Licencia**: Privada