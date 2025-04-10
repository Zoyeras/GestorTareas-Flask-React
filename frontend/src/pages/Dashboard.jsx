import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TaskList from '../components/TaskList';  // Usamos tu componente existente

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tasks/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, token, navigate, logout]);

  if (loading) {
    return <div className="text-center py-8">Cargando dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bienvenido, {user?.email}</h1>
      
      {/* Estadísticas */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-4">📊 Estadísticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-3 rounded">
            <p className="text-sm">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-100 p-3 rounded">
            <p className="text-sm">Completadas</p>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded">
            <p className="text-sm">En progreso</p>
            <p className="text-2xl font-bold">{stats.inProgress}</p>
          </div>
          <div className="bg-red-100 p-3 rounded">
            <p className="text-sm">Pendientes</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
        </div>
      </div>

      {/* TaskList con filtro para "recientes" (opcional) */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Tareas Recientes</h2>
        <TaskList 
          initialStatusFilter="all"  // Puedes cambiar a "Pendiente" si prefieres
          showFilter={false}         // Ocultamos el select si no es necesario
        />
      </div>

      {/* Botones de acción */}
      <div className="mt-8 flex space-x-4">
        <button 
          onClick={() => navigate('/tasks/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Crear nueva tarea
        </button>
        <button 
          onClick={() => navigate('/tasks')}
          className="border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50"
        >
          Ver todas las tareas
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
