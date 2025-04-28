import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const EditTask = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'Pendiente',
    priority: 'Media'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar datos de la tarea
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData({
          ...response.data,
          due_date: response.data.due_date?.split('T')[0] || '' // Formato para input date
        });
      } catch (err) {
        setError('Error al cargar la tarea');
      } finally {
        setLoading(false);
      }
    };

    if (user && token) fetchTask();
  }, [id, user, token]);

  // Manejar actualización
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/tasks/${id}`);
    } catch (err) {
      setError('Error al actualizar la tarea');
    }
  };

  if (loading) return <div>Cargando...</div>;

  const deleteTask = async () => {
    const confirmDelete = window.confirm("¿Estas seguro de elminar esta tarea?");
    if (!confirmDelete) return;

    try{
      await api.delete(`/tasks/${id}`,{
        headers: { Authorization: 'Bearer ${token}'}
      });
      navigate(`/tasks`);
    } catch (err){
      setError('Error al elminar la tarea');
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6">Editar Tarea</h1>
        
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {/* Campos del formulario (igual que NewTask.jsx) */}
        {/* ... */}

        <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Título</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        </div>

          <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

          <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Fecha Límite</label>
        <input
          type="date"
          name="due_date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

          <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Estado</label>
        <select
          name="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="En progreso">En progreso</option>
          <option value="Completada">Completada</option>
        </select>
      </div>

          <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Prioridad</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={deleteTask}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 ml-auto"
            > Elminar 
            </button>
        </div>
      </form>
    </div>
  );
};

export default EditTask;
