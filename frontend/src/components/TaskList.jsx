import React, { useEffect, useState } from "react";
import axios from "axios";
import TaskDetails from "./TaskDetails"

const TaskList = ({ tasks }) => {
  // Estado para almacenar la tarea seleccionada
  const [selectedTask, setSelectedTask] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Columna izquierda - Listado de tareas */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Tus Tareas</h2>
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  task.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                  task.priority === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                {new Date(task.due_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {/* Columna derecha - Detalles de la tarea */}
        <div className="sticky top-4 h-fit">
          <TaskDetails task={selectedTask} />
        </div>
      </div>
    </div>
  );
};

export default TaskList;
