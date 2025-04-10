import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const TaskEditModal = ({ task, users, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date?.split('T')[0] || '',
    user_id: task.user_id
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  try {
    const response = await api.put(`/tasks/${task.id}`, formData);
    
    // Verificar respuesta antes de pasar datos
    if (response.data?.task?.id) {
      onSave(response.data.task);
      onClose();
    } else {
      console.error("Respuesta inválida:", response);
    }
    
    } catch (error) {
      console.error("Error actualizando tarea:", error.response?.data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Tarea</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">Título</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">Descripción</label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2">Estado</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Completada">Completada</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Prioridad</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Asignar a</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.email} (ID: {user.id})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Fecha Límite</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEditModal;
