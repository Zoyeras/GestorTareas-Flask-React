import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import AssignTask from '../components/AssignTask';
import UserEditModal from '../components/UserEditModal';
import TaskEditModal from '../components/TaskEditModal';

const AdminsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const refreshData = async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/tasks')
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error("Error actualizando datos:", error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      refreshData().finally(() => setLoading(false));
    }
  }, [user]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
              
      // Actualizar tareas eliminando las del usuario
      setTasks(prevTasks => prevTasks.filter(task => task.user_id !== userId));
      
      setSuccessMessage('Usuario y tareas eliminados exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error("Error eliminando usuario:", error);
      }
    }
  };

  const handleUpdateUser = async (updatedUser) => {

    try {
      await api.put(`/admin/users/${updatedUser.id}`, updatedUser);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSelectedUser(null);
    } catch (error) {
      console.error("Error actualizando usuario:", error);
    }
  };

  const handleUpdateTask = async (updatedTaskData) => {
  try {
    const response = await api.put(`/tasks/${updatedTaskData.id}`, updatedTaskData);
    setTasks(tasks.map(task => 
      task.id === updatedTaskData.id ? response.data.task : task
    ));
    setSuccessMessage('✅ Tarea actualizada correctamente');
    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (error) {
    console.error("Error actualizando tarea:", error);
  }
};

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/admin/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      setSuccessMessage('🗑️ Tarea eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error eliminando tarea:", error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    const dateMatch = !dueDateFilter || (task.due_date && task.due_date === dueDateFilter);
    return statusMatch && priorityMatch && dateMatch;
  });

  if (user?.role !== 'admin') {
    return <div className="text-center py-8">Acceso restringido a administradores</div>;
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded animate-fade-in z-50">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Usuarios Registrados</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map(usr => (
            <div key={usr.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{usr.email}</p>
                  <p className="text-sm text-gray-600">Rol: {usr.role}</p>
                  <p className="text-sm text-gray-600">
                    Registrado: {new Date(usr.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => setSelectedUser(usr)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteUser(usr.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleUpdateUser}
        />
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4">Todas las Tareas</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex flex-col">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En progreso">En progreso</option>
              <option value="Completada">Completada</option>
            </select>
          </div>

          <div className="flex flex-col">
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>

          <div className="flex flex-col">
            <input
              type="date"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="p-2 border rounded"
            />
          </div>

          <button
            onClick={() => {
              setStatusFilter('all');
              setPriorityFilter('all');
              setDueDateFilter('');
            }}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Limpiar filtros
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay tareas con los filtros seleccionados
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">
                      {task.user_email 
                        ? `Asignada a: ${task.user_email}` 
                        : "Sin asignar"
                      }
                    </p>
                    <p className="text-sm text-gray-600">Estado: {task.status}</p>
                    <p className="text-sm text-gray-600">Prioridad: {task.priority}</p>
                    {task.due_date && (
                      <p className="text-sm text-gray-600">
                        Fecha límite: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      onClick={() => setSelectedTask(task)}
                    >
                      Editar
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskEditModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  );
};

export default AdminsPage;
