🚀 Gestor de Tareas - Flask (Backend) + React (Frontend)

🔧 Tecnologías principales
Componente	Tecnologías
Backend	Python 3, Flask, SQLAlchemy, JWT
Frontend	React, React Router, Axios
Base de datos	SQLite

⚙️ Requisitos previos
Python 3.10+

Node.js 16+

pip (para Python)

npm (para Node.js)

🛠️ Configuración del proyecto
1. Clonar el repositorio
   
git clone https://github.com/Zoyeras/GestorTareas-Flask-React.git

cd GestorTareas-Flask-React

3. Configurar el backend
cd Backend

python -m venv venv  # Crear entorno virtual

# Activar entorno virtual
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

pip install -r requirements.txt

3. Configurar variables de entorno
   
Crear archivo .env en la carpeta Backend:

FLASK_APP=app.py
FLASK_ENV=development
JWT_SECRET_KEY=tu_clave_secreta_aqui  # Cambiar por una clave segura
DATABASE_URL=sqlite:///database/tasks.db

4. Construir el frontend

cd ../frontend
npm install
npm run build

🚀 Ejecutar la aplicación
Iniciar el servidor backend

cd Backend

python app.py

El servidor estará disponible en: http://localhost:5000

🔐 Primeros pasos
Crear usuario administrador
El primer usuario registrado con email admin@example.com será automáticamente admin


📊 Endpoints principales
Autenticación
Método	Endpoint	Descripción
POST	/register	Registrar usuario
POST	/api/auth/login	Iniciar sesión (obtener JWT)
Tareas
Método	Endpoint	Descripción
GET	/tasks	Obtener tareas
POST	/tasks	Crear tarea
PUT	/tasks/:id	Actualizar tarea
DELETE	/tasks/:id	Eliminar tarea
Administración (solo admin)
Método	Endpoint	Descripción
GET	/admin/users	Listar usuarios
GET	/admin/tasks	Listar todas las tareas
PUT	/admin/users/:id	Actualizar usuario
DELETE	/admin/users/:id	Eliminar usuario
📌 Notas importantes
El frontend se sirve automáticamente desde el backend después de ejecutar npm run build

Para desarrollo frontend, ejecutar:

cd frontend
npm start

Para producción:

Cambiar FLASK_ENV=production

Usar un servidor WSGI como Gunicorn

Configurar una base de datos PostgreSQL

🚨 Solución de problemas
Error de conexión: Verificar que el backend esté corriendo en el puerto 5000

Problemas con JWT: Asegurar que JWT_SECRET_KEY esté configurada

Errores de base de datos: Eliminar el archivo database/tasks.db y reiniciar

📄 Licencia
MIT License
