import { useState } from 'react';
import api from '../api/axiosConfig';

const AssignTask = ({ taskId, users, onAssignment }) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!selectedUserId) {
      setError('Selecciona un usuario');
      return;
    }

    setLoading(true);
    try {
      // Añadir headers explícitamente y verificar conversión numérica
      const response = await api.patch(
        `/admin/tasks/${taskId}/assign`,
        { user_id: Number(selectedUserId) },  // Usar Number() en lugar de parseInt
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Verificar respuesta exitosa
      if (response.status === 200) {
        onAssignment();
        setError('');
      }
    } catch (err) {
      // Mejorar manejo de errores
      const errorMessage = err.response?.data?.error || 
                         (err.response?.status === 500 ? 
                         'Error interno del servidor' : 
                         'Error al reasignar tarea');
      
      setError(errorMessage);
      console.error("Detalles completos del error:", {
        status: err.response?.status,
        data: err.response?.data,
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-col gap-2">
        <select
          value={selectedUserId}
          onChange={(e) => {
            setSelectedUserId(e.target.value);
            setError('');  // Resetear error al cambiar selección
          }}
          className="p-2 border rounded"
          disabled={loading}
        >
          <option value="">Seleccionar usuario</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.email} (ID: {user.id})
            </option>
          ))}
        </select>

        {error && (
          <p className="text-red-500 text-sm">
            ⚠️ {error} {error.includes("interno") && "Por favor intenta nuevamente más tarde"}
          </p>
        )}

        <button
          onClick={handleAssign}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!selectedUserId || loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin">↻</span>
              Asignando...
            </div>
          ) : (
            "Confirmar asignación"
          )}
        </button>
      </div>
    </div>
  );
};

export default AssignTask;
