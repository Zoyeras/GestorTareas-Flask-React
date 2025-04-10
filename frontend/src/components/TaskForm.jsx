import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TaskForm = ({ taskToEdit }) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: taskToEdit?.title || "",
    description: taskToEdit?.description || "",
    due_date: taskToEdit?.due_date?.split('T')[0] || "", // Formato YYYY-MM-DD
    status: taskToEdit?.status || "Pendiente",
    priority: taskToEdit?.priority || "Media"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validaciones
    if (!formData.title.trim()) {
      setError("El título es obligatorio");
      return;
    }

    try {
      setLoading(true);
      const endpoint = taskToEdit ? `/tasks/${taskToEdit.id}` : "/tasks";
      const method = taskToEdit ? "put" : "post";

      await axios[method](
        `http://localhost:5000${endpoint}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar la tarea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        {taskToEdit ? "Editar Tarea" : "Nueva Tarea"}
      </h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Límite</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Prioridad *</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        {taskToEdit && (
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completada">Completada</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Guardando..." : "Guardar Tarea"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
