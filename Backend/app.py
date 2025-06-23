import os
from datetime import datetime, timedelta
from functools import wraps

from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                get_jwt_identity, jwt_required)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.pool import NullPool
from werkzeug.security import check_password_hash, generate_password_hash

basedir = os.path.abspath(os.path.dirname(__file__))
frontend_dir = os.path.abspath(os.path.join(basedir, "..", "frontend", "build"))
print("Frondend dir:", frontend_dir)

app = Flask(
    __name__,
    static_folder=os.path.join(frontend_dir, "static"),
    static_url_path="/static",
)
app.config["JWT_SECRET_KEY"] = "Marinero1234"
app.config["JWT_IDENTITY_CLAIM"] = "identity"
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{os.path.join(basedir, 'database', 'tasks.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "poolclass": NullPool,
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "connect_args": {"check_same_thread": False},
    "echo": True,
}
CORS(
    app,
    origins=["http://localhost:3000"],
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

jwt = JWTManager(app)

db = SQLAlchemy(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="user")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password = generate_password_hash(password)


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime)
    status = db.Column(db.String(20), default="Pendiente")
    priority = db.Column(db.String(10), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    user = db.relationship("User", backref="tasks")

    def to_dict(self):
        try:
            due_date_str = self.due_date.strftime("%Y-%m-%d") if self.due_date else None
        except AttributeError:
            due_date_str = None

        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date.strftime("%Y-%m-%d") if self.due_date else None,
            "status": self.status,
            "priority": self.priority,
            "user_email": self.user.email if self.user else None,
            "user_id": self.user_id,
        }


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        if current_user["role"] != "admin":
            return jsonify({"error": "Acceso denegado"}), 403
        return fn(*args, **kwargs)

    return wrapper


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    file_path = os.path.join(frontend_dir, path)
    if path and os.path.exists(file_path):
        return send_from_directory(frontend_dir, path)
    elif os.path.exists(os.path.join(frontend_dir, "index.html")):
        return send_file(os.path.join(frontend_dir, "index.html"))
    else:
        return jsonify({"error": "index.html no encontrado"}), 404


# Ruta para archivos estáticos (CSS, JS, etc.)
@app.route("/static/<path:filename>")
def serve_static(filename):
    return send_from_directory("frontend/build/static", filename)


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Validar si el usuario ya existe
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "El email ya está registrado"}), 400

    # Asignar rol admin si es el primer usuario o email específico
    if email == "admin@example.com" and not User.query.filter_by(role="admin").first():
        new_user = User(email=email, role="admin")
    else:
        new_user = User(email=email, role="user")

    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario creado exitosamente"}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    print("Datos recibidos", data)
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"error": "Credenciales invalidas"}), 401
    print("Usuario encontrado. Rol:", user.role)
    token = create_access_token(identity={"id": user.id, "role": user.role})
    return (
        jsonify(
            {
                "token": token,
                "user": {"id": user.id, "email": user.email, "role": user.role},
            }
        ),
        200,
    )


@app.route("/api/admin/users", methods=["GET"])
@jwt_required()
@admin_required
def get_all_users():
    users = User.query.all()
    return (
        jsonify(
            [
                {
                    "id": u.id,
                    "email": u.email,
                    "role": u.role,
                    "created_at": u.created_at.isoformat() if u.created_at else None,
                }
                for u in users
            ]
        ),
        200,
    )


@app.route("/api/admin/tasks", methods=["GET"])
@jwt_required()
@admin_required
def get_all_tasks():
    current_user = get_jwt_identity()

    # Verificar rol de administrador
    if current_user["role"] != "admin":
        return (
            jsonify({"error": "Acceso denegado: Se requiere rol de administrador"}),
            403,
        )

    # Obtener todas las tareas
    tasks = Task.query.all()

    return jsonify([task.to_dict() for task in tasks]), 200


# Asignar tarea a usuario (solo admin)
@app.route("/api/admin/tasks/<int:task_id>/assign", methods=["PATCH"])
@jwt_required()
@admin_required
def assign_task(task_id):
    try:
        data = request.get_json()
        if not data or "user_id" not in data:
            return jsonify({"error": "user_id es requerido"}), 400

        # Verificar existencia de task y user
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Tarea no encontrada"}), 404

        user = User.query.get(data["user_id"])
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        # Realizar asignación
        task.user_id = user.id
        db.session.commit()
        db.session.refresh(task)

        return (
            jsonify(
                {
                    "message": f"✅ Tarea asignada a {user.email}",
                    "assigned_user": {
                        "id": user.id,
                        "email": user.email,
                        "role": user.role,
                    },
                    "task": task.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error en asignación: {str(e)}")
        return jsonify({"error": "Error interno del servidor"}), 500


# Eliminar cualquier tarea (solo admin)
@app.route("/api/admin/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def admin_delete_task(task_id):
    current_user = get_jwt_identity()
    if current_user["role"] != "admin":
        return jsonify({"error": "Acceso denegado"}), 403

    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Tarea eliminada"}), 200


@app.route("/api/admin/users/<int:user_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_user(user_id):
    current_user = get_jwt_identity()

    # Solo admin puede modificar usuarios
    if current_user["role"] != "admin":
        return jsonify({"error": "Acceso denegado"}), 403

    data = request.get_json()
    user = User.query.get_or_404(user_id)

    # Validar campos
    if "email" in data and data["email"] != user.email:
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "El email ya está en uso"}), 400
        user.email = data["email"]

    if "role" in data and data["role"] in ["user", "admin"]:
        user.role = data["role"]
    elif "role" in data:
        return jsonify({"error": "Rol inválido"}), 400

    if "password" in data and data["password"]:
        user.set_password(data["password"])

    db.session.commit()
    return (
        jsonify(
            {
                "message": "Usuario actualizado",
                "user": {"id": user.id, "email": user.email, "role": user.role},
            }
        ),
        200,
    )


@app.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_user(user_id):
    current_user = get_jwt_identity()

    if current_user["role"] != "admin":
        return jsonify({"error": "Acceso denegado"}), 403

    user = User.query.get_or_404(user_id)

    # Evitar auto-eliminación
    if user.id == current_user["id"]:
        return jsonify({"error": "No puedes eliminarte a ti mismo"}), 400
    Task.query.filter_by(user_id=user_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Usuario eliminado"}), 200


@app.route("/api/admin/dashboard")
@jwt_required()
def admin_dashboard():
    current_user = get_jwt_identity()
    if current_user["role"] != "admin":
        return jsonify({"error": "Acceso denegado"}), 403
    return jsonify({"message": "Bienvenido, admin"})


@app.route("/api/admin/tasks", methods=["POST"])
@jwt_required()
@admin_required
def admin_create_task():
    data = request.get_json()

    if "user_id" not in data:
        return jsonify({"error": "user_id es requerido"}), 400

    user = User.query.get_or_404(data["user_id"])

    # Validar campos como en create_task normal
    if not data.get("title") or not data["title"].strip():
        return jsonify({"error": "El título es requerido"}), 422

    # Crear tarea
    new_task = Task(
        title=data["title"].strip(),
        description=data.get("description", "").strip(),
        due_date=(
            datetime.strptime(data["due_date"], "%Y-%m-%d")
            if data.get("due_date")
            else None
        ),
        status=data.get("status", "Pendiente"),
        priority=data["priority"].strip(),
        user_id=user.id,
    )

    db.session.add(new_task)
    db.session.commit()

    return (
        jsonify({"message": "Tarea creada como admin", "task": new_task.to_dict()}),
        201,
    )


@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_current_user():
    current_user = get_jwt_identity()
    user = User.query.get(current_user["id"])
    return jsonify({"id": user.id, "email": user.email, "role": user.role}), 200


@app.route("/api/tasks", methods=["POST"])
@jwt_required()
def create_task():
    current_user = get_jwt_identity()
    data = request.get_json()

    # Validación mejorada con mensajes específicos
    if current_user["role"] == "admin":
        if "user_id" not in data:
            return jsonify({"error": "user_id es requerido para administradores"}), 400
        user_id = data["user_id"]
        if not User.query.get(user_id):
            return jsonify({"error": "Usuario no encontrado"}), 404
    if not data:
        return jsonify({"error": "Datos no proporcionados"}), 422

    if "title" not in data or not data["title"].strip():
        return jsonify({"error": "El título es requerido"}), 422

    if "priority" not in data or not data["priority"].strip():
        return jsonify({"error": "La prioridad es requerida"}), 422

    # Manejo de fecha
    due_date = None
    if data.get("due_date"):
        try:
            due_date = datetime.strptime(data["due_date"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido. Use YYYY-MM-DD"}), 422

    # Crear tarea
    try:
        new_task = Task(
            title=data["title"].strip(),
            description=data.get("description", "").strip(),
            due_date=due_date,
            status="Pendiente",
            priority=data["priority"].strip(),
            user_id=current_user["id"],
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify({"message": "Tarea creada!", "id": new_task.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    current_user = get_jwt_identity()
    try:
        query = Task.query.filter_by(user_id=current_user["id"])
        # ... (filtro por estado)
        tasks = query.all()
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        return jsonify({"error": "Error al procesar las tareas"}), 500


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    try:
        current_user = get_jwt_identity()
        task = Task.query.get_or_404(task_id)

        # Solo admin puede editar tareas de otros
        if task.user_id != current_user["id"] and current_user["role"] != "admin":
            return jsonify({"error": "No autorizado"}), 403

        db.session.delete(task)
        db.session.commit()

        return jsonify({"message": "Tarea eliminada"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route("/api/tasks/<int:task_id>", methods=["GET"])
@jwt_required()
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    current_user = get_jwt_identity()

    # Verificar permisos: usuario dueño o admin
    if task.user_id != current_user["id"] and current_user["role"] != "admin":
        return jsonify({"error": "No autorizado"}), 403

    return jsonify(task.to_dict()), 200


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    current_user = get_jwt_identity()
    task = Task.query.get_or_404(task_id)

    # Verificar permisos
    if task.user_id != current_user["id"] and current_user["role"] != "admin":
        return jsonify({"error": "No autorizado"}), 403

    data = request.get_json()

    # Actualizar user_id si es enviado
    if "user_id" in data:
        new_user = User.query.get(data["user_id"])
        if not new_user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        task.user_id = new_user.id

    # Actualizar otros campos
    task.title = data.get("title", task.title)
    task.description = data.get("description", task.description)
    task.status = data.get("status", task.status)
    task.priority = data.get("priority", task.priority)

    # Manejar fecha
    if data.get("due_date"):
        try:
            task.due_date = datetime.strptime(data["due_date"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido"}), 400

    db.session.commit()

    # Forzar recarga de la relación user
    db.session.expire(task, ["user"])  # 👈 ¡Clave!
    db.session.refresh(task)

    return (
        jsonify(
            {
                "message": "Tarea actualizada",
                "task": task.to_dict(),  # Ahora incluirá el nuevo user_email
            }
        ),
        200,
    )


with app.app_context():
    db.create_all()
    print("Base de datos creada")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
