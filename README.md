# 📝 ToDo List Full Stack

Aplicación de gestión de tareas construida con Express.js, PostgreSQL y JavaScript vanilla. Permite registro, autenticación por JWT y CRUD completo de tareas con filtros.

---

## 🚀 Tecnologías

### Backend
| Tecnología | Uso |
|------------|-----|
| 🟢 Node.js | Runtime |
| ⚡ Express 5 | Framework HTTP |
| 🐘 PostgreSQL (pg) | Base de datos |
| 🔐 JWT + bcrypt | Autenticación y hashing |
| ✅ Zod | Validación de inputs |
| 🛡️ Helmet | Headers de seguridad |
| ⏱️ express-rate-limit | Rate limiting |

### Frontend
| Tecnología | Uso |
|------------|-----|
| 📦 Vanilla JS | Lógica (ES modules) |
| 🎨 Tailwind CSS 4 | Estilos |
| 📡 Axios | Peticiones HTTP |

---

## 📁 Estructura del proyecto

```
toDoListFull/
├── backend/
│   ├── app.js                    # ⚙️  Configuración de Express
│   ├── controllers/
│   │   ├── auth.controller.js    # 🔑 Lógica de login y registro
│   │   └── task.controller.js    # 📋 Lógica de CRUD de tareas
│   ├── middleware/
│   │   └── verificarToken.js     # 🛡️  Middleware de JWT
│   ├── routes/
│   │   ├── auth.routes.js        # 🛤️  Rutas de autenticación
│   │   └── task.routes.js        # 🛤️  Rutas de tareas
│   ├── db/
│   │   └── db.js                 # 🐘 Conexión a PostgreSQL
│   ├── .env.example              # 📄 Variables de entorno de ejemplo
│   └── package.json
├── frontend/
│   ├── index.html                # 🏠 Landing page
│   ├── public/
│   │   ├── app.html              # 📋 Panel principal de tareas
│   │   ├── login.html            # 🔑 Formulario de login
│   │   └── register.html         # 📝 Formulario de registro
│   ├── js/
│   │   ├── app.js                # 🧠 Lógica del panel de tareas
│   │   ├── config.js             # ⚙️  URL del API backend
│   │   ├── login.js              # 🔑 Lógica de login
│   │   └── register.js           # 📝 Lógica de registro
│   ├── css/
│   │   ├── input.css             # 🎨 Configuración de Tailwind
│   │   └── output.css            # 🎨 CSS compilado
│   └── assets/
│       └── dog-hero.avif         # 🖼️  Imagen de la landing
```

---

## 📋 Requisitos

- 🟢 Node.js >= 18
- 🐘 PostgreSQL >= 14
- 📦 npm

---

## ⚙️ Instalación

### 1. 📥 Clonar el repositorio

```bash
git clone https://github.com/cmartinezcode/ToDoList.git
cd ToDoList
```

### 2. 🔧 Configurar variables de entorno

```bash
cd backend
cp .env.example .env
```

Editar el archivo `.env` con tus datos:

```env
PORT=5000
DATABASE_URL_EXTERNAL=postgresql://usuario:contraseña@host:5432/nombre_db
TOKEN=tu_frase_secreta_larga_para_jwt
```

### 3. 📦 Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend (opcional, solo si necesitas recompilar Tailwind)
cd ../frontend
npm install
```

### 4. 🐘 Crear las tablas en PostgreSQL

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  status BOOLEAN DEFAULT false,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. ▶️ Iniciar el servidor

```bash
cd backend
npm run dev
```

El backend estará disponible en `http://localhost:5000`.

### 6. 🌐 Abrir el frontend

Abrir `frontend/index.html` en el navegador.

> **Nota**: Si cambias el puerto del backend, actualiza `frontend/js/config.js` con la nueva URL.

---

## 📡 API Endpoints

### 🔑 Autenticación

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| `POST` | `/register` | Crear usuario | `{ "username": "...", "password": "..." }` |
| `POST` | `/login` | Iniciar sesión | `{ "username": "...", "password": "..." }` |

### 📋 Tareas *(requieren token)*

| Método | Ruta | Descripción | Body |
|--------|------|-------------|------|
| `GET` | `/tasks` | Obtener tareas del usuario | — |
| `POST` | `/tasks` | Crear tarea | `{ "name": "...", "status": false }` |
| `PUT` | `/tasks/:id` | Editar tarea | `{ "name": "...", "status": true }` |
| `DELETE` | `/tasks/:id` | Eliminar tarea | — |

**Headers requeridos** *(tareas)*:
```
Authorization: Bearer <token>
```

---

## 🛡️ Seguridad

| Medida | Detalle |
|--------|---------|
| 🛡️ Helmet | Headers de protección HTTP habilitados |
| ⏱️ Rate limiting | Máximo 10 intentos de login cada 15 min por IP |
| 🔐 JWT | Tokens con expiración de 2 horas |
| 🔒 bcrypt | Contraseñas hasheadas con 10 rounds |
| ✅ Zod | Validación de entrada en todos los endpoints |
| 🌐 CORS | Habilitado para desarrollo |

---

## 👨‍💻 Autor

**Cristian Martinez**
- 💻 [GitHub](https://github.com/cmartinezcode/)
- 💼 [LinkedIn](https://www.linkedin.com/in/cmartinezcode/)
- 📧 [Email](mailto:martinez.1705.cristian@gmail.com)

---

## 📄 Licencia

MIT
