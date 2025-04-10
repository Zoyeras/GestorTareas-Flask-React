import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const TaskDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setTask(response.data);
      } catch (err) {
        setError('Error al cargar la tarea');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) fetchTask();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Tarea no encontrada</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <button 
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-500 hover:text-blue-700"
        >
          ← Volver
        </button>
        
        <h1 className="text-3xl font-bold mb-4">{task.title}</h1>
        <p className="text-gray-600 mb-4">{task.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-500">Estado:</span>
            <p className={`font-semibold ${
              task.status === 'Completada' ? 'text-green-600' : 
              task.status === 'En progreso' ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {task.status}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Prioridad:</span>
            <p className="font-semibold">{task.priority}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Fecha Límite:</span>
            <p className="font-semibold">{task.due_date || 'Sin fecha'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/tasks/${id}/edit`)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Editar
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Ver todas
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
