import React from 'react';

const TaskDetails = ({ task }) => {
  if (!task) {
    return (
      <div className="text-center p-8 text-gray-500">
        Selecciona una tarea para ver los detalles
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
        {task.title}
      </h2>

      <div className="space-y-4">
        {/* Estado y Prioridad en una fila */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Estado
            </label>
            <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm capitalize">
              {task.status || 'No especificado'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Prioridad
            </label>
            <div className={`px-3 py-1.5 rounded-full text-sm ${
              task.priority === 'Alta' 
                ? 'bg-red-100 text-red-800' 
                : task.priority === 'Media' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {task.priority?.toLowerCase() || 'No especificado'}
            </div>
          </div>
        </div>

        {/* Fecha y Asignación en una fila */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Fecha Límite
            </label>
            <div className="text-gray-700">
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'Sin fecha'}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Asignada a
            </label>
            <div className="text-gray-700">
              {task.user_email || 'Usuario no asignado'}
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Descripción
          </label>
          <div className="p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-line">
            {task.description || 'No hay descripción disponible'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
